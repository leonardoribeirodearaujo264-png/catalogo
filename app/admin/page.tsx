"use client";

import { useState } from "react";
import Link from "next/link";
import { useAdminCatalog } from "@/lib/admin-catalog-context";
import { StatCard } from "@/components/admin/stat-card";
import { QuickAction } from "@/components/admin/quick-action";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

export default function AdminDashboardPage() {
  const { catalog, items, categories, loading, error } = useAdminCatalog();
  const [copied, setCopied] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <span className="h-4 w-4 animate-spin-slow rounded-full border-2 border-gray-300 border-t-gray-600" />
        Carregando seu catálogo...
      </div>
    );
  }
  if (error || !catalog) {
    return <p className="text-sm font-semibold text-red-600">{error ?? "Não foi possível carregar seu catálogo."}</p>;
  }

  const active = items.filter((i) => i.active).length;
  const outOfStock = items.filter((i) => i.stock !== null && i.stock !== undefined && i.stock <= 0).length;
  const services = items.filter((i) => i.kind === "servico").length;
  const avgPrice = items.length ? items.reduce((sum, i) => sum + i.price, 0) / items.length : 0;
  const publicPath = `/catalogo/${catalog.slug}`;

  async function handleCopy() {
    await navigator.clipboard.writeText(`${window.location.origin}${publicPath}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">Visão geral do seu catálogo.</p>

      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <Badge tone={catalog.isPublished ? "green" : "gray"}>
          {catalog.isPublished ? "Catálogo publicado" : "Catálogo não publicado"}
        </Badge>
        <Link href={publicPath} target="_blank" className="truncate text-sm font-semibold text-brand-accent hover:underline">
          {publicPath}
        </Link>
        <button onClick={handleCopy} className="text-xs font-semibold text-gray-500 hover:text-gray-900">
          {copied ? "Copiado ✓" : "Copiar link"}
        </button>
        <Link href="/admin/link-publico" className="ml-auto text-xs font-semibold text-gray-500 hover:text-gray-900">
          Gerenciar link →
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Itens ativos" value={active} icon="🗂️" tone="blue" />
        <StatCard label="Categorias" value={categories.length} icon="🏷️" tone="amber" />
        <StatCard label="Serviços cadastrados" value={services} icon="💼" tone="green" />
        <StatCard label="Esgotados" value={outOfStock} icon="🚫" tone="red" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-1">
          <h2 className="text-sm font-bold text-gray-900">Preço médio do catálogo</h2>
          <p className="mt-2 text-3xl font-extrabold text-gray-900">{formatPrice(avgPrice)}</p>
          <p className="mt-1 text-xs text-gray-500">Calculado sobre {items.length} itens cadastrados.</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="mb-3 text-sm font-bold text-gray-900">Ações rápidas</h2>
          <div className="grid gap-2.5 sm:grid-cols-2">
            <QuickAction href="/admin/produtos/novo" icon="➕" label="Novo produto/serviço" />
            <QuickAction href="/admin/categorias" icon="🏷️" label="Nova categoria" />
            <QuickAction href={publicPath} icon="👀" label="Ver catálogo" external />
            <QuickAction href="/admin/financeiro/novo" icon="💰" label="Novo lançamento financeiro" />
            <QuickAction href="/admin/configuracoes" icon="⚙️" label="Configurações" />
            <QuickAction href="/admin/link-publico" icon="🔗" label="Link público" />
          </div>
        </div>
      </div>
    </div>
  );
}
