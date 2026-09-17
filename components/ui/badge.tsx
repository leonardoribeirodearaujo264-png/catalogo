import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "accent" | "success" | "warning" | "danger" | "info";

const TONES: Record<Tone, string> = {
  neutral: "bg-white/8 text-mute border-white/10",
  accent: "accent-soft accent-text accent-border",
  success: "bg-emerald-500/12 text-emerald-300 border-emerald-500/25",
  warning: "bg-amber-500/12 text-amber-300 border-amber-500/25",
  danger: "bg-red-500/12 text-red-300 border-red-500/25",
  info: "bg-sky-500/12 text-sky-300 border-sky-500/25",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
