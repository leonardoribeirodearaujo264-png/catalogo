"use client";

import { use } from "react";
import Link from "next/link";
import { useCatalog } from "@/lib/catalog-context";
import { ItemForm } from "@/components/admin/item-form";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { getItem } = useCatalog();
  const item = getItem(id);

  if (!item) {
    return (
      <div>
        <h1 className="text-xl font-bold text-gray-900">Item não encontrado</h1>
        <Link href="/admin/produtos" className="text-sm font-semibold text-brand-accent">← Voltar</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900">Editar item</h1>
      <p className="mt-1 text-sm text-gray-500">{item.name}</p>
      <div className="mt-6">
        <ItemForm item={item} />
      </div>
    </div>
  );
}
