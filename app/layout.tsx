import type { Metadata } from "next";
import { Poppins } from 'next/font/google'
import HydrationZustand from "@/components/HydrationZustand";

import "./globals.css";

const poppins = Poppins({
    subsets: ['latin'],
    weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
    variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: "BloomDrive",
  description: "BloomDrive - A solução de armazenamento que você precisa.",
  openGraph: {
    title: "BloomDrive - Gerenciamento de Arquivos",
    description: "A solução completa para armazenamento e gerenciamento de arquivos na nuvem.",
    images: [
      {
        url: "/assets/images/vercel-cape.png",
        width: 1200,
        height: 630,
        alt: "BloomDrive - Gerenciamento de Arquivos",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BloomDrive - Gerenciamento de Arquivos",
    description: "A solução completa para armazenamento e gerenciamento de arquivos na nuvem.",
    images: ["/assets/images/vercel-cape.png"],
  },
  icons: {
    icon: "/assets/images/bloomdriveicon.png",
    apple: "/assets/images/bloomdriveicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${poppins.variable} font-poppins antialiased`}
        suppressHydrationWarning={true}
      >
        <HydrationZustand />
        {children}
      </body>
    </html>
  );
}
