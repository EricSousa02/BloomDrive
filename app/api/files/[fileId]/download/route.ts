import { createAdminClient } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/actions/user.actions";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params;
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');
    
    if (!fileId) {
      return NextResponse.json(
        { error: "ID do arquivo é obrigatório" },
        { status: 400 }
      );
    }

    // Verifica se o usuário está autenticado
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    const { databases, storage } = await createAdminClient();

    // Busca o arquivo no banco de dados para verificar permissões
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

    // Verifica se o usuário tem permissão para baixar o arquivo
    // Verifica se é proprietário - múltiplas formas de comparação
    let isOwner = false;
    
    if (typeof file.owner === 'string') {
      // Se owner for string, compara diretamente
      isOwner = file.owner === currentUser.$id;
    } else if (file.owner && typeof file.owner === 'object') {
      // Se owner for objeto, verifica diferentes campos
      isOwner = file.owner.$id === currentUser.$id || 
                file.owner.accountId === currentUser.accountId;
    }
    
    // Verifica também por accountId diretamente no arquivo
    if (!isOwner && file.accountId) {
      isOwner = file.accountId === currentUser.accountId;
    }
    
    const isSharedWithUser = Array.isArray(file.users) && file.users.length > 0 &&
      file.users.some((user: any) => {
        if (typeof user === 'string') {
          return user === currentUser.email;
        }
        if (user && typeof user === 'object') {
          return user.email === currentUser.email;
        }
        return false;
      });

    if (!isOwner && !isSharedWithUser) {
      return NextResponse.json(
        { error: "Sem permissão para baixar este arquivo" },
        { status: 403 }
      );
    }

    // Busca o arquivo do storage
    const fileBuffer = await storage.getFileDownload(
      appwriteConfig.bucketId,
      file.bucketFileId
    );

    const downloadFilename = filename || file.name;

    // Retorna o arquivo para download
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${downloadFilename}"`,
        'Content-Length': fileBuffer.byteLength.toString(),
      },
    });

  } catch (error) {
    console.error('Erro ao baixar arquivo:', error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
