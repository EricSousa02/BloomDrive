"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type Theme = "light" | "dark";

interface SimpleThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
}

const SimpleThemeContext = createContext<SimpleThemeContextType | undefined>(undefined);

export function SimpleThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    
    // Aplica a classe no HTML
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(newTheme);
  };

  const isDark = theme === "dark";

  return (
    <SimpleThemeContext.Provider value={{ theme, toggleTheme, isDark }}>
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
