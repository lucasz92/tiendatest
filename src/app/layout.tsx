import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs'
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TiendaFácil SaaS | Crea tu tienda online en minutos",
  description: "La plataforma SaaS para crear y gestionar e-commerce y tiendas online para pequeñas empresas. Vende más, gestiona menos.",
};

import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import "@uploadthing/react/styles.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="es" suppressHydrationWarning>
        <body className={inter.className} suppressHydrationWarning>
          <NextSSRPlugin
            routerConfig={extractRouterConfig(ourFileRouter)}
          />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
