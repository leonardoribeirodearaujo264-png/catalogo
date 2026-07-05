"use client";

import { cn } from "@/lib/utils";
import type { SVGProps } from "react";

export type ViewMode = "grid" | "list" | "featured";

function GridIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} stroke="currentColor" {...props}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function ListIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} stroke="currentColor" {...props}>
      <circle cx="4.5" cy="6" r="1" fill="currentColor" stroke="none" />
      <circle cx="4.5" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="4.5" cy="18" r="1" fill="currentColor" stroke="none" />
      <path strokeLinecap="round" d="M8.5 6h11M8.5 12h11M8.5 18h11" />
    </svg>
  );
}

function FeaturedIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} stroke="currentColor" {...props}>
      <rect x="3.5" y="5" width="17" height="14" rx="1.5" />
    </svg>
  );
}

const OPTIONS: { mode: ViewMode; icon: (props: SVGProps<SVGSVGElement>) => React.JSX.Element; label: string }[] = [
  { mode: "grid", icon: GridIcon, label: "Blocos" },
  { mode: "list", icon: ListIcon, label: "Lista" },
  { mode: "featured", icon: FeaturedIcon, label: "Destaque" },
];

export function ViewToggle({ mode, onChange }: { mode: ViewMode; onChange: (mode: ViewMode) => void }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-[#E4E4E4] bg-white p-1">
      {OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const active = mode === opt.mode;
        return (
          <button
            key={opt.mode}
            type="button"
            onClick={() => onChange(opt.mode)}
            aria-label={opt.label}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
              active ? "bg-black text-white" : "text-black hover:bg-gray-100",
            )}
          >
            <Icon className="h-[18px] w-[18px]" />
          </button>
        );
      })}
    </div>
  );
}
