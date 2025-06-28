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

// Utility function for retrying operations
const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T | null> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      console.log(`Tentativa ${attempt} falhou:`, error);
      
      // Check if it's a server error that we should retry
      if (error && typeof error === 'object' && 'code' in error) {
        const appwriteError = error as { code: number };
        
        // Don't retry client errors (4xx), only server errors (5xx)
        if (appwriteError.code < 500) {
          throw error;
        }
        
        // If it's the last attempt, don't wait
        if (attempt === maxRetries) {
          console.log("Máximo de tentativas atingido");
          return null;
        }
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      } else {
        throw error;
      }
    }
  }
  
  return null;
};

const handleError = (error: unknown, message: string) => {
  console.log(error, message);
  
  // Check if it's a network/server error
  if (error && typeof error === 'object' && 'code' in error) {
    const appwriteError = error as { code: number; message?: string };
    
    // Handle specific server errors
    if (appwriteError.code >= 500) {
      console.log("Erro do servidor detectado:", appwriteError.code);
      // Don't throw on server errors, return gracefully
      return null;
    }
  }
  
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
      maxAge: 60 * 60 * 24 * 30, // 30 days in seconds | token expiration
    });

    return parseStringify({ sessionId: session.$id });
  } catch (error) {
    handleError(error, "Falha ao verificar OTP");
  }
};

export const getCurrentUser = async () => {
  try {
    const { databases, account } = await createSessionClient();

    // First try to get the account info
    const result = await account.get();
    
    // If we got here, the session is valid, now try to get user data with retry
    const userData = await retryOperation(async () => {
      const user = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.usersCollectionId,
        [Query.equal("accountId", result.$id)],
      );

      if (user.total <= 0) return null;
      return parseStringify(user.documents[0]);
    });

    // If retry failed but session is valid, return basic user info
    if (!userData && result) {
      console.log("Usando dados básicos da sessão devido a problemas de servidor");
      return {
        $id: result.$id,
        accountId: result.$id,
        email: result.email,
        fullName: result.name || "Usuário",
        avatar: avatarPlaceholderUrl
      };
    }

    return userData;
  } catch (error) {
    console.log("Erro ao obter usuário atual:", error);
    
    // If it's a session error (unauthorized), return null to redirect to login
    if (error && typeof error === 'object' && 'code' in error) {
      const appwriteError = error as { code: number };
      if (appwriteError.code === 401 || appwriteError.code === 403) {
        return null; // Invalid session, redirect to login
      }
    }
    
    // For other errors, don't force logout
    throw error;
  }
};

// Function to check if user has a valid session cookie
export const hasValidSession = async (): Promise<boolean> => {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("bloom-drive-session");
    return !!sessionCookie?.value;
  } catch {
    return false;
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
  return await retryOperation(async () => {
    const existingUser = await getUserByEmail(email);

    // User exists, send OTP
    if (existingUser) {
      await sendEmailOTP({ email });
      return parseStringify({ accountId: existingUser.accountId });
    }

    return parseStringify({ accountId: null, error: "Usuário não encontrado" });
  }) || parseStringify({ accountId: null, error: "Serviço temporariamente indisponível" });
};
