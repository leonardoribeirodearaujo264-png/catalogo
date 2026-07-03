"use client";

import { useCatalog } from "@/lib/catalog-context";
import { ProductGrid } from "@/components/product-grid";

export function FeaturedItems() {
  const { items } = useCatalog();
  const featured = items.filter((i) => i.active && i.featured);

  if (featured.length === 0) return null;

  return (
    <section className="container-app py-4">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-wide text-brand-accent">Destaques</p>
        <h2 className="text-2xl font-extrabold text-gray-900">Selecionados para você</h2>
      </div>
      <ProductGrid items={featured} />
    </section>
  );
}
