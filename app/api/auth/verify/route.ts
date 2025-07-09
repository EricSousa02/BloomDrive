import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/appwrite";
import { parseStringify } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const { accountId, password } = await req.json();
    
    const { account } = await createAdminClient();
    const session = await account.createSession(accountId, password);

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
    
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "Falha ao verificar OTP" },
      { status: 401 }
    );
  }
}
