"use client";

import { useState, useEffect, useCallback } from "react";
import { useTheme } from "@/hooks/use-theme";

interface UseThemeImagesOptions {
  lightImage: string;
  darkImage: string;
}

export function useThemeImages({ lightImage, darkImage }: UseThemeImagesOptions) {
  const { isDark, mounted } = useTheme();
  const [currentImage, setCurrentImage] = useState<string>(lightImage);
  const [imagesPreloaded, setImagesPreloaded] = useState<boolean>(false);

  // Pré-carrega ambas as imagens
  useEffect(() => {
    if (mounted && !imagesPreloaded) {
      const preloadImages = async () => {
        const promises = [lightImage, darkImage].map(src => {
          return new Promise<void>((resolve) => {
            const img = document.createElement('img');
            img.onload = () => resolve();
            img.onerror = () => resolve(); // Resolve mesmo com erro
            img.src = src;
          });
        });
        
        await Promise.all(promises);
        setImagesPreloaded(true);
      };
      
      preloadImages();
    }
  }, [mounted, lightImage, darkImage, imagesPreloaded]);

  // Atualiza a imagem atual quando o tema muda
  useEffect(() => {
    if (mounted && imagesPreloaded) {
      setCurrentImage(isDark ? darkImage : lightImage);
    } else if (mounted) {
      // Se as imagens ainda não foram pré-carregadas, usa a correta mesmo assim
      setCurrentImage(isDark ? darkImage : lightImage);
    }
  }, [isDark, mounted, lightImage, darkImage, imagesPreloaded]);

  // Função para forçar troca imediata (para usar no click do botão de tema)
  const switchImageImmediately = useCallback((toDark: boolean) => {
    setCurrentImage(toDark ? darkImage : lightImage);
  }, [lightImage, darkImage]);

  return {
    currentImage,
    imagesPreloaded,
    switchImageImmediately
  };
}
