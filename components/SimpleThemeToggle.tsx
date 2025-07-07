"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSimpleTheme } from "@/components/SimpleThemeProvider";

export function SimpleThemeToggle() {
  const { theme, toggleTheme, isDark } = useSimpleTheme();

  return (
    <Button 
      variant="ghost" 
      className="theme-toggle-button"
      onClick={toggleTheme}
    >
      {isDark ? (
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      )}
      <span className="sr-only">Alternar tema</span>
    </Button>
  );
}
