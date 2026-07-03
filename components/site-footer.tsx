"use client";

import Link from "next/link";
import { useCatalogView } from "@/lib/catalog-view-context";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export function SiteFooter() {
  const { catalog, categories } = useCatalogView();
  const year = new Date().getFullYear();
  const whatsappUrl = buildWhatsAppUrl(catalog.whatsappNumber, catalog.whatsappDefaultMessage);
  const address = catalog.address;
  const hasAddress = address.street || address.city;
  const base = `/catalogo/${catalog.slug}`;

  return (
    <footer className="border-t border-gray-200 bg-gray-950 text-gray-300">
      <div className="container-app grid gap-10 py-14 md:grid-cols-3">
        <div>
          <h3 className="text-lg font-bold text-white">{catalog.businessName}</h3>
          <p className="mt-2 text-sm text-gray-400">{catalog.tagline}</p>
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
          <h4 className="text-sm font-bold uppercase tracking-wide text-gray-500">Categorias</h4>
          <ul className="mt-3 space-y-2 text-sm">
            {categories.slice(0, 6).map((cat) => (
              <li key={cat.id}>
                <Link href={`${base}?categoria=${cat.slug}`} className="text-gray-400 hover:text-white">
                  {cat.icon} {cat.name}
                </Link>
              </li>
            ))}
          </ul>
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
        <p className="container-app text-center text-xs text-gray-500">
          © {year} {catalog.businessName}. Catálogo digital universal — feito para qualquer nicho de negócio.
        </p>
      </div>
    </footer>
  );
}
