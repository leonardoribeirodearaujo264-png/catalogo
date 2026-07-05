"use client";

import { useCatalogView } from "@/lib/catalog-view-context";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} stroke="currentColor" className="h-5 w-5">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm3.75 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm3.75 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
      />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} stroke="currentColor" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
      />
    </svg>
  );
}

export function TopUtilityBar() {
  const { catalog } = useCatalogView();
  const whatsappUrl = buildWhatsAppUrl(catalog.whatsappNumber, catalog.whatsappDefaultMessage);
  const hasAddress = catalog.address.street || catalog.address.city;

  return (
    <div className="border-b border-[#E4E4E4] bg-white">
      <div className="container-app flex items-center justify-center gap-8 py-3">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm font-bold text-black"
        >
          <ChatIcon />
          Contatos
        </a>
        {hasAddress ? (
          <a href="#endereco" className="flex items-center gap-1.5 text-sm font-bold text-black">
            <PinIcon />
            Entrega
          </a>
        ) : (
          <span className="flex items-center gap-1.5 text-sm font-bold text-black">
            <PinIcon />
            Entrega
          </span>
        )}
      </div>
    </div>
  );
}
