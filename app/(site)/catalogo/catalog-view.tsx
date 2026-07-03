"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCatalog } from "@/lib/catalog-context";
import { SearchBar } from "@/components/search-bar";
import { ProductGrid } from "@/components/product-grid";
import { cn } from "@/lib/utils";

export function CatalogView() {
  const { items, categories } = useCatalog();
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeCategory = searchParams.get("categoria") ?? "";
  const [query, setQuery] = useState(searchParams.get("busca") ?? "");

  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);

  function setCategory(slug: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) params.set("categoria", slug);
    else params.delete("categoria");
    router.push(`/catalogo?${params.toString()}`, { scroll: false });
  }

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
      const haystack = `${item.name} ${item.description} ${category?.name ?? ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [items, categories, activeCategory, query]);

  return (
    <div className="container-app py-10">
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-wide text-brand-accent">Catálogo completo</p>
        <h1 className="text-3xl font-extrabold text-gray-900">Produtos & Serviços</h1>
      </div>

      <div className="mb-6 max-w-xl">
        <SearchBar value={query} onChange={setQuery} />
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <button
          onClick={() => setCategory("")}
          className={cn(
            "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
            !activeCategory ? "border-gray-900 bg-gray-900 text-white" : "border-gray-300 text-gray-600 hover:border-gray-900",
          )}
        >
          Todas
        </button>
        {sortedCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.slug)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
              activeCategory === cat.slug
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-300 text-gray-600 hover:border-gray-900",
            )}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      <p className="mb-4 text-sm text-gray-500">
        {filtered.length} {filtered.length === 1 ? "item encontrado" : "itens encontrados"}
      </p>

      <ProductGrid items={filtered} />
    </div>
  );
}
