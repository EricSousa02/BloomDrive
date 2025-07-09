import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/appwrite";

export async function POST(request: NextRequest) {
  try {
    const { accountId, password } = await request.json();

    if (!accountId || !password) {
      return NextResponse.json(
        { error: "AccountId e password são obrigatórios" },
        { status: 400 }
      );
    }

    const { account } = await createAdminClient();
    const session = await account.createSession(accountId, password);

    // Criar resposta de sucesso
    const response = NextResponse.json(
      { success: true, sessionId: session.$id },
      { status: 200 }
    );

    // Setar o cookie na resposta HTTP (isso garante que seja persistido)
    response.cookies.set("bloom-drive-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 dias
    });

    return response;
  } catch (error) {
    console.log("Erro ao verificar OTP:", error);
    return NextResponse.json(
      { error: "Falha ao verificar OTP" },
      { status: 401 }
    );
  }
}
