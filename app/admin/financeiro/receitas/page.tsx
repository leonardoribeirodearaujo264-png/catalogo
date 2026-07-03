"use client";

import Link from "next/link";
import { useFinancial } from "@/lib/financial-context";
import { TransactionTable } from "@/components/admin/financeiro/transaction-table";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

export default function RevenuesPage() {
  const { transactions, loading } = useFinancial();
  const revenues = transactions.filter((t) => t.type === "receita");
  const total = revenues.reduce((sum, t) => sum + t.amount, 0);

  if (loading) return <p className="text-sm text-gray-400">Carregando...</p>;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">Receitas</h1>
          <p className="mt-1 text-sm text-gray-500">{revenues.length} lançamentos · Total {formatPrice(total)}</p>
        </div>
        <Link href="/admin/financeiro/novo">
          <Button variant="brand">+ Novo lançamento</Button>
        </Link>
      </div>

      <div className="mt-6">
        <TransactionTable transactions={revenues} />
      </div>
    </div>
  );
}
