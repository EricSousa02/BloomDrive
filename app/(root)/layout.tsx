import React from "react";
import Sidebar from "@/components/Sidebar";
import MobileNavigation from "@/components/MobileNavigation";
import Header from "@/components/Header";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import { Toaster } from "@/components/ui/toaster";

export const dynamic = "force-dynamic";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) return redirect("/sign-in");

    return (
      <main className="flex h-screen">
        <Sidebar {...currentUser} />

        <section className="flex h-full flex-1 flex-col">
          <MobileNavigation {...currentUser} />
          <Header userId={currentUser.$id} accountId={currentUser.accountId} />
          <div className="main-content">{children}</div>
        </section>

        <Toaster />
      </main>
    );
  } catch (error) {
    console.log("Erro no layout:", error);
    
    // Check if it's an authentication error
    if (error && typeof error === 'object' && 'code' in error) {
      const appwriteError = error as { code: number };
      if (appwriteError.code === 401 || appwriteError.code === 403) {
        return redirect("/sign-in");
      }
    }
    
    // For server errors, show a retry page but don't force logout
    return (
      <div className="flex h-screen items-center justify-center bg-light-400">
        <div className="text-center">
          <h1 className="h1 text-light-100 mb-4">Serviço Temporariamente Indisponível</h1>
          <p className="body-1 text-light-200 mb-6">
            Estamos enfrentando problemas temporários. Tente novamente em alguns minutos.
          </p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => window.location.reload()} 
              className="primary-btn px-6 py-3"
            >
              Tentar Novamente
            </button>
            <a 
              href="/sign-in" 
              className="bg-light-300 text-light-100 px-6 py-3 rounded-full hover:bg-light-200 transition-all"
            >
              Fazer Login Novamente
            </a>
          </div>
        </div>
      </div>
    );
  }
};
export default Layout;
