"use client";

import { useMemo, useState } from "react";
import { useCatalogView } from "@/lib/catalog-view-context";
import { useInterestList } from "@/lib/interest-context";
import { SearchBar } from "@/components/search-bar";
import { ProductGrid } from "@/components/product-grid";
import { ProductModal } from "@/components/product-modal";
import type { CatalogItem } from "@/types/catalog";

export default function CatalogHomePage() {
  const { catalog, items } = useCatalogView();
  const { addEntry } = useInterestList();
  const [query, setQuery] = useState("");
  const [quickViewItem, setQuickViewItem] = useState<CatalogItem | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (!item.active) return false;
      if (!q) return true;
      return `${item.name} ${item.description}`.toLowerCase().includes(q);
    });
  }, [items, query]);

  function handleQuickAdd(item: CatalogItem) {
    addEntry({ catalogId: catalog.id, itemId: item.id, name: item.name, price: item.price });
    setAddedId(item.id);
    setTimeout(() => setAddedId(null), 1200);
  }

  return (
    <div className="container-app py-6 sm:py-8">
      <div className="max-w-xl">
        <SearchBar value={query} onChange={setQuery} placeholder="Buscar produtos e serviços..." />
      </div>

      <p className="mb-4 mt-4 text-xs font-semibold text-gray-400">
        {filtered.length} {filtered.length === 1 ? "item" : "itens"}
      </p>

      <ProductGrid
        items={filtered}
        layout={catalog.layout}
        addedId={addedId}
        onOpen={setQuickViewItem}
        onQuickAdd={handleQuickAdd}
      />

      {quickViewItem && <ProductModal item={quickViewItem} onClose={() => setQuickViewItem(null)} />}
    </div>
  );
}
