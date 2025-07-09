"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import AuthChecker from "@/components/AuthChecker";
import { SimpleThemeToggle } from "@/components/SimpleThemeToggle";
import { useSimpleTheme } from "@/components/SimpleThemeProvider";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { isDark, isMounted } = useSimpleTheme();
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkIfLoggedIn = async () => {
      console.log('🔍 Auth Layout - Iniciando verificação via API...');
      
      try {
        // Usa a mesma API que o dashboard usa
        const response = await fetch('/api/check-auth');
        const { isAuthenticated, user } = await response.json();
        
        console.log('📡 Auth Layout - Resposta da API:', { isAuthenticated, user: !!user });

        if (isAuthenticated && user) {
          console.log('🚀 Auth Layout - Usuário autenticado, redirecionando...');
          router.replace('/');
        } else {
          console.log('� Auth Layout - Usuário não autenticado, mostrando login');
          setCheckingAuth(false);
        }
      } catch (error) {
        console.log('❌ Auth Layout - Erro na verificação:', error);
        // Se der erro na API, assume que não está logado
        setCheckingAuth(false);
      }
    };

    if (isMounted) {
      console.log('🎬 Auth Layout - Componente montado, iniciando verificação');
      checkIfLoggedIn();
    }
  }, [isMounted, router]);

  // Loading enquanto verifica
  if (checkingAuth || !isMounted) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-dark-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent"></div>
          <p className="text-sm text-gray-600">Verificando autenticação...</p>
          <p className="text-xs text-gray-400">
            {!isMounted ? 'Montando componente...' : 'Aguardando cookies...'}
          </p>
        </div>
      </div>
    );
  }

  // Adiciona classe para filtro CSS no dark mode se necessário
  const logoClassName = `h-auto ${isMounted && isDark ? "auth-logo-dark" : ""}`.trim();
  
  return (
    <AuthChecker>
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
    </AuthChecker>
  );
};

export default Layout;
