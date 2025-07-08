import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Otimizações para rotas de API de arquivos
  if (request.nextUrl.pathname.startsWith('/api/files/')) {
    // Headers de compressão para o Vercel Edge
    response.headers.set('Accept-Encoding', 'gzip, deflate, br');
    
    // Headers de segurança
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Otimização de cache para diferentes endpoints
    if (request.nextUrl.pathname.includes('/view')) {
      response.headers.set('Vary', 'Accept-Encoding, If-None-Match');
    }
    
    if (request.nextUrl.pathname.includes('/thumbnail')) {
      // Cache mais agressivo para thumbnails
      response.headers.set('Cache-Control', 'public, max-age=86400, s-maxage=2592000');
    }
    
    if (request.nextUrl.pathname.includes('/download')) {
      // Cache moderado para downloads
      response.headers.set('Cache-Control', 'private, max-age=3600');
    }
  }

  // Para rotas estáticas (assets), adiciona cache agressivo
  if (request.nextUrl.pathname.startsWith('/assets/')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    response.headers.set('Vary', 'Accept-Encoding');
  }

  // Para rotas de API em geral, otimiza headers
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
  }

  return response;
}

export const config = {
  matcher: [
    '/api/files/:path*',
    '/api/:path*',
    '/assets/:path*',
  ],
};
