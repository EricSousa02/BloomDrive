import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createSessionClient } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";

export async function GET() {
  try {
    // Tenta deletar sessões no Appwrite
    const sessionClient = await createSessionClient();
    if (sessionClient) {
      const { account } = sessionClient;
      await account.deleteSessions();
    }
  } catch (error) {
    // Silencioso - continua a limpeza mesmo se falhar
  }

  // Cria response de redirecionamento
  const response = NextResponse.redirect(new URL("/sign-in", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"));
  
  // Remove cookies no response
  response.cookies.set("bloom-drive-session", "", {
    path: "/",
    httpOnly: true,
    maxAge: 0,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
  
  response.cookies.set("a_session_" + appwriteConfig.projectId, "", {
    path: "/",
    maxAge: 0,
  });
  
  response.cookies.set("a_session_" + appwriteConfig.projectId + "_legacy", "", {
    path: "/",
    maxAge: 0,
  });
  
  return response;
}

export async function POST() {
  // Permite logout via POST também
  return GET();
}
