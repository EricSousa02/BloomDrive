/*
 * CORREÇÃO: Loop de Redirecionamento Resolvido
 * 
 * Removido AuthChecker deste layout para evitar loop infinito:
 * 1. AuthChecker redirecionava usuários logados para "/"
 * 2. Layout root redirecionava usuários não-logados para "/sign-in"
 * 3. Resultado: loop infinito de redirecionamentos
 * 
 * Agora a verificação de auth é feita apenas no layout root.
 * + ADICIONADO: AuthDoubleCheck para verificar cookies após 2s na Vercel
 */

import React from "react";
import Image from "next/image";
import AuthDoubleCheck from "@/components/AuthDoubleCheck";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen">
      {/* Double-check invisível - só para telas de login */}
      <AuthDoubleCheck />
      
      <section className="hidden w-1/2 items-center justify-center bg-brand p-10 lg:flex xl:w-2/5">
        <div className="flex max-h-[800px] max-w-[430px] flex-col justify-center space-y-12">
          <Image
            src="/assets/images/bloomdrive.png"
            alt="BloomDrive logo"
            width={300}
            height={82}
            className="h-auto"
            priority
          />

          <div className="space-y-5 text-white">
            <h1 className="h1">Gerencie seus arquivos da melhor maneira</h1>
            <p className="body-1">
              Esse é um local onde você pode armazenar todos os seus documentos.
            </p>
          </div>
          <Image
            src="/assets/images/files.png"
            alt="Files"
            width={342}
            height={342}
            className="transition-all hover:rotate-2 hover:scale-105"
          />
        </div>
      </section>

      <section className="flex flex-1 flex-col items-center bg-white p-4 py-10 lg:justify-center lg:p-10 lg:py-0">
        <div className="mb-16 lg:hidden">
          <Image
            src="/assets/images/bloomdrive.png"
            alt="BloomDrive logo"
            width={224}
            height={82}
            className="h-auto w-[200px] lg:w-[250px]"
            priority
          />
        </div>

        {children}
      </section>
    </div>
  );
};

export default Layout;
