import { cn } from "@/lib/utils";

type Tone = "gray" | "green" | "red" | "amber" | "blue";

const TONES: Record<Tone, string> = {
  gray: "bg-gray-100 text-gray-600",
  green: "bg-green-100 text-green-700",
  red: "bg-red-100 text-red-600",
  amber: "bg-amber-100 text-amber-700",
  blue: "bg-blue-100 text-blue-700",
};

export function StatCard({
  label,
  value,
  icon,
  tone = "gray",
}: {
  label: string;
  value: string | number;
  icon: string;
  tone?: Tone;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center gap-3">
        <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg font-bold", TONES[tone])}>
          {icon}
        </span>
        <div className="min-w-0">
          <p className="truncate text-2xl font-extrabold text-gray-900">{value}</p>
          <p className="text-xs font-semibold text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  );
}
