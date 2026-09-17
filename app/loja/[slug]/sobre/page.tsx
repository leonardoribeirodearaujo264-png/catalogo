import type { Metadata } from "next";
import { PageHero } from "@/components/site/page-hero";
import { AboutSection, CallToActionBand, TrustStrip } from "@/components/site/store-sections";

export const metadata: Metadata = {
  title: "Sobre nós",
  description: "Conheça a história, os diferenciais e a estrutura da loja.",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Quem somos"
        title="Sobre nós"
        description="A estrutura, o time e os cuidados por trás de cada veículo do catálogo."
      />
      <AboutSection />
      <TrustStrip />
      <CallToActionBand />
    </>
  );
}
