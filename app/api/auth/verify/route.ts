import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/appwrite";
import { parseStringify } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const { accountId, password } = await req.json();
    
    console.log('🔐 API verify - Iniciando verificação para accountId:', accountId?.substring(0, 8) + '...');
    
    const { account } = await createAdminClient();
    const session = await account.createSession(accountId, password);
    
    console.log('✅ API verify - Sessão criada:', session.$id);

    const response = NextResponse.json({ 
      success: true, 
      sessionId: session.$id 
    });

    // Seta o cookie diretamente na resposta HTTP
    response.cookies.set("bloom-drive-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 dias
    });

    console.log('🍪 API verify - Cookie setado na resposta HTTP');
    
    return response;
  } catch (error) {
    console.log('❌ API verify - Erro:', error);
    return NextResponse.json(
      { error: "Falha ao verificar OTP" },
      { status: 401 }
    );
  }
}
