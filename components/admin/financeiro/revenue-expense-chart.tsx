import { formatPrice } from "@/lib/utils";

export interface MonthlyTotals {
  label: string;
  receita: number;
  despesa: number;
}

const RECEITA_COLOR = "#008300";
const DESPESA_COLOR = "#e34948";

export function RevenueExpenseChart({ data }: { data: MonthlyTotals[] }) {
  const max = Math.max(1, ...data.flatMap((d) => [d.receita, d.despesa]));

  return (
    <div>
      <div className="mb-4 flex items-center gap-4 text-xs font-semibold text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: RECEITA_COLOR }} />
          Receitas
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: DESPESA_COLOR }} />
          Despesas
        </span>
      </div>

      <div className="flex h-40 items-end gap-3 sm:gap-5">
        {data.map((d) => (
          <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-32 w-full items-end justify-center gap-1">
              <div
                className="group/bar relative w-full max-w-[18px] rounded-t"
                style={{ height: `${Math.max(2, (d.receita / max) * 100)}%`, backgroundColor: RECEITA_COLOR }}
              >
                <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-1.5 py-0.5 text-[10px] font-bold text-white opacity-0 transition-opacity group-hover/bar:opacity-100">
                  {formatPrice(d.receita)}
                </span>
              </div>
              <div
                className="group/bar relative w-full max-w-[18px] rounded-t"
                style={{ height: `${Math.max(2, (d.despesa / max) * 100)}%`, backgroundColor: DESPESA_COLOR }}
              >
                <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-1.5 py-0.5 text-[10px] font-bold text-white opacity-0 transition-opacity group-hover/bar:opacity-100">
                  {formatPrice(d.despesa)}
                </span>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-gray-400">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
