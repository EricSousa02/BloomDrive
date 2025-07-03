"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Componente para fazer preload das rotas principais
 * Melhora a navegação inicial
 */
export default function PreloadNavigation() {
  const router = useRouter();

  useEffect(() => {
    // Preload das rotas principais assim que o componente montar
    const routes = [
      "/",
      "/Documentos", 
      "/Imagens",
      "/Midia",
      "/Outros"
    ];

    routes.forEach(route => {
      router.prefetch(route);
    });
  }, [router]);

  return null;
}
