"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/user.actions";

export const AuthDoubleCheck = () => {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    // Double-check após 2 segundos do carregamento da página
    const checkAuthAfterDelay = setTimeout(async () => {
      if (isChecking) return; // Evita múltiplas verificações
      
      setIsChecking(true);
      setShowFeedback(true); // Mostra feedback discreto
      
      try {
        console.log("🔍 AuthDoubleCheck: Verificando autenticação após 2s...");
        
        const user = await getCurrentUser();
        
        if (user) {
          console.log("✅ AuthDoubleCheck: Usuário autenticado, redirecionando para dashboard");
          router.replace("/");
        } else {
          console.log("❌ AuthDoubleCheck: Usuário não autenticado, permanecendo na tela de login");
          // Remove feedback se não há redirecionamento
          setTimeout(() => setShowFeedback(false), 500);
        }
      } catch (error) {
        console.log("⚠️ AuthDoubleCheck: Erro na verificação:", error);
        // Remove feedback em caso de erro
        setTimeout(() => setShowFeedback(false), 500);
      } finally {
        setIsChecking(false);
      }
    }, 2000); // 2 segundos

    // Cleanup
    return () => {
      clearTimeout(checkAuthAfterDelay);
    };
  }, [router, isChecking]);

  // Feedback visual discreto (só aparece se estiver verificando)
  if (showFeedback) {
    return (
      <div className="fixed top-4 right-4 bg-brand/90 text-white px-3 py-1 rounded text-xs flex items-center gap-2 z-50">
        <div className="animate-spin h-3 w-3 border border-white border-t-transparent rounded-full"></div>
        Verificando...
      </div>
    );
  }

  return null;
};

export default AuthDoubleCheck;
