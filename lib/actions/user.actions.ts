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
  try {
    const sessionClient = await createSessionClient();
    
    if (sessionClient) {
      const { account } = sessionClient;
      await account.deleteSession("current");
    }
  } catch (error) {
    // Continua mesmo se der erro para garantir limpeza local
  }
  
  try {
    // Força a remoção do cookie
    const cookieStore = await cookies();
    cookieStore.delete("bloom-drive-session");
    
    // Remove também possíveis cookies do Appwrite
    cookieStore.delete("a_session_" + appwriteConfig.projectId);
    cookieStore.delete("a_session_" + appwriteConfig.projectId + "_legacy");
  } catch (error) {
    // Ignora erros de cookie
  }
  
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

export const forceLogout = async () => {
  try {
    // Tenta fazer logout normal primeiro
    await signOutUser();
  } catch (error) {
    // Se falhar, força limpeza manual
    try {
      const cookieStore = await cookies();
      
      // Remove todos os cookies relacionados
      cookieStore.delete("bloom-drive-session");
      cookieStore.delete("a_session_" + appwriteConfig.projectId);
      cookieStore.delete("a_session_" + appwriteConfig.projectId + "_legacy");
      
    } catch (cookieError) {
      // Se mesmo a limpeza de cookies falhar, continua
    }
    
    // Força redirecionamento para login
    redirect("/sign-in");
  }
};
