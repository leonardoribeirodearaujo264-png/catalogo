"use client";

import Link from "next/link";
import { useCatalog } from "@/lib/catalog-context";
import { StatCard } from "@/components/admin/stat-card";
import { formatPrice } from "@/lib/utils";

export default function AdminDashboardPage() {
  const { items, categories } = useCatalog();

  const active = items.filter((i) => i.active).length;
  const outOfStock = items.filter((i) => i.stock !== null && i.stock !== undefined && i.stock <= 0).length;
  const services = items.filter((i) => i.kind === "servico").length;
  const avgPrice = items.length ? items.reduce((sum, i) => sum + i.price, 0) / items.length : 0;

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900">Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">Visão geral do seu catálogo.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Itens ativos" value={active} icon="🗂️" />
        <StatCard label="Categorias" value={categories.length} icon="🏷️" />
        <StatCard label="Serviços cadastrados" value={services} icon="💼" />
        <StatCard label="Esgotados" value={outOfStock} icon="🚫" />
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="text-sm font-bold text-gray-900">Preço médio do catálogo</h2>
          <p className="mt-2 text-3xl font-extrabold text-gray-900">{formatPrice(avgPrice)}</p>
          <p className="mt-1 text-xs text-gray-500">Calculado sobre {items.length} itens cadastrados.</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="text-sm font-bold text-gray-900">Ações rápidas</h2>
          <div className="mt-3 flex flex-col gap-2">
            <Link href="/admin/produtos/novo" className="text-sm font-semibold text-brand-accent hover:underline">
              + Cadastrar novo produto/serviço
            </Link>
            <Link href="/admin/categorias" className="text-sm font-semibold text-brand-accent hover:underline">
              + Gerenciar categorias
            </Link>
            <Link href="/admin/configuracoes" className="text-sm font-semibold text-brand-accent hover:underline">
              ⚙️ Editar dados da marca e do WhatsApp
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
