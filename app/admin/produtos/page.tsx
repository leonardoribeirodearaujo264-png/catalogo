"use client";

import Link from "next/link";
import { useCatalog } from "@/lib/catalog-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

export default function AdminProductsPage() {
  const { items, getCategory } = useCatalog();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Produtos & Serviços</h1>
          <p className="mt-1 text-sm text-gray-500">{items.length} itens cadastrados.</p>
        </div>
        <Link href="/admin/produtos/novo">
          <Button>+ Novo item</Button>
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-200 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs font-bold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Preço</th>
              <th className="px-4 py-3">Estoque</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const category = getCategory(item.categoryId);
              const outOfStock = item.stock !== null && item.stock !== undefined && item.stock <= 0;
              return (
                <tr key={item.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    {item.name}
                    <span className="ml-2 text-xs font-normal text-gray-400">
                      {item.kind === "servico" ? "Serviço" : "Produto"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{category ? `${category.icon} ${category.name}` : "—"}</td>
                  <td className="px-4 py-3 text-gray-900">{formatPrice(item.price)}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {item.stock === null || item.stock === undefined ? "Não controlado" : item.stock}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {!item.active && <Badge tone="gray">Inativo</Badge>}
                      {outOfStock && <Badge tone="red">Esgotado</Badge>}
                      {item.featured && <Badge tone="green">Destaque</Badge>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/produtos/${item.id}`} className="text-sm font-semibold text-brand-accent hover:underline">
                      Editar
                    </Link>
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400">
                  Nenhum item cadastrado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
