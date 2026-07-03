"use client";

import { useCatalogView } from "@/lib/catalog-view-context";
import { cn } from "@/lib/utils";

export function CategoryGrid({
  activeCategory,
  onSelect,
}: {
  activeCategory: string;
  onSelect: (slug: string) => void;
}) {
  const { categories, items } = useCatalogView();
  const sorted = [...categories].sort((a, b) => a.order - b.order);

  return (
    <section className="container-app py-10 sm:py-14">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-wide text-brand-accent">Explore</p>
        <h2 className="text-2xl font-extrabold text-gray-900">Categorias</h2>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {sorted.map((cat) => {
          const count = items.filter((i) => i.categoryId === cat.id && i.active).length;
          const active = activeCategory === cat.slug;
          return (
            <button
              key={cat.id}
              onClick={() => onSelect(active ? "" : cat.slug)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-2xl border px-4 py-6 text-center transition-colors",
                active ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 bg-white hover:border-gray-900",
              )}
            >
              <span className="text-3xl">{cat.icon}</span>
              <span className={cn("text-sm font-bold", active ? "text-white" : "text-gray-900")}>{cat.name}</span>
              <span className={cn("text-xs", active ? "text-white/70" : "text-gray-400")}>
                {count} {count === 1 ? "item" : "itens"}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
