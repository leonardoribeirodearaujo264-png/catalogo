import type { FinancialTransaction } from "@/types/financial";
import type { MonthlyTotals } from "@/components/admin/financeiro/revenue-expense-chart";

const MONTH_LABELS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

function referenceDate(tx: FinancialTransaction): Date {
  return new Date(`${tx.dueDate ?? tx.paidDate ?? tx.createdAt.slice(0, 10)}T00:00:00`);
}

export function isSameMonth(date: Date, year: number, month: number): boolean {
  return date.getFullYear() === year && date.getMonth() === month;
}

/** Últimos `count` meses (mais antigo primeiro), com totais de receita/despesa. */
export function groupByMonth(transactions: FinancialTransaction[], count = 6): MonthlyTotals[] {
  const now = new Date();
  const months: { year: number; month: number }[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ year: d.getFullYear(), month: d.getMonth() });
  }

  return months.map(({ year, month }) => {
    const inMonth = transactions.filter((t) => t.status !== "cancelado" && isSameMonth(referenceDate(t), year, month));
    return {
      label: MONTH_LABELS[month],
      receita: inMonth.filter((t) => t.type === "receita").reduce((sum, t) => sum + t.amount, 0),
      despesa: inMonth.filter((t) => t.type === "despesa").reduce((sum, t) => sum + t.amount, 0),
    };
  });
}

export function currentMonthTotals(transactions: FinancialTransaction[]) {
  const now = new Date();
  const inMonth = transactions.filter((t) => t.status !== "cancelado" && isSameMonth(referenceDate(t), now.getFullYear(), now.getMonth()));
  const receitas = inMonth.filter((t) => t.type === "receita").reduce((sum, t) => sum + t.amount, 0);
  const despesas = inMonth.filter((t) => t.type === "despesa").reduce((sum, t) => sum + t.amount, 0);
  return { receitas, despesas, saldo: receitas - despesas };
}
