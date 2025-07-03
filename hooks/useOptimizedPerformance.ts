"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Hook para otimização de performance e hidratação
 */
export const useOptimizedHydration = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Marca como hidratado imediatamente
    setIsHydrated(true);
    
    // Marca como pronto após um pequeno delay para evitar bugs visuais
    const readyTimer = setTimeout(() => {
      setIsReady(true);
    }, 100);

    return () => {
      clearTimeout(readyTimer);
    };
  }, []);

  // Function para preload de rotas
  const preloadRoute = (route: string) => {
    router.prefetch(route);
  };

  // Function para preload de múltiplas rotas
  const preloadRoutes = (routes: string[]) => {
    routes.forEach(route => router.prefetch(route));
  };

  return {
    isHydrated,
    isReady,
    preloadRoute,
    preloadRoutes,
  };
};

/**
 * Hook para debounce - útil para otimizar pesquisas e inputs
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
