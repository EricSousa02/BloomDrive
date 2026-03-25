"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getCurrentUser, updateUserTheme } from "@/lib/actions/user.actions";

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

  // Carrega o tema do banco de dados ao montar
  useEffect(() => {
    const loadThemeFromDatabase = async () => {
      try {
        const user = await getCurrentUser();
        if (user && user.theme && ["light", "dark"].includes(user.theme)) {
          setTheme(user.theme);
          
          // Aplica a classe no HTML
          if (typeof window !== "undefined") {
            document.documentElement.classList.remove("light", "dark");
            document.documentElement.classList.add(user.theme);
          }
        }
      } catch (error) {
        console.warn("Falha ao carregar tema do banco:", error);
      }
      setIsMounted(true);
    };

    loadThemeFromDatabase();
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    
    // Aplica a classe no HTML apenas no cliente
    if (typeof window !== "undefined") {
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(newTheme);
    }

    // Salva o novo tema no banco de dados
    try {
      await updateUserTheme({ theme: newTheme });
    } catch (error) {
      console.warn("Falha ao salvar tema no banco:", error);
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
