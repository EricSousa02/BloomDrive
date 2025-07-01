import { Client, Storage, Databases, ID, UploadProgress } from "appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";
import { getFileType } from "@/lib/utils";

// Cliente para operações do lado do cliente
export const createClientSideClient = () => {
  const client = new Client();
  
  client
    .setEndpoint(appwriteConfig.endpointUrl)
    .setProject(appwriteConfig.projectId);
    
  return {
    storage: new Storage(client),
    databases: new Databases(client),
  };
};

// Upload direto no cliente
export const uploadFileDirectly = async ({
  file,
  ownerId,
  accountId,
  onProgress,
}: {
  file: File;
  ownerId: string;
  accountId: string;
  onProgress?: (progress: UploadProgress) => void;
}) => {
  const { storage, databases } = createClientSideClient();

  try {
    // Upload direto para o Appwrite Storage
    const bucketFile = await storage.createFile(
      appwriteConfig.bucketId,
      ID.unique(),
      file,
      undefined, // permissions
      onProgress // callback de progresso
    );

    // Cria o documento no banco
    const fileDocument = {
      type: getFileType(bucketFile.name).type,
      name: bucketFile.name,
      url: `${appwriteConfig.endpointUrl}/storage/buckets/${appwriteConfig.bucketId}/files/${bucketFile.$id}/view?project=${appwriteConfig.projectId}`,
      extension: getFileType(bucketFile.name).extension,
      size: bucketFile.sizeOriginal,
      owner: ownerId,
      accountId,
      users: [],
      bucketFileId: bucketFile.$id,
    };

    const newFile = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      ID.unique(),
      fileDocument,
    );

    return parseStringify(newFile);
  } catch (error) {
    console.error("Erro no upload direto:", error);
    throw error;
  }
};

// Função para converter progresso de bytes para porcentagem
export const parseStringify = (value: any) => JSON.parse(JSON.stringify(value));
