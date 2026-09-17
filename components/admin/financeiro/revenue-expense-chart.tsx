import { formatPrice } from "@/lib/utils";

export interface MonthlyTotals {
  label: string;
  receita: number;
  despesa: number;
}

const RECEITA_COLOR = "#34d399";
const DESPESA_COLOR = "#f87171";

export function RevenueExpenseChart({ data }: { data: MonthlyTotals[] }) {
  const max = Math.max(1, ...data.flatMap((month) => [month.receita, month.despesa]));

  return (
    <div>
      <div className="mb-5 flex items-center gap-5 text-[12px] font-medium text-mute">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: RECEITA_COLOR }} />
          Receitas
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: DESPESA_COLOR }} />
          Despesas
        </span>
      </div>

      <div className="flex h-44 items-end gap-3 sm:gap-5">
        {data.map((month) => (
          <div key={month.label} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-full w-full items-end justify-center gap-1">
              <div
                className="w-1/2 rounded-t-md transition-all"
                style={{
                  height: `${Math.max((month.receita / max) * 100, month.receita > 0 ? 3 : 0)}%`,
                  backgroundColor: RECEITA_COLOR,
                }}
                title={`Receitas: ${formatPrice(month.receita)}`}
              />
              <div
                className="w-1/2 rounded-t-md transition-all"
                style={{
                  height: `${Math.max((month.despesa / max) * 100, month.despesa > 0 ? 3 : 0)}%`,
                  backgroundColor: DESPESA_COLOR,
                }}
                title={`Despesas: ${formatPrice(month.despesa)}`}
              />
            </div>
            <span className="text-[11px] uppercase tracking-wide text-graphite-500">{month.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
