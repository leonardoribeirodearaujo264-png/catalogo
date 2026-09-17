"use client";

import { useStoreView } from "@/lib/store-view-context";
import { Hero } from "@/components/site/hero";
import { QuickSearch } from "@/components/site/quick-search";
import { AboutSection, CallToActionBand, FeaturedVehicles, TrustStrip } from "@/components/site/store-sections";
import { ContactSection } from "@/components/site/contact-section";

// A ordem das seções é configurável no painel; o que não estiver na lista
// simplesmente não é renderizado.
const SECTIONS = {
  hero: Hero,
  busca: QuickSearch,
  confianca: TrustStrip,
  destaques: FeaturedVehicles,
  sobre: AboutSection,
  chamada: CallToActionBand,
  contato: ContactSection,
} as const;

export default function StoreHomePage() {
  const { store } = useStoreView();
  // A faixa de chamada é nova; lojas criadas antes dela têm section_order
  // salvo sem "chamada", então ela é inserida antes do contato.
  const saved = store.sectionOrder?.length
    ? (store.sectionOrder as (keyof typeof SECTIONS)[])
    : (Object.keys(SECTIONS) as (keyof typeof SECTIONS)[]);

  const order = saved.includes("chamada")
    ? saved
    : saved.flatMap((key) => (key === "contato" ? ["chamada" as const, key] : [key]));

  return (
    <>
      {order.map((key) => {
        const Section = SECTIONS[key as keyof typeof SECTIONS];
        return Section ? <Section key={key} /> : null;
      })}
    </>
  );
}
