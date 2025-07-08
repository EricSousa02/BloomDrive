/**
 * Script para monitorar e otimizar o uso de Fast Origin Transfer
 * Use este script para identificar rotas que consomem mais dados
 */

// Função para calcular tamanho de resposta estimado
export function estimateResponseSize(file: any): number {
  if (!file) return 0;
  
  // Estima baseado no tipo
  if (file.type === 'image') {
    return Math.min(file.size * 0.1, 50000); // Thumbnail comprimido
  }
  
  if (file.type === 'video' || file.type === 'audio') {
    return Math.min(file.size * 0.05, 100000); // Preview pequeno
  }
  
  return Math.min(file.size, 1000000); // Limite de 1MB para outros
}

// Headers de resposta otimizados por tamanho
export function getOptimizedHeaders(fileSize: number, contentType: string) {
  const baseHeaders = {
    'Vary': 'Accept-Encoding',
    'X-Content-Type-Options': 'nosniff',
  };
  
  // Para arquivos grandes (>1MB), cache mais agressivo
  if (fileSize > 1024 * 1024) {
    return {
      ...baseHeaders,
      'Cache-Control': 'public, max-age=2592000, s-maxage=31536000', // 30 dias / 1 ano
    };
  }
  
  // Para arquivos médios (100KB-1MB)
  if (fileSize > 100 * 1024) {
    return {
      ...baseHeaders,
      'Cache-Control': 'public, max-age=86400, s-maxage=604800', // 1 dia / 1 semana
    };
  }
  
  // Para arquivos pequenos (<100KB)
  return {
    ...baseHeaders,
    'Cache-Control': 'public, max-age=3600, s-maxage=86400', // 1 hora / 1 dia
  };
}

// Dicas de otimização para reduzir Fast Origin Transfer
export const OPTIMIZATION_TIPS = {
  images: [
    'Use API de thumbnail para previews',
    'Implemente lazy loading',
    'Use formatos WebP/AVIF quando possível',
    'Comprima imagens antes do upload',
  ],
  videos: [
    'Use previews em baixa qualidade',
    'Implemente streaming com range requests',
    'Considere usar serviços de video CDN',
  ],
  documents: [
    'Cache documentos por mais tempo',
    'Use compressão gzip/brotli',
    'Considere previews de texto apenas',
  ],
  general: [
    'Implemente ETags para cache condicional',
    'Use compression middleware',
    'Monitore usage patterns no Vercel',
    'Configure cache headers adequados',
  ],
};
