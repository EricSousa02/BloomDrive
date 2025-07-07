"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Verifica o tema no DOM primeiro (definido pelo script)
    const root = document.documentElement;
    const domTheme = root.getAttribute('data-theme') as Theme;
    
    if (domTheme && ["light", "dark", "system"].includes(domTheme)) {
      setThemeState(domTheme);
    } else {
      // Fallback para localStorage
      try {
        const stored = localStorage.getItem("bloom-drive-theme") as Theme;
        if (stored && ["light", "dark", "system"].includes(stored)) {
          setThemeState(stored);
        }
      } catch (error) {
        console.warn("Failed to read theme:", error);
      }
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    try {
      localStorage.setItem("bloom-drive-theme", newTheme);
      setThemeState(newTheme);
      
      const root = document.documentElement;
      root.setAttribute('data-theme', newTheme);
      root.classList.remove("light", "dark");

      if (newTheme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
        root.classList.add(systemTheme);
        root.setAttribute('data-resolved-theme', systemTheme);
      } else {
        root.classList.add(newTheme);
        root.setAttribute('data-resolved-theme', newTheme);
      }
    } catch (error) {
      console.warn("Failed to save theme:", error);
      setThemeState(newTheme);
    }
  };

  const getResolvedTheme = (): "light" | "dark" => {
    if (!mounted) return "light";
    
    if (theme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    
    return theme as "light" | "dark";
  };

  const value = {
    theme,
    setTheme,
    resolvedTheme: getResolvedTheme(),
    mounted,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeContext deve ser usado dentro de ThemeProvider");
  }
  return context;
}
