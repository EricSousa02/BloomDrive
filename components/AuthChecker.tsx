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
        
        // Verifica se há cookie de sessão antes de fazer a requisição
        const hasSessionCookie = document.cookie.includes('bloom-drive-session');
        
        console.log('Todos os cookies:', document.cookie);
        console.log('Cookie bloom-drive-session encontrado:', hasSessionCookie);
        
        if (!hasSessionCookie) {
          clearTimeout(timeoutId);
          setIsChecking(false);
          console.log('Nenhum cookie de sessão encontrado, usuário não autenticado');
          return;
        }
        
        console.log('Cookie de sessão encontrado, verificando autenticação...');
        
        const response = await fetch('/api/check-auth', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Cache-Control': 'no-cache',
          }
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Resposta da API de auth:', data);
          
          if (data.isAuthenticated) {
            // Redireciona para a página principal
            console.log('Usuário autenticado, redirecionando para /');
            setIsRedirecting(true);
            
            // Aguarda um pouco para mostrar o loading de redirecionamento
            setTimeout(() => {
              router.replace('/');
            }, 500);
            return;
          }
        } else {
          console.log('Erro na resposta da API de auth:', response.status);
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
