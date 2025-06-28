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

// Função simples de retry sem mensagens complexas de erro
const simpleRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 2
): Promise<T | null> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch {
      if (attempt === maxRetries) {
        return null;
      }
      // Aguarda um pouco antes de tentar novamente
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  return null;
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
    const { account } = await createAdminClient();

    const session = await account.createSession(accountId, password);

    (await cookies()).set("bloom-drive-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
      maxAge: 60 * 60 * 24 * 30, // 30 dias em segundos | expiração do token
    });

    return parseStringify({ sessionId: session.$id });
  } catch (error) {
    handleError(error, "Falha ao verificar OTP");
  }
};

export const getCurrentUser = async () => {
  try {
    console.log("🔍 getCurrentUser: Iniciando verificação...");
    
    // Verifica se há cookie de sessão
    const sessionCookie = (await cookies()).get("bloom-drive-session");
    if (!sessionCookie || !sessionCookie.value) {
      console.log("❌ getCurrentUser: Sem cookie de sessão");
      return null;
    }
    
    console.log("🍪 getCurrentUser: Cookie encontrado");
    
    const { databases, account } = await createSessionClient();
    console.log("🔗 getCurrentUser: Cliente de sessão criado");

    const result = await account.get();
    console.log("👤 getCurrentUser: Dados da conta obtidos:", result.$id);

    const user = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      [Query.equal("accountId", result.$id)],
    );

    if (user.total <= 0) {
      console.log("❌ getCurrentUser: Usuário não encontrado no banco");
      return null;
    }

    console.log("✅ getCurrentUser: Usuário encontrado:", user.documents[0].email);
    return parseStringify(user.documents[0]);
  } catch (error) {
    console.log("⚠️ getCurrentUser: Erro ao obter usuário:", error);
    return null;
  }
};

// Função para verificar se há usuário ativo e redirecionar
export const checkUserAndRedirect = async () => {
  try {
    console.log("🔍 Verificando se usuário já está autenticado...");
    
    // Primeiro verifica se há cookie de sessão
    const sessionCookie = (await cookies()).get("bloom-drive-session");
    
    if (!sessionCookie || !sessionCookie.value) {
      console.log("❌ Sem cookie de sessão - usuário não autenticado");
      return null;
    }
    
    console.log("🍪 Cookie de sessão encontrado");
    
    // Tenta obter o usuário atual
    const currentUser = await getCurrentUser();
    
    if (currentUser) {
      console.log("✅ Usuário autenticado encontrado - redirecionando para /");
      redirect("/");
    } else {
      console.log("❌ Não foi possível obter dados do usuário");
    }
    
    return currentUser;
  } catch (error) {
    console.log("⚠️ Erro ao verificar autenticação:", error);
    // Se houver erro, assume que não está autenticado
    return null;
  }
};

export const signOutUser = async () => {
  const { account } = await createSessionClient();

  try {
    await account.deleteSession("current");
    (await cookies()).delete("bloom-drive-session");
  } catch (error) {
    handleError(error, "Falha ao sair do usuário");
  } finally {
    redirect("/sign-in");
  }
};

export const signInUser = async ({ email }: { email: string }) => {
  try {
    const existingUser = await getUserByEmail(email);

    // Usuário existe, envia OTP
    if (existingUser) {
      await sendEmailOTP({ email });
      return parseStringify({ accountId: existingUser.accountId });
    }

    return parseStringify({ accountId: null, error: "Usuário não encontrado" });
  } catch {
    return parseStringify({ accountId: null, error: "Erro no servidor" });
  }
};
