import type { Metadata } from "next";
import { PageHero } from "@/components/site/page-hero";
import { ContactSection } from "@/components/site/contact-section";

export const metadata: Metadata = {
  title: "Contato",
  description: "Fale com a loja por WhatsApp, telefone ou formulário.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Atendimento"
        title="Contato"
        description="Escolha o canal que preferir — respondemos em horário comercial."
      />
      <ContactSection />
    </>
  );
}
