import { getCurrentUser } from "@/lib/actions/user.actions";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    // Primeiro verifica se há cookie de sessão
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('bloom-drive-session');
    
    console.log('Check-auth: sessionCookie exists:', !!sessionCookie);
    console.log('Check-auth: sessionCookie value:', sessionCookie?.value ? 'present' : 'empty');
    
    if (!sessionCookie) {
      console.log('Check-auth: No session cookie found');
      return NextResponse.json({
        isAuthenticated: false,
        user: null,
        debug: 'No session cookie'
      });
    }
    
    console.log('Check-auth: Calling getCurrentUser...');
    const user = await getCurrentUser();
    console.log('Check-auth: getCurrentUser result:', !!user);
    
    return NextResponse.json({
      isAuthenticated: !!user,
      user: user || null,
      debug: user ? 'User found' : 'User not found'
    });
  } catch (error) {
    // Log do erro para debug, mas não quebra a API
    console.log('Check auth error:', error);
    return NextResponse.json({
      isAuthenticated: false,
      user: null,
      debug: `Error: ${error}`
    });
  }
}
