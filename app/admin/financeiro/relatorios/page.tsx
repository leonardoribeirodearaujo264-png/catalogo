"use client";

import { useFinancial } from "@/lib/financial-context";
import { RevenueExpenseChart } from "@/components/admin/financeiro/revenue-expense-chart";
import { groupByMonth } from "@/lib/financial-utils";
import { formatPrice } from "@/lib/utils";

export default function FinancialReportsPage() {
  const { transactions, loading } = useFinancial();

  if (loading) return <p className="text-sm text-gray-400">Carregando...</p>;

  const monthly = groupByMonth(transactions, 12);

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">Relatório mensal</h1>
      <p className="mt-1 text-sm text-gray-500">Receitas e despesas dos últimos 12 meses.</p>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <RevenueExpenseChart data={monthly} />
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs font-bold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Mês</th>
              <th className="px-4 py-3 text-right">Receitas</th>
              <th className="px-4 py-3 text-right">Despesas</th>
              <th className="px-4 py-3 text-right">Saldo</th>
            </tr>
          </thead>
          <tbody>
            {monthly.map((m) => {
              const saldo = m.receita - m.despesa;
              return (
                <tr key={m.label} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3 font-semibold capitalize text-gray-900">{m.label}</td>
                  <td className="px-4 py-3 text-right text-green-600">{formatPrice(m.receita)}</td>
                  <td className="px-4 py-3 text-right text-red-600">{formatPrice(m.despesa)}</td>
                  <td className={`px-4 py-3 text-right font-bold ${saldo >= 0 ? "text-gray-900" : "text-red-600"}`}>
                    {formatPrice(saldo)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
