"use server";

/*
 * CORREÇÃO: Sistema de Logout Aprimorado
 * 
 * O signOutUser agora usa cookieStore.set(..., "", { maxAge: 0 }) em vez de delete()
 * para garantir que os cookies sejam realmente removidos no navegador.
 * 
 * Métodos de logout disponíveis:
 * 1. Server Action: signOutUser() - usado no Header (recomendado)
 * 2. API Route: /api/logout - backup para logout via GET/POST
 * 3. Hook: useLogout() - para logout no lado do cliente quando necessário
 */

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
    const { account } = await createAdminClient();
    const session = await account.createSession(accountId, password);

    // Usar headers() do next/headers para setar o cookie no response
    const cookieStore = await cookies();
    cookieStore.set("bloom-drive-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 dias em segundos
    });

    return parseStringify({ sessionId: session.$id });
  } catch (error) {
    handleError(error, "Falha ao verificar OTP");
  }
};

export const getCurrentUser = async () => {
  try {
    const sessionClient = await createSessionClient();
    
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
    return null;
  }
};

export const signOutUser = async () => {
  "use server";
  
  try {
    const sessionClient = await createSessionClient();
    
    if (sessionClient) {
      const { account } = sessionClient;
      // Deleta todas as sessões no Appwrite
      await account.deleteSessions();
    }
  } catch (error) {
    // Continua mesmo se der erro para garantir limpeza local
    console.log("Erro ao deletar sessões no Appwrite:", error);
  }
  
  // Força a remoção dos cookies no response atual
  const cookieStore = await cookies();
  
  // Remove o cookie principal
  cookieStore.set("bloom-drive-session", "", {
    path: "/",
    httpOnly: true,
    maxAge: 0, // Expira imediatamente
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
  
  // Remove possíveis cookies do Appwrite
  cookieStore.set("a_session_" + appwriteConfig.projectId, "", {
    path: "/",
    maxAge: 0,
  });
  
  cookieStore.set("a_session_" + appwriteConfig.projectId + "_legacy", "", {
    path: "/",
    maxAge: 0,
  });
  
  redirect("/sign-in");
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
