import { NextRequest } from "next/server";

/**
 * Gera um ETag baseado nos metadados do arquivo
 */
export function generateETag(fileId: string, updatedAt: string, operation: 'view' | 'download' = 'view'): string {
  return `"${operation}-${fileId}-${updatedAt}"`;
}

/**
 * Verifica se o arquivo foi modificado baseado no ETag
 */
export function isModified(request: NextRequest, etag: string): boolean {
  const ifNoneMatch = request.headers.get('if-none-match');
  return !ifNoneMatch || ifNoneMatch !== etag;
}

/**
 * Gera headers de cache otimizados baseado no tipo de arquivo
 */
export function getCacheHeaders(contentType: string, fileId: string, updatedAt: string): Record<string, string> {
  const etag = generateETag(fileId, updatedAt);
  
  const baseHeaders = {
    'ETag': etag,
    'Vary': 'Accept-Encoding',
    'X-Content-Type-Options': 'nosniff',
  };
  
  if (contentType.startsWith('image/')) {
    return {
      ...baseHeaders,
      'Cache-Control': 'public, max-age=2592000, s-maxage=31536000, immutable',
    };
  }
  
  if (contentType.startsWith('video/') || contentType.startsWith('audio/')) {
    return {
      ...baseHeaders,
      'Cache-Control': 'public, max-age=86400, s-maxage=604800',
      'Accept-Ranges': 'bytes',
      'Vary': 'Accept-Encoding, Range',
    };
  }
  
  if (contentType === 'application/pdf') {
    return {
      ...baseHeaders,
      'Cache-Control': 'public, max-age=86400, s-maxage=2592000',
    };
  }
  
  // Default para outros tipos
  return {
    ...baseHeaders,
    'Cache-Control': 'public, max-age=3600, s-maxage=86400',
  };
}

/**
 * Resposta 304 Not Modified otimizada
 */
export function createNotModifiedResponse(etag: string, cacheControl: string) {
  return new Response(null, {
    status: 304,
    headers: {
      'Cache-Control': cacheControl,
      'ETag': etag,
      'Vary': 'Accept-Encoding',
    },
  });
}
