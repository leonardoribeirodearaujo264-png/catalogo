"use client";

import Link from "next/link";
import { useFinancial } from "@/lib/financial-context";
import { StatCard } from "@/components/admin/stat-card";
import { TransactionTable } from "@/components/admin/financeiro/transaction-table";
import { RevenueExpenseChart } from "@/components/admin/financeiro/revenue-expense-chart";
import { QuickAction } from "@/components/admin/quick-action";
import { currentMonthTotals, groupByMonth } from "@/lib/financial-utils";
import { formatPrice } from "@/lib/utils";

export default function FinancialDashboardPage() {
  const { transactions, loading, error } = useFinancial();

  if (loading) return <p className="text-sm text-gray-400">Carregando...</p>;
  if (error) return <p className="text-sm font-semibold text-red-600">{error}</p>;

  const { receitas, despesas, saldo } = currentMonthTotals(transactions);
  const pendentes = transactions.filter((t) => t.status === "pendente").reduce((sum, t) => sum + t.amount, 0);
  const atrasados = transactions.filter((t) => t.status === "atrasado").reduce((sum, t) => sum + t.amount, 0);
  const recent = transactions.slice(0, 5);
  const monthly = groupByMonth(transactions, 6);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">Financeiro</h1>
          <p className="mt-1 text-sm text-gray-500">Visão geral das receitas e despesas do seu negócio.</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Receitas do mês" value={formatPrice(receitas)} icon="↑" tone="green" />
        <StatCard label="Despesas do mês" value={formatPrice(despesas)} icon="↓" tone="red" />
        <StatCard label="Saldo do mês" value={formatPrice(saldo)} icon="=" tone={saldo >= 0 ? "green" : "red"} />
        <StatCard label="Pendentes" value={formatPrice(pendentes)} icon="⏳" tone="amber" />
      </div>

      {atrasados > 0 && (
        <p className="mt-4 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm font-semibold text-red-600">
          ⚠️ {formatPrice(atrasados)} em lançamentos atrasados.
        </p>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="mb-4 text-sm font-bold text-gray-900">Receitas x despesas (6 meses)</h2>
          <RevenueExpenseChart data={monthly} />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-sm font-bold text-gray-900">Ações rápidas</h2>
          <div className="grid grid-cols-1 gap-2.5">
            <QuickAction href="/admin/financeiro/novo" icon="➕" label="Novo lançamento" />
            <QuickAction href="/admin/financeiro/receitas" icon="↑" label="Ver receitas" />
            <QuickAction href="/admin/financeiro/despesas" icon="↓" label="Ver despesas" />
            <QuickAction href="/admin/financeiro/relatorios" icon="📊" label="Relatório mensal" />
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900">Últimos lançamentos</h2>
          <Link href="/admin/financeiro/receitas" className="text-xs font-semibold text-brand-accent hover:underline">
            Ver tudo
          </Link>
        </div>
        <TransactionTable transactions={recent} />
      </div>
    </div>
  );
}
