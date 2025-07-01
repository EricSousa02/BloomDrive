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

    // Verifica se o usuário tem permissão para ver o arquivo
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
        { error: "Sem permissão para acessar este arquivo" },
        { status: 403 }
      );
    }

    // Busca o arquivo do storage
    const fileBuffer = await storage.getFileView(
      appwriteConfig.bucketId,
      file.bucketFileId
    );

    // Determina o Content-Type baseado na extensão
    const getContentType = (extension: string) => {
      const types: { [key: string]: string } = {
        // Imagens
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
        'svg': 'image/svg+xml',
        'bmp': 'image/bmp',
        'ico': 'image/x-icon',
        // Documentos
        'pdf': 'application/pdf',
        'txt': 'text/plain',
        'md': 'text/markdown',
        'json': 'application/json',
        'xml': 'application/xml',
        'csv': 'text/csv',
        // Vídeos
        'mp4': 'video/mp4',
        'webm': 'video/webm',
        'ogv': 'video/ogg', // Renomeado para evitar conflito
        'avi': 'video/avi',
        'mov': 'video/quicktime',
        'wmv': 'video/x-ms-wmv',
        // Áudios
        'mp3': 'audio/mpeg',
        'wav': 'audio/wav',
        'aac': 'audio/aac',
        'oga': 'audio/ogg', // Renomeado para evitar conflito
        // Documentos Office
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      };
      return types[extension.toLowerCase()] || 'application/octet-stream';
    };

    const contentType = getContentType(file.extension);
    
    // Headers específicos para diferentes tipos de mídia
    const headers: { [key: string]: string } = {
      'Content-Type': contentType,
      'Content-Disposition': `inline; filename="${file.name}"`,
    };

    // Para vídeos e áudios, adiciona suporte a range requests
    if (contentType.startsWith('video/') || contentType.startsWith('audio/')) {
      headers['Accept-Ranges'] = 'bytes';
      headers['Cache-Control'] = 'public, max-age=3600'; // Cache menor para mídia
    } else {
      headers['Cache-Control'] = 'public, max-age=31536000, immutable';
    }

    // Retorna o arquivo com headers apropriados
    return new NextResponse(fileBuffer, {
      headers,
    });

  } catch (error) {
    console.error('Erro ao buscar arquivo:', error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
