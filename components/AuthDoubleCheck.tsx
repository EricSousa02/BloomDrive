"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/user.actions";

export const AuthDoubleCheck = () => {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    // Double-check após 1 segundo do carregamento da página
    const checkAuthAfterDelay = setTimeout(async () => {
      if (isChecking) return; // Evita múltiplas verificações
      
      setIsChecking(true);
      setShowFeedback(true); // Mostra feedback discreto
      
      try {
        console.log("🔍 AuthDoubleCheck: Verificando autenticação após 1s...");
        
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
    }, 1000); // 1 segundo

    // Cleanup
    return () => {
      clearTimeout(checkAuthAfterDelay);
    };
  }, [router, isChecking]);

  // Feedback visual mais visível (só aparece se estiver verificando)
  if (showFeedback) {
    return (
      <div className="fixed top-6 right-6 bg-brand/95 text-white px-6 py-3 rounded-lg text-sm font-medium flex items-center gap-3 z-50 shadow-lg">
        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
        Verificando autenticação...
      </div>
    );
  }

  return null;
};

export default AuthDoubleCheck;
