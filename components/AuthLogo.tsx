"use client";

import Image from "next/image";
import { useTheme } from "@/hooks/use-theme";

interface AuthLogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export function AuthLogo({ width = 300, height = 82, className }: AuthLogoProps) {
  const { isDark, mounted } = useTheme();

  // Por enquanto, sempre usa a versão original e aplica filtro via CSS se necessário
  const logoSrc = "/assets/images/bloomdrive.png";

  // Adiciona classe para filtro CSS no dark mode
  const logoClassName = `${className || ""} ${mounted && isDark ? "auth-logo-dark" : ""}`.trim();

  return (
    <Image
      src={logoSrc}
      alt="BloomDrive logo"
      width={width}
      height={height}
      className={logoClassName}
      suppressHydrationWarning={true}
      priority // Logo é importante, carrega com prioridade
    />
  );
}
