import type { StoreSettings } from "@/types/catalog";

// Configuração padrão da loja/marca. Tudo aqui é editável em
// /admin/configuracoes — nada no restante do app depende de um nicho fixo.
export const defaultSettings: StoreSettings = {
  brandName: "RR Repuxação",
  niche: "Metalurgia & Repuxação de Metais",
  tagline: "Catálogo digital de produtos e serviços",
  heroTitle: "RR Repuxação",
  heroSubtitle:
    "Conheça nossos produtos e serviços e finalize seu pedido direto pelo WhatsApp.",
  logoUrl: "",
  bannerUrl: "",
  whatsappNumber: "5598999999999",
  whatsappDefaultMessage: "Olá! Vim pelo catálogo digital e tenho interesse em:",
  primaryColor: "#111827",
  accentColor: "#16a34a",
  address: {
    street: "Rua Exemplo, 123 - Centro",
    city: "São Luís",
    state: "MA",
    zip: "65000-000",
  },
  social: {
    instagram: "https://instagram.com/",
    facebook: "https://facebook.com/",
  },
};
