import { getCurrentUser } from "@/lib/actions/user.actions";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    // Verifica todos os cookies do Appwrite
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    
    console.log('Check-auth: All cookies:', allCookies.map(c => c.name));
    
    // Procura por cookies de sessão do Appwrite
    const sessionCookie = cookieStore.get('bloom-drive-session') || 
                         allCookies.find(c => c.name.startsWith('a_session_'));
    
    console.log('Check-auth: sessionCookie exists:', !!sessionCookie);
    console.log('Check-auth: sessionCookie name:', sessionCookie?.name);
    
    // Sempre tenta verificar com getCurrentUser, mesmo sem cookie visível
    // (o Appwrite pode usar httpOnly cookies ou diferentes nomes)
    console.log('Check-auth: Calling getCurrentUser...');
    const user = await getCurrentUser();
    console.log('Check-auth: getCurrentUser result:', !!user);
    console.log('Check-auth: User details:', user ? { $id: user.$id, email: user.email } : 'null');
    
    const isAuthenticated = !!user;
    console.log('Check-auth: Final isAuthenticated:', isAuthenticated);
    
    return NextResponse.json({
      isAuthenticated,
      user: user || null,
      debug: user ? `User found: ${user.email}` : 'User not found',
      cookies: allCookies.map(c => ({ name: c.name, hasValue: !!c.value })) // Para debug
    });
  } catch (error) {
    // Log do erro para debug, mas não quebra a API
    console.log('Check auth error:', error);
    console.log('Check auth error type:', typeof error);
    console.log('Check auth error message:', error instanceof Error ? error.message : 'Unknown error');
    
    return NextResponse.json({
      isAuthenticated: false,
      user: null,
      debug: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      cookies: [] // Para debug
    });
  }
}
