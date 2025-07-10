"use client";

/*
 * CORREÇÃO: Loop de Redirecionamento Resolvido
 * 
 * Removido AuthChecker deste layout para evitar loop infinito:
 * 1. AuthChecker redirecionava usuários logados para "/"
 * 2. Layout root redirecionava usuários não-logados para "/sign-in"
 * 3. Resultado: loop infinito de redirecionamentos
 * 
 * Agora a verificação de auth é feita apenas no layout root.
 */

import React from "react";
import Image from "next/image";
// AuthChecker removido para evitar loop de redirecionamento
import { SimpleThemeToggle } from "@/components/SimpleThemeToggle";
import { useSimpleTheme } from "@/components/SimpleThemeProvider";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { isDark, isMounted } = useSimpleTheme();

  // Loading enquanto monta
  if (!isMounted) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-dark-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent"></div>
          <p className="text-sm text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Adiciona classe para filtro CSS no dark mode se necessário
  const logoClassName = `h-auto ${isMounted && isDark ? "auth-logo-dark" : ""}`.trim();
  
  return (
    <div className="flex min-h-screen">
      <section className="hidden w-1/2 items-center justify-center bg-brand dark:bg-brand-dark p-10 lg:flex xl:w-2/5">
        <div className="flex max-h-[800px] max-w-[430px] flex-col justify-center space-y-12">
          <Image
            src="/assets/images/bloomdrive.png"
            alt="BloomDrive logo"
            width={300}
            height={82}
            className={logoClassName}
            suppressHydrationWarning={true}
            priority
          />

          <div className="space-y-5 text-white">
            <h1 className="h1">Gerencie seus arquivos da melhor maneira</h1>
            <p className="body-1">
              Esse é um local onde você pode armazenar todos os seus documentos.
            </p>
          </div>
          <Image
            src="/assets/images/files.png"
            alt="Files"
            width={342}
            height={342}
            className="transition-all hover:rotate-2 hover:scale-105"
          />
        </div>
      </section>

      <section className="flex flex-1 flex-col items-center bg-white dark:bg-dark-100 p-4 py-10 lg:justify-center lg:p-10 lg:py-0 relative">
        {/* Theme Toggle */}
        <div className="absolute top-4 right-4">
          <SimpleThemeToggle />
        </div>
        
        <div className="mb-16 lg:hidden">
          <Image
            src="/assets/images/bloomdrive.png"
            alt="BloomDrive logo"
            width={224}
            height={82}
            className={`h-auto w-[200px] lg:w-[250px] ${isMounted && isDark ? "auth-logo-dark" : ""}`.trim()}
            suppressHydrationWarning={true}
            priority
          />
        </div>

        {children}
      </section>
    </div>
  );
};

export default Layout;
