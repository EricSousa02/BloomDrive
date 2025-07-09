import { getCurrentUser } from "@/lib/actions/user.actions";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    // Primeiro verifica se há cookie de sessão
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('bloom-drive-session');
    
    if (!sessionCookie) {
      return NextResponse.json({
        isAuthenticated: false,
        user: null
      });
    }
    
    const user = await getCurrentUser();
    
    return NextResponse.json({
      isAuthenticated: !!user,
      user: user || null
    });
  } catch (error) {
    // Log do erro para debug, mas não quebra a API
    console.log('Check auth error:', error);
    return NextResponse.json({
      isAuthenticated: false,
      user: null
    });
  }
}
