"use server";

import { createAdminClient, createSessionClient } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";
import { Query, ID } from "node-appwrite";
import { parseStringify } from "@/lib/utils";
import { cookies } from "next/headers";
import { avatarPlaceholderUrl } from "@/constants";
import { redirect } from "next/navigation";

const getUserByEmail = async (email: string) => {
  const { databases } = await createAdminClient();

  const result = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.usersCollectionId,
    [Query.equal("email", [email])],
  );

  return result.total > 0 ? result.documents[0] : null;
};

const handleError = (error: unknown, message: string) => {
  console.log(error, message);
  throw error;
};

export const sendEmailOTP = async ({ email }: { email: string }) => {
  const { account } = await createAdminClient();

  try {
    const session = await account.createEmailToken(ID.unique(), email);

    return session.userId;
  } catch (error) {
    handleError(error, "Falha ao enviar OTP");
  }
};

export const createAccount = async ({
  fullName,
  email,
}: {
  fullName: string;
  email: string;
}) => {
  const existingUser = await getUserByEmail(email);

  const accountId = await sendEmailOTP({ email });
  if (!accountId) throw new Error("Falha ao enviar um OTP");

  if (!existingUser) {
    const { databases } = await createAdminClient();

    await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      ID.unique(),
      {
        fullName,
        email,
        avatar: avatarPlaceholderUrl,
        accountId,
      },
    );
  }

  return parseStringify({ accountId });
};

export const verifySecret = async ({
  accountId,
  password,
}: {
  accountId: string;
  password: string;
}) => {
  try {
    // Usar API route para garantir que o cookie seja setado corretamente
    const response = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accountId, password }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Falha ao verificar OTP');
    }

    return parseStringify({ sessionId: result.sessionId });
  } catch (error) {
    handleError(error, "Falha ao verificar OTP");
  }
};

export const getCurrentUser = async () => {
  try {
    // Verifica se há cookie de sessão primeiro
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('bloom-drive-session');
    
    if (!sessionCookie) {
      return null;
    }
    
    const sessionClient = await createSessionClient();
    
    // Se não conseguiu criar o cliente (sem sessão), retorna null
    if (!sessionClient) {
      return null;
    }
    
    const { databases, account } = sessionClient;

    const result = await account.get();

    const user = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      [Query.equal("accountId", result.$id)],
    );

    if (user.total <= 0) return null;

    return parseStringify(user.documents[0]);
  } catch (error) {
    // Log apenas para debug, não quebra a aplicação
    console.log('getCurrentUser error:', error);
    return null;
  }
};

export const signOutUser = async () => {
  try {
    // Usar API route para garantir que o cookie seja removido corretamente
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    // Silencioso - mesmo com erro, redireciona
    console.log("Erro no logout:", error);
  } finally {
    redirect("/sign-in");
  }
};

// Server action separada para ser usada em forms
export const handleSignOut = async () => {
  "use server";
  await signOutUser();
};

export const signInUser = async ({ email }: { email: string }) => {
  try {
    const existingUser = await getUserByEmail(email);

    // User exists, send OTP
    if (existingUser) {
      await sendEmailOTP({ email });
      return parseStringify({ accountId: existingUser.accountId });
    }

    return parseStringify({ accountId: null, error: "Usuário não encontrado" });
  } catch (error) {
    handleError(error, "Falha ao entrar no usuário");
  }
};
