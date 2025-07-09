"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Theme = "light" | "dark";

interface SimpleThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
  isMounted: boolean;
}

const SimpleThemeContext = createContext<SimpleThemeContextType | undefined>(undefined);

export function SimpleThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    
    // Aplica a classe no HTML apenas no cliente
    if (typeof window !== "undefined") {
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(newTheme);
    }
  };

  const isDark = theme === "dark";

  return (
    <SimpleThemeContext.Provider value={{ theme, toggleTheme, isDark, isMounted }}>
      {children}
    </SimpleThemeContext.Provider>
  );
}

export function useSimpleTheme() {
  const context = useContext(SimpleThemeContext);
  if (!context) {
    throw new Error("useSimpleTheme deve ser usado dentro de SimpleThemeProvider");
  }
  return context;
}
