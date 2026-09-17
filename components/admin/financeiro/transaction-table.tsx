"use client";

import Link from "next/link";
import { useState } from "react";
import { formatPrice } from "@/lib/utils";
import { STATUS_LABELS } from "@/types/financial";
import type { FinancialTransaction, TransactionStatus } from "@/types/financial";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog, EmptyState } from "@/components/ui/feedback";
import { WalletIcon } from "@/components/icons";

const STATUS_TONE: Record<TransactionStatus, "success" | "warning" | "danger" | "neutral"> = {
  pago: "success",
  pendente: "warning",
  atrasado: "danger",
  cancelado: "neutral",
};

function formatDay(value?: string) {
  if (!value) return "—";
  return new Date(`${value}T00:00:00`).toLocaleDateString("pt-BR");
}

export function TransactionTable({
  transactions,
  onDelete,
}: {
  transactions: FinancialTransaction[];
  onDelete?: (id: string) => void;
}) {
  const [pending, setPending] = useState<string | null>(null);

  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={<WalletIcon className="h-12 w-12" />}
        title="Nenhum lançamento ainda"
        description="Registre a primeira receita ou despesa da loja."
      />
    );
  }

  return (
    <>
      <div className="surface overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-white/8 text-[11px] font-semibold uppercase tracking-wide text-mute">
            <tr>
              <th className="px-4 py-3">Descrição</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Vencimento</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Valor</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id} className="border-b border-white/5 last:border-0 hover:bg-white/3">
                <td className="px-4 py-3 font-medium text-cream">
                  {tx.description}
                  {tx.vehicleId && (
                    <span className="ml-2 text-[11px] font-normal text-graphite-500">veículo</span>
                  )}
                </td>
                <td className="px-4 py-3 text-mute">{tx.customerName || "—"}</td>
                <td className="px-4 py-3 text-mute">{formatDay(tx.dueDate)}</td>
                <td className="px-4 py-3">
                  <Badge tone={STATUS_TONE[tx.status]}>{STATUS_LABELS[tx.status]}</Badge>
                </td>
                <td
                  className={`px-4 py-3 text-right font-semibold ${
                    tx.type === "receita" ? "text-emerald-300" : "text-red-300"
                  }`}
                >
                  {tx.type === "receita" ? "+" : "−"} {formatPrice(tx.amount)}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/admin/financeiro/${tx.id}`}
                      className="accent-text text-[13px] font-semibold hover:underline"
                    >
                      Editar
                    </Link>
                    {onDelete && (
                      <button
                        onClick={() => setPending(tx.id)}
                        className="text-[13px] font-semibold text-red-400 hover:underline"
                      >
                        Excluir
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!pending}
        title="Excluir lançamento?"
        description="Essa ação não pode ser desfeita."
        onConfirm={() => {
          if (pending && onDelete) onDelete(pending);
          setPending(null);
        }}
        onCancel={() => setPending(null)}
      />
    </>
  );
}
