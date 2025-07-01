"use client";

import { useEffect } from "react";

/**
 * Componente para suprimir avisos de hidratação causados por extensões do navegador
 * Deve ser usado apenas no layout raiz
 */
export default function HydrationZustand() {
  useEffect(() => {
    // Remove atributos de extensões que podem causar problemas de hidratação
    const removeExtensionAttributes = () => {
      const body = document.body;
      if (body) {
        // Remove atributos comuns de extensões
        body.removeAttribute('cz-shortcut-listen');
        body.removeAttribute('data-new-gr-c-s-check-loaded');
        body.removeAttribute('data-gr-ext-installed');
        body.removeAttribute('data-new-gr-c-s-loaded');
        body.removeAttribute('spellcheck');
      }
    };

    // Execute imediatamente e após um pequeno delay
    removeExtensionAttributes();
    const timer = setTimeout(removeExtensionAttributes, 100);

    return () => clearTimeout(timer);
  }, []);

  return null;
}
