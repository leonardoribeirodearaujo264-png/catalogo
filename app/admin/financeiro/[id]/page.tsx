"use client";

import { use } from "react";
import Link from "next/link";
import { useFinancial } from "@/lib/financial-context";
import { TransactionForm } from "@/components/admin/financeiro/transaction-form";

export default function EditTransactionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { getTransaction } = useFinancial();
  const transaction = getTransaction(id);

  if (!transaction) {
    return (
      <div>
        <h1 className="text-xl font-bold text-gray-900">Lançamento não encontrado</h1>
        <Link href="/admin/financeiro" className="text-sm font-semibold text-brand-accent">← Voltar</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">Editar lançamento</h1>
      <p className="mt-1 text-sm text-gray-500">{transaction.description}</p>
      <div className="mt-6">
        <TransactionForm transaction={transaction} />
      </div>
    </div>
  );
}
