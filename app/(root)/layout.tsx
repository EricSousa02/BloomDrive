import React from "react";
import Sidebar from "@/components/Sidebar";
import MobileNavigation from "@/components/MobileNavigation";
import Header from "@/components/Header";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { Toaster } from "@/components/ui/toaster";

export const dynamic = "force-dynamic";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  // Tenta obter o usuário, mas não redireciona - o middleware já cuida disso
  const currentUser = await getCurrentUser();

  // Se não há usuário, mostra loading - o middleware já redirecionou ou está redirecionando
  if (!currentUser) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-dark-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent"></div>
          <p className="text-sm text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

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
};
export default Layout;
