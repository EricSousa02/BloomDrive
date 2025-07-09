import { NextRequest, NextResponse } from "next/server";
import { createSessionClient } from "@/lib/appwrite";

export async function POST(request: NextRequest) {
  try {
    // Tenta deletar a sessão no Appwrite
    const sessionClient = await createSessionClient();
    
    if (sessionClient) {
      const { account } = sessionClient;
      await account.deleteSession("current");
    }

    // Criar resposta de sucesso
    const response = NextResponse.json(
      { success: true, message: "Logout realizado com sucesso" },
      { status: 200 }
    );

    // Remover o cookie na resposta HTTP
    response.cookies.delete("bloom-drive-session");

    return response;
  } catch (error) {
    console.log("Erro ao fazer logout:", error);
    
    // Mesmo com erro, remove o cookie (sessão pode ter expirado)
    const response = NextResponse.json(
      { success: true, message: "Logout realizado" },
      { status: 200 }
    );
    
    response.cookies.delete("bloom-drive-session");
    return response;
  }
}
