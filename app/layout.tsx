import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./cta-overrides.css";
import "./onboarding-overrides.css";
import "./product-system.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});


export const metadata: Metadata = {
  title: "APIS Grupo | Sistema ADM",
  description: "Gestao de fichas por unidade",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.variable}>{children}</body>
    </html>
  );
}
