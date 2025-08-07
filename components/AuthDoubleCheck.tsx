"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/user.actions";

export const AuthDoubleCheck = () => {
  const router = useRouter();
  const [hasChecked, setHasChecked] = useState(false); // ✅ Controla se já verificou
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    // ✅ Só executa se ainda não verificou
    if (hasChecked) return;

    // Double-check após 1 segundo do carregamento da página
    const checkAuthAfterDelay = setTimeout(async () => {
      setHasChecked(true); // ✅ Marca como verificado ANTES de começar
      setShowFeedback(true);
      
      try {
        const user = await getCurrentUser();
        
        if (user) {
          router.replace("/");
        } else {
          // Remove feedback se não há redirecionamento
          setTimeout(() => setShowFeedback(false), 500);
        }
      } catch (error) {
        // Remove feedback em caso de erro
        setTimeout(() => setShowFeedback(false), 500);
      }
    }, 1000); // 1 segundo

    // Cleanup
    return () => {
      clearTimeout(checkAuthAfterDelay);
    };
  }, [router, hasChecked]); // ✅ Dependency em hasChecked

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
