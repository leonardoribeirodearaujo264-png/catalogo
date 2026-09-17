import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { Providers } from "@/app/providers";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });

// Serifada editorial nos títulos — é o que tira a página do "template
// genérico" e dá o tom de concessionária premium. Só duas famílias no
// projeto inteiro: esta para títulos, Inter para o resto.
// Sem `weight`: a Fraunces é variável, e o next/font só aceita `axes`
// quando o peso fica no modo variável.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "CAR SELECT — Catálogos digitais para lojas de veículos",
    template: "%s | CAR SELECT",
  },
  description:
    "Plataforma para lojas de veículos criarem seu catálogo digital: estoque, fotos, leads e um link público exclusivo para compartilhar.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "CAR SELECT",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-ink text-cream">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
