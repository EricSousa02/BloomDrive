import React from "react";
import Image from "next/image";
import AuthChecker from "@/components/AuthChecker";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthChecker>
      <div className="flex min-h-screen">
        <section className="hidden w-1/2 items-center justify-center bg-brand p-10 lg:flex xl:w-2/5">
          <div className="flex max-h-[800px] max-w-[430px] flex-col justify-center space-y-12">
            <Image
              src="/assets/images/bloomdrive.png"
              alt="logo"
              width={300}
              height={82}
              className="h-auto"
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
              alt="logo"
              width={224}
              height={82}
              className="h-auto w-[200px] lg:w-[250px]"
            />
          </div>

          {children}
        </section>
      </div>
    </AuthChecker>
  );
};

export default Layout;
