"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('🔍 ProtectedRoute - Verificando autenticação...');
        
        const response = await fetch('/api/check-auth');
        const { isAuthenticated: authStatus } = await response.json();
        
        console.log('📡 ProtectedRoute - Status de autenticação:', authStatus);
        
        if (!authStatus) {
          console.log('🚫 ProtectedRoute - Não autenticado, redirecionando...');
          router.replace('/sign-in');
        } else {
          console.log('✅ ProtectedRoute - Autenticado, exibindo conteúdo');
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.log('❌ ProtectedRoute - Erro na verificação:', error);
        router.replace('/sign-in');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-dark-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent"></div>
          <p className="text-sm text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // O redirecionamento já aconteceu
  }

  return <>{children}</>;
};

export default ProtectedRoute;
