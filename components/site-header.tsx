"use client";

import Link from "next/link";
import { CartIcon } from "@/components/icons";
import { useInterestList } from "@/lib/interest-context";
import { useCatalogView } from "@/lib/catalog-view-context";

export function SiteHeader() {
  const { catalog } = useCatalogView();
  const { totalItemsForCatalog, openCart } = useInterestList();
  const totalItems = totalItemsForCatalog(catalog.id);
  const base = `/catalogo/${catalog.slug}`;

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="container-app flex h-16 items-center justify-between gap-4">
        <Link href={base} className="flex min-w-0 items-center gap-2.5 font-extrabold text-gray-900">
          {catalog.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={catalog.logoUrl} alt={catalog.businessName} className="h-10 w-10 rounded-xl object-cover shadow-sm" />
          ) : (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-sm text-white">
              {catalog.businessName.slice(0, 2).toUpperCase()}
            </span>
          )}
          <span className="truncate text-lg tracking-tight">{catalog.businessName}</span>
        </Link>

        <button
          onClick={openCart}
          className="relative flex h-11 w-11 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-gray-100"
          aria-label="Carrinho"
        >
          <CartIcon className="h-5 w-5" />
          {totalItems > 0 && (
            <span className="absolute right-0.5 top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-accent px-1 text-[10px] font-bold text-white">
              {totalItems}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
