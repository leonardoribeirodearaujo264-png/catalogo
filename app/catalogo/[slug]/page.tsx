"use client";

import { useMemo, useState } from "react";
import { useCatalogView } from "@/lib/catalog-view-context";
import { HeroBanner } from "@/components/hero-banner";
import { CategoryGrid } from "@/components/category-grid";
import { FeaturedItems } from "@/components/featured-items";
import { SearchBar } from "@/components/search-bar";
import { ProductGrid } from "@/components/product-grid";
import { WhatsAppIcon } from "@/components/icons";

export default function CatalogHomePage() {
  const { catalog, categories, items } = useCatalogView();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (!item.active) return false;
      if (activeCategory) {
        const cat = categories.find((c) => c.slug === activeCategory);
        if (!cat || item.categoryId !== cat.id) return false;
      }
      if (!q) return true;
      const category = categories.find((c) => c.id === item.categoryId);
      return `${item.name} ${item.description} ${category?.name ?? ""}`.toLowerCase().includes(q);
    });
  }, [items, categories, activeCategory, query]);

  const isFiltering = query.trim() !== "" || activeCategory !== "";

  return (
    <>
      <HeroBanner />

      <div className="bg-gray-950 pb-4">
        <div className="container-app">
          <div className="flex items-center gap-4 rounded-2xl bg-white/5 p-5 text-white">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#16a34a]">
              <WhatsAppIcon className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-sm font-bold">Compra 100% pelo WhatsApp</h3>
              <p className="text-xs text-white/60">Escolha o item, selecione a variação e finalize direto na conversa.</p>
            </div>
          </div>
        </div>
      </div>

      <CategoryGrid activeCategory={activeCategory} onSelect={setActiveCategory} />
      {!isFiltering && <FeaturedItems />}

      <section id="produtos" className="container-app scroll-mt-16 py-10 sm:py-14">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-wide text-brand-accent">Catálogo completo</p>
          <h2 className="text-2xl font-extrabold text-gray-900">Produtos & Serviços</h2>
        </div>

        <div className="mb-6 max-w-xl">
          <SearchBar value={query} onChange={setQuery} />
        </div>

        <p className="mb-4 text-sm text-gray-500">
          {filtered.length} {filtered.length === 1 ? "item encontrado" : "itens encontrados"}
        </p>

        <ProductGrid items={filtered} />
      </section>

      {!catalog.whatsappNumber && (
        <div className="container-app pb-10">
          <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-700">
            Este catálogo ainda não configurou um número de WhatsApp.
          </p>
        </div>
      )}
    </>
  );
}
