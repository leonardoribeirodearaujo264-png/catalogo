import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { STATUS_LABELS } from "@/types/financial";
import type { FinancialTransaction, TransactionStatus } from "@/types/financial";

const STATUS_TONE: Record<TransactionStatus, "green" | "amber" | "red" | "gray"> = {
  pago: "green",
  pendente: "amber",
  atrasado: "red",
  cancelado: "gray",
};

function formatDate(value?: string) {
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
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-gray-300 py-16 text-center">
        <span className="text-4xl">📄</span>
        <h3 className="text-lg font-bold text-gray-900">Nenhum lançamento ainda</h3>
        <p className="text-sm text-gray-500">Registre sua primeira receita ou despesa.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-gray-200 bg-gray-50 text-xs font-bold uppercase tracking-wide text-gray-500">
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
            <tr key={tx.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/60">
              <td className="px-4 py-3 font-semibold text-gray-900">
                {tx.description}
                {tx.orderId && <span className="ml-2 text-[10px] font-normal text-gray-400">via pedido</span>}
              </td>
              <td className="px-4 py-3 text-gray-600">{tx.customerName || "—"}</td>
              <td className="px-4 py-3 text-gray-600">{formatDate(tx.dueDate)}</td>
              <td className="px-4 py-3">
                <Badge tone={STATUS_TONE[tx.status]}>{STATUS_LABELS[tx.status]}</Badge>
              </td>
              <td className={`px-4 py-3 text-right font-bold ${tx.type === "receita" ? "text-green-600" : "text-red-600"}`}>
                {tx.type === "receita" ? "+" : "−"} {formatPrice(tx.amount)}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-3">
                  <Link href={`/admin/financeiro/${tx.id}`} className="text-sm font-semibold text-brand-accent hover:underline">
                    Editar
                  </Link>
                  {onDelete && (
                    <button
                      onClick={() => {
                        if (confirm("Excluir este lançamento?")) onDelete(tx.id);
                      }}
                      className="text-sm font-semibold text-red-500 hover:underline"
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
  );
}
