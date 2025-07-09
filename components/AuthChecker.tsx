"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const AuthChecker = ({ children }: { children: React.ReactNode }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();

  // Evita problemas de hidratação
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Só executa verificação após montagem no cliente
    if (!isMounted) return;
    
    const checkAuth = async () => {
      try {
        // Verifica se há cookie de sessão do Appwrite
        const allCookies = document.cookie;
        const hasAppwriteSession = allCookies.includes('a_session_') || 
                                 allCookies.includes('bloom-drive-session') ||
                                 allCookies.includes('appwrite-session');
        
        console.log('🍪 Todos os cookies:', allCookies);
        console.log('🍪 Cookie de sessão Appwrite encontrado:', hasAppwriteSession);
        
        // ⚠️ MODO OFFLINE: Verifica apenas o cookie (sem API)
        // Isso evita o loop infinito quando Fast Origin Transfer está esgotado
        if (hasAppwriteSession) {
          console.log('✅ Cookie encontrado! Redirecionando para / (modo offline)');
          setIsRedirecting(true);
          
          // Redireciona após pequeno delay para mostrar o loading
          setTimeout(() => {
            router.replace('/');
          }, 500);
          return;
        }
        
        console.log('❌ Nenhum cookie de sessão encontrado - usuário não autenticado');
        
      } catch (error) {
        console.log('Auth check error:', error);
        // Erro silencioso - assume que não está autenticado
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [router, isMounted]);

  // Renderização que evita problemas de hidratação
  if (!isMounted) {
    // No servidor, renderiza apenas o children sem verificação
    return <>{children}</>;
  }

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center" suppressHydrationWarning>
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (isRedirecting) {
    return (
      <div className="flex min-h-screen items-center justify-center" suppressHydrationWarning>
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
          <p className="text-gray-600">Redirecionando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthChecker;
