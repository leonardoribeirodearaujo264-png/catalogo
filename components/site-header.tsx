"use client";

import Link from "next/link";
import { useState } from "react";
import { CartIcon, CloseIcon, MenuIcon } from "@/components/icons";
import { useInterestList } from "@/lib/interest-context";
import { useCatalogView } from "@/lib/catalog-view-context";

export function SiteHeader() {
  const { catalog } = useCatalogView();
  const { totalItemsForCatalog } = useInterestList();
  const totalItems = totalItemsForCatalog(catalog.id);
  const [open, setOpen] = useState(false);

  const base = `/catalogo/${catalog.slug}`;
  const navLinks = [{ href: base, label: "Catálogo" }];

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="container-app flex h-16 items-center justify-between gap-4">
        <Link href={base} className="flex min-w-0 items-center gap-2 font-extrabold text-gray-900">
          {catalog.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={catalog.logoUrl} alt={catalog.businessName} className="h-9 w-9 rounded-lg object-cover" />
          ) : (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-900 text-sm text-white">
              {catalog.businessName.slice(0, 2).toUpperCase()}
            </span>
          )}
          <span className="truncate text-lg">{catalog.businessName}</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-semibold text-gray-600 hover:text-gray-900">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={`${base}/interesse`}
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-700 hover:bg-gray-100"
            aria-label="Lista de interesse"
          >
            <CartIcon className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-accent px-1 text-[10px] font-bold text-white">
                {totalItems}
              </span>
            )}
          </Link>

          <button
            className="flex h-10 w-10 items-center justify-center rounded-full text-gray-700 hover:bg-gray-100 md:hidden"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-gray-200 bg-white md:hidden">
          <div className="container-app flex flex-col gap-1 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-2 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
