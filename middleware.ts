import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("bloom-drive-session");
  const { pathname } = request.nextUrl;

  // Rotas que requerem autenticação
  const protectedRoutes = ['/'];
  const authRoutes = ['/sign-in', '/sign-up'];

  // Verifica se é uma rota protegida
  const isProtectedRoute = protectedRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));
  const isAuthRoute = authRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));

  // Se é uma rota protegida e não tem sessão, redireciona para login
  if (isProtectedRoute && !sessionCookie) {
    console.log('🔐 Middleware - Rota protegida sem sessão, redirecionando para login');
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  // Se é uma rota de auth e tem sessão, redireciona para dashboard
  if (isAuthRoute && sessionCookie) {
    console.log('🔐 Middleware - Rota de auth com sessão, redirecionando para dashboard');
    return NextResponse.redirect(new URL('/', request.url));
  }

  const response = NextResponse.next();

  // Otimizações para rotas de API de arquivos
  if (pathname.startsWith('/api/files/')) {
    // Headers de compressão para o Vercel Edge
    response.headers.set('Accept-Encoding', 'gzip, deflate, br');
    
    // Headers de segurança
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Otimização de cache para diferentes endpoints
    if (pathname.includes('/view')) {
      response.headers.set('Vary', 'Accept-Encoding, If-None-Match');
    }
    
    if (pathname.includes('/thumbnail')) {
      // Cache mais agressivo para thumbnails
      response.headers.set('Cache-Control', 'public, max-age=86400, s-maxage=2592000');
    }
    
    if (pathname.includes('/download')) {
      // Cache moderado para downloads
      response.headers.set('Cache-Control', 'private, max-age=3600');
    }
  }

  // Para rotas estáticas (assets), adiciona cache agressivo
  if (pathname.startsWith('/assets/')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    response.headers.set('Vary', 'Accept-Encoding');
  }

  // Para rotas de API em geral, otimiza headers
  if (pathname.startsWith('/api/')) {
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};
