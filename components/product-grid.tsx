"use client";

import { useCatalogView } from "@/lib/catalog-view-context";
import { ProductCard } from "@/components/product-card";
import type { CatalogItem } from "@/types/catalog";

export function ProductGrid({ items }: { items: CatalogItem[] }) {
  const { getCategory } = useCatalogView();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-gray-300 py-20 text-center">
        <span className="text-4xl">🔎</span>
        <h3 className="text-lg font-bold text-gray-900">Nada por aqui ainda</h3>
        <p className="text-sm text-gray-500">Tente outra busca ou escolha outra categoria.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => (
        <ProductCard key={item.id} item={item} category={getCategory(item.categoryId)} />
      ))}
    </div>
  );
}
