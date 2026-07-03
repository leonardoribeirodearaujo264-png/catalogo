"use client";

import Link from "next/link";
import { useCatalog } from "@/lib/catalog-context";

export function CategoryGrid() {
  const { categories, items } = useCatalog();
  const sorted = [...categories].sort((a, b) => a.order - b.order);

  return (
    <section className="container-app py-14">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-brand-accent">Explore</p>
          <h2 className="text-2xl font-extrabold text-gray-900">Categorias</h2>
        </div>
        <Link href="/catalogo" className="text-sm font-semibold text-gray-500 hover:text-gray-900">
          Ver tudo
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {sorted.map((cat) => {
          const count = items.filter((i) => i.categoryId === cat.id && i.active).length;
          return (
            <Link
              key={cat.id}
              href={`/catalogo?categoria=${cat.slug}`}
              className="group flex flex-col items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-6 text-center transition-colors hover:border-gray-900"
            >
              <span className="text-3xl">{cat.icon}</span>
              <span className="text-sm font-bold text-gray-900">{cat.name}</span>
              <span className="text-xs text-gray-400">{count} {count === 1 ? "item" : "itens"}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
