"use client";

import { useSettings } from "@/lib/settings-context";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/icons";

export function WhatsAppFloatButton() {
  const { settings } = useSettings();
  const url = buildWhatsAppUrl(settings.whatsappNumber, settings.whatsappDefaultMessage);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#16a34a] text-white shadow-lg shadow-black/20 transition-transform hover:scale-105 active:scale-95"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
