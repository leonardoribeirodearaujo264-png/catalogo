"use client";

import { useCatalogView } from "@/lib/catalog-view-context";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/icons";

export function SiteFooter() {
  const { catalog } = useCatalogView();
  const year = new Date().getFullYear();
  const whatsappUrl = buildWhatsAppUrl(catalog.whatsappNumber, catalog.whatsappDefaultMessage);
  const address = catalog.address;
  const hasAddress = address.street || address.city;

  const socialLinks = [
    { href: whatsappUrl, label: "WhatsApp", icon: <WhatsAppIcon className="h-4 w-4" /> },
    catalog.social.instagram && { href: catalog.social.instagram, label: "Instagram", icon: "📷" },
    catalog.social.facebook && { href: catalog.social.facebook, label: "Facebook", icon: "📘" },
    catalog.social.tiktok && { href: catalog.social.tiktok, label: "TikTok", icon: "🎵" },
  ].filter(Boolean) as { href: string; label: string; icon: React.ReactNode }[];

  return (
    <footer id="endereco" className="border-t border-gray-200 bg-gray-950 text-gray-300">
      <div className="container-app flex flex-col items-center gap-5 py-12 text-center sm:items-start sm:text-left">
        <div>
          <h3 className="text-lg font-bold text-white">{catalog.businessName}</h3>
          {catalog.tagline && <p className="mt-1.5 text-sm text-gray-400">{catalog.tagline}</p>}
          {hasAddress && (
            <p className="mt-3 text-sm text-gray-400">
              {address.street}
              {address.street && <br className="hidden sm:block" />}
              {address.street && " "}
              {[address.city, address.state].filter(Boolean).join(" - ")}
              {address.zip ? ` · ${address.zip}` : ""}
            </p>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
          {socialLinks.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white transition-colors hover:bg-white/10"
            >
              {s.icon}
            </a>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10 py-5">
        <p className="container-app text-center text-xs text-gray-500">© {year} {catalog.businessName}</p>
      </div>
    </footer>
  );
}
