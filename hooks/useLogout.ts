"use client";

import { useRouter } from "next/navigation";

export const useLogout = () => {
  const router = useRouter();

  const logout = async () => {
    try {
      // Chama a rota de logout que garante limpeza correta dos cookies
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      // Força redirecionamento no lado do cliente
      router.push('/sign-in');
      router.refresh(); // Força refresh para limpar cache
    } catch (error) {
      console.error('Erro no logout:', error);
      // Fallback: redireciona mesmo com erro
      router.push('/sign-in');
    }
  };

  return { logout };
};
