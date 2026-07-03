"use client";

import { useCatalogView } from "@/lib/catalog-view-context";
import { ProductCard } from "@/components/product-card";
import { ProductListItem } from "@/components/product-list-item";
import type { CatalogItem, CatalogLayout } from "@/types/catalog";

export function ProductGrid({
  items,
  layout = "grade",
  addedId,
  onOpen,
  onQuickAdd,
}: {
  items: CatalogItem[];
  layout?: CatalogLayout;
  addedId?: string | null;
  onOpen: (item: CatalogItem) => void;
  onQuickAdd: (item: CatalogItem) => void;
}) {
  const { getCategory } = useCatalogView();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-gray-300 py-20 text-center">
        <span className="text-4xl">🔎</span>
        <h3 className="text-lg font-bold text-gray-900">Nada por aqui ainda</h3>
        <p className="text-sm text-gray-500">Tente outra busca.</p>
      </div>
    );
  }

  if (layout === "lista") {
    return (
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <ProductListItem
            key={item.id}
            item={item}
            category={getCategory(item.categoryId)}
            added={addedId === item.id}
            onOpen={onOpen}
            onQuickAdd={onQuickAdd}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      {items.map((item) => (
        <ProductCard
          key={item.id}
          item={item}
          category={getCategory(item.categoryId)}
          added={addedId === item.id}
          onOpen={onOpen}
          onQuickAdd={onQuickAdd}
        />
      ))}
    </div>
  );
}
