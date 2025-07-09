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
        // Adiciona timeout para evitar loop infinito
        const timeoutId = setTimeout(() => {
          setIsChecking(false);
        }, 3000); // 3 segundos máximo
        
        // Verifica se há cookie de sessão do Appwrite
        const allCookies = document.cookie;
        const hasAppwriteSession = allCookies.includes('a_session_') || 
                                 allCookies.includes('bloom-drive-session') ||
                                 allCookies.includes('appwrite-session');
        
        console.log('Todos os cookies:', allCookies);
        console.log('Cookie de sessão Appwrite encontrado:', hasAppwriteSession);
        
        // Sempre tenta verificar com a API, mesmo sem cookie visível
        // (o Appwrite pode usar httpOnly cookies)
        console.log('🔍 Verificando autenticação com API...');
        console.log('🔍 URL atual:', window.location.href);
        console.log('🔍 Pathname:', window.location.pathname);
        
        const response = await fetch('/api/check-auth', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Cache-Control': 'no-cache',
          }
        });
        
        console.log('📡 Response received, status:', response.status);
        console.log('📡 Response OK:', response.ok);
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Resposta da API de auth:', data);
          console.log('✅ Status da resposta:', response.status);
          console.log('✅ Headers da resposta:', Object.fromEntries(response.headers.entries()));
          
          // Debug mais detalhado
          console.log('✅ data.isAuthenticated:', data.isAuthenticated);
          console.log('✅ Tipo de data.isAuthenticated:', typeof data.isAuthenticated);
          
          if (data.isAuthenticated === true) {
            console.log('🎉 Usuário autenticado! Redirecionando para /');
            setIsRedirecting(true);
            
            // Redireciona imediatamente - sem delay
            router.replace('/');
            return;
          } else {
            console.log('❌ Usuário NÃO autenticado. data.isAuthenticated =', data.isAuthenticated);
          }
        } else {
          console.log('❌ Erro na resposta da API de auth:', response.status);
          const errorText = await response.text();
          console.log('❌ Texto do erro:', errorText);
        }
        
        // Se chegou aqui, usuário não está autenticado
        console.log('Usuário não autenticado, permanecendo na página de login');
        
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
