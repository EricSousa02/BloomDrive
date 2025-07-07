"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      // Verifica primeiro se já há um tema definido no DOM
      const root = document.documentElement;
      const domTheme = root.getAttribute('data-theme') as Theme;
      
      if (domTheme && ["light", "dark", "system"].includes(domTheme)) {
        setThemeState(domTheme);
        return;
      }
      
      // Fallback para localStorage
      const stored = localStorage.getItem("bloom-drive-theme") as Theme;
      if (stored && ["light", "dark", "system"].includes(stored)) {
        setThemeState(stored);
      }
    } catch (error) {
      console.warn("Failed to read theme:", error);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    try {
      const root = document.documentElement;
      root.classList.remove("light", "dark");
      root.setAttribute('data-theme', theme);

      if (theme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
        root.classList.add(systemTheme);
        root.setAttribute('data-resolved-theme', systemTheme);
        
        // Escuta mudanças na preferência do sistema
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = (e: MediaQueryListEvent) => {
          const newSystemTheme = e.matches ? "dark" : "light";
          root.classList.remove("light", "dark");
          root.classList.add(newSystemTheme);
          root.setAttribute('data-resolved-theme', newSystemTheme);
        };
        
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      }

      root.classList.add(theme);
      root.setAttribute('data-resolved-theme', theme);
    } catch (error) {
      console.warn("Failed to apply theme:", error);
    }
  }, [theme, mounted]);

  const setTheme = (newTheme: Theme) => {
    try {
      localStorage.setItem("bloom-drive-theme", newTheme);
      setThemeState(newTheme);
    } catch (error) {
      console.warn("Failed to save theme to localStorage:", error);
      setThemeState(newTheme);
    }
  };

  // Determine o tema resolvido de forma mais robusta
  const getResolvedTheme = (): "light" | "dark" => {
    if (!mounted) {
      // Durante SSR, assume light como padrão
      return "light";
    }
    
    if (theme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    
    return theme as "light" | "dark";
  };

  const isDark = getResolvedTheme() === "dark";

  return { theme, setTheme, mounted, isDark, resolvedTheme: getResolvedTheme() };
}
