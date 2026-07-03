"use client";

import { useCatalogView } from "@/lib/catalog-view-context";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/icons";

export function WhatsAppFloatButton() {
  const { catalog } = useCatalogView();
  const url = buildWhatsAppUrl(catalog.whatsappNumber, catalog.whatsappDefaultMessage);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-20 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#16a34a] text-white shadow-lg shadow-black/20 transition-transform hover:scale-105 active:scale-95 sm:bottom-5 sm:right-5 sm:h-14 sm:w-14"
    >
      <WhatsAppIcon className="h-6 w-6 sm:h-7 sm:w-7" />
    </a>
  );
}
