"use client";

import { useMemo, useState } from "react";
import { useAdminStore } from "@/lib/admin-store-context";
import { useFinancial } from "@/lib/financial-context";
import { useToast } from "@/lib/toast-context";
import { currentMonthTotals, groupByMonth } from "@/lib/financial-utils";
import { cn, formatPrice } from "@/lib/utils";
import type { TransactionType } from "@/types/financial";
import { PageHeader, Panel, StatCard } from "@/components/admin/admin-ui";
import { RevenueExpenseChart } from "@/components/admin/financeiro/revenue-expense-chart";
import { TransactionTable } from "@/components/admin/financeiro/transaction-table";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState, ErrorNote, Skeleton } from "@/components/ui/feedback";
import { PlusIcon } from "@/components/icons";

const TABS: { value: TransactionType | "todos"; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "receita", label: "Receitas" },
  { value: "despesa", label: "Despesas" },
];

export default function FinancePage() {
  const { permissions } = useAdminStore();
  const { transactions, loading, error, deleteTransaction } = useFinancial();
  const toast = useToast();
  const [tab, setTab] = useState<TransactionType | "todos">("todos");

  const totals = useMemo(() => currentMonthTotals(transactions), [transactions]);
  const monthly = useMemo(() => groupByMonth(transactions), [transactions]);
  const filtered = useMemo(
    () => (tab === "todos" ? transactions : transactions.filter((tx) => tx.type === tab)),
    [transactions, tab],
  );

  const overdue = useMemo(
    () => transactions.filter((tx) => tx.status === "atrasado" || (tx.status === "pendente" && tx.dueDate && tx.dueDate < new Date().toISOString().slice(0, 10))),
    [transactions],
  );

  if (!permissions.finance) {
    return <EmptyState title="Sem permissão" description="Seu perfil não tem acesso ao financeiro desta loja." />;
  }

  async function handleDelete(id: string) {
    try {
      await deleteTransaction(id);
      toast.success("Lançamento excluído.");
    } catch {
      toast.error("Não foi possível excluir.");
    }
  }

  return (
    <>
      <PageHeader
        title="Financeiro"
        description="Receitas e despesas da loja, com os lançamentos ligados aos veículos."
        action={
          <ButtonLink href="/admin/financeiro/novo">
            <PlusIcon className="h-4 w-4" />
            Novo lançamento
          </ButtonLink>
        }
      />

      {error && (
        <div className="mb-5">
          <ErrorNote>{error}</ErrorNote>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-28 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Receitas do mês" value={formatPrice(totals.receitas)} tone="success" />
            <StatCard label="Despesas do mês" value={formatPrice(totals.despesas)} tone="warning" />
            <StatCard
              label="Saldo"
              value={formatPrice(totals.saldo)}
              tone={totals.saldo >= 0 ? "accent" : "warning"}
              hint={overdue.length > 0 ? `${overdue.length} lançamento(s) em atraso` : undefined}
            />
          </div>

          <div className="mt-4">
            <Panel title="Últimos 6 meses">
              <RevenueExpenseChart data={monthly} />
            </Panel>
          </div>

          <div className="mt-6 mb-4 flex gap-2">
            {TABS.map((item) => (
              <button
                key={item.value}
                onClick={() => setTab(item.value)}
                aria-pressed={tab === item.value}
                className={cn(
                  "h-10 rounded-xl border px-4 text-[13px] transition-colors",
                  tab === item.value
                    ? "accent-border accent-soft accent-text font-semibold"
                    : "border-white/12 text-mute hover:border-white/30 hover:text-cream",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <TransactionTable transactions={filtered} onDelete={handleDelete} />
        </>
      )}
    </>
  );
}
