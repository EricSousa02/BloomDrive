import { createAdminClient } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { getCacheHeaders, isModified, createNotModifiedResponse } from "@/lib/cache-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params;
    const { searchParams } = new URL(request.url);
    const width = parseInt(searchParams.get('width') || '150');
    const height = parseInt(searchParams.get('height') || '150');
    const quality = parseInt(searchParams.get('quality') || '75');
    
    if (!fileId) {
      return NextResponse.json(
        { error: "ID do arquivo é obrigatório" },
        { status: 400 }
      );
    }

    // Limita o tamanho máximo do thumbnail para economizar banda
    const maxSize = 300;
    const finalWidth = Math.min(width, maxSize);
    const finalHeight = Math.min(height, maxSize);
    const finalQuality = Math.min(Math.max(quality, 20), 95); // Entre 20-95%

    // Verifica se o usuário está autenticado
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    const { databases, storage } = await createAdminClient();

    // Busca o arquivo no banco de dados
    const file = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId
    );

    if (!file) {
      return NextResponse.json(
        { error: "Arquivo não encontrado" },
        { status: 404 }
      );
    }

    // Verifica permissões (simplificado para thumbnail)
    let hasAccess = false;
    
    if (typeof file.owner === 'string') {
      hasAccess = file.owner === currentUser.$id;
    } else if (file.owner && typeof file.owner === 'object') {
      hasAccess = file.owner.$id === currentUser.$id || 
                 file.owner.accountId === currentUser.accountId;
    }
    
    if (!hasAccess && file.accountId) {
      hasAccess = file.accountId === currentUser.accountId;
    }

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Sem permissão para acessar este arquivo" },
        { status: 403 }
      );
    }

    // Só gera thumbnail para imagens
    if (file.type !== 'image') {
      return NextResponse.json(
        { error: "Thumbnail só disponível para imagens" },
        { status: 400 }
      );
    }

    // Gera ETag específico para o thumbnail
    const thumbnailETag = `"thumb-${fileId}-${finalWidth}x${finalHeight}-q${finalQuality}-${file.$updatedAt}"`;
    
    // Verifica cache
    if (!isModified(request, thumbnailETag)) {
      return createNotModifiedResponse(thumbnailETag, 'public, max-age=86400, s-maxage=2592000');
    }

    try {
      // Busca preview otimizado do Appwrite
      const preview = await storage.getFilePreview(
        appwriteConfig.bucketId,
        file.bucketFileId,
        finalWidth,
        finalHeight,
        undefined, // gravity
        finalQuality
      );

      // Headers otimizados para thumbnail
      const headers: Record<string, string> = {
        'Content-Type': 'image/jpeg', // Appwrite retorna JPEG por padrão
        'Cache-Control': 'public, max-age=86400, s-maxage=2592000', // 1 dia / 30 dias
        'ETag': thumbnailETag,
        'Vary': 'Accept-Encoding',
        'X-Content-Type-Options': 'nosniff',
        'Content-Length': preview.byteLength.toString(),
      };

      return new NextResponse(preview, { headers });

    } catch (previewError) {
      console.error('Erro ao gerar preview:', previewError);
      
      // Fallback: retorna ícone padrão
      return NextResponse.redirect(new URL('/assets/icons/file-image.svg', request.url));
    }

  } catch (error) {
    console.error('Erro ao buscar thumbnail:', error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
