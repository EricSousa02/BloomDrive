import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Habilita compressão automática
  compress: true,
  // Otimiza para Vercel
  poweredByHeader: false,
  experimental: {
    serverActions: {
      bodySizeLimit: "50MB",
    },
    // Reduz overhead de bundle
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  images: {
    // Formatos otimizados
    formats: ['image/webp', 'image/avif'],
    // Cache de imagens
    minimumCacheTTL: 31536000, // 1 ano
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.pixabay.com",
      },
      {
        protocol: "https",
        hostname: "img.freepik.com",
      },
      {
        protocol: "https",
        hostname: "cloud.appwrite.io",
      },
      {
        protocol: "https",
        hostname: "nyc.cloud.appwrite.io",
      },
      // Permitir URLs locais para desenvolvimento
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "localhost",
      },
      // Permitir domínios da Vercel (padrão genérico)
      {
        protocol: "https",
        hostname: "*.vercel.app",
      },
    ],
    // Permitir otimização de URLs de API internas
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
  },
  // Headers globais para otimização
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=86400, stale-while-revalidate=604800',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
