"use client";

import { useCatalogView } from "@/lib/catalog-view-context";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export function SiteFooter() {
  const { catalog } = useCatalogView();
  const year = new Date().getFullYear();
  const whatsappUrl = buildWhatsAppUrl(catalog.whatsappNumber, catalog.whatsappDefaultMessage);
  const address = catalog.address;
  const hasAddress = address.street || address.city;

  return (
    <footer className="border-t border-gray-200 bg-gray-950 text-gray-300">
      <div className="container-app grid gap-10 py-12 md:grid-cols-2">
        <div>
          <h3 className="text-lg font-bold text-white">{catalog.businessName}</h3>
          {catalog.tagline && <p className="mt-2 text-sm text-gray-400">{catalog.tagline}</p>}
          {hasAddress && (
            <p className="mt-4 text-sm text-gray-400">
              {address.street}
              {address.street && <br />}
              {[address.city, address.state].filter(Boolean).join(" - ")}
              {address.zip ? ` · ${address.zip}` : ""}
            </p>
          )}
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wide text-gray-500">Fale conosco</h4>
          <div className="mt-3 space-y-2 text-sm">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="block font-semibold text-green-400 hover:text-green-300">
              WhatsApp
            </a>
            {catalog.social.instagram && (
              <a href={catalog.social.instagram} target="_blank" rel="noopener noreferrer" className="block text-gray-400 hover:text-white">
                Instagram
              </a>
            )}
            {catalog.social.facebook && (
              <a href={catalog.social.facebook} target="_blank" rel="noopener noreferrer" className="block text-gray-400 hover:text-white">
                Facebook
              </a>
            )}
            {catalog.social.tiktok && (
              <a href={catalog.social.tiktok} target="_blank" rel="noopener noreferrer" className="block text-gray-400 hover:text-white">
                TikTok
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-5">
        <p className="container-app text-center text-xs text-gray-500">© {year} {catalog.businessName}</p>
      </div>
    </footer>
  );
}
