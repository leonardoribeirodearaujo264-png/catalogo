"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ChevronRightIcon } from "@/components/icons";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="font-display text-[28px] leading-tight text-cream md:text-[32px]">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-mute">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "neutral",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
  tone?: "neutral" | "accent" | "success" | "warning";
}) {
  const tones = {
    neutral: "text-cream",
    accent: "accent-text",
    success: "text-emerald-300",
    warning: "text-amber-300",
  };

  return (
    <div className="surface rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[12px] font-medium tracking-wide text-mute">{label}</p>
        {icon && <span className="text-graphite-500">{icon}</span>}
      </div>
      <p className={cn("font-display mt-2 text-3xl leading-none", tones[tone])}>{value}</p>
      {hint && <p className="mt-2 text-[12px] text-graphite-500">{hint}</p>}
    </div>
  );
}

export function QuickAction({
  href,
  label,
  description,
  icon,
  onClick,
}: {
  href?: string;
  label: string;
  description?: string;
  icon: ReactNode;
  onClick?: () => void;
}) {
  const content = (
    <>
      <span className="accent-soft accent-text flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-cream">{label}</span>
        {description && <span className="block text-[12px] text-mute">{description}</span>}
      </span>
      <ChevronRightIcon className="h-4 w-4 shrink-0 text-graphite-500" />
    </>
  );

  const className =
    "surface flex w-full items-center gap-3.5 rounded-2xl p-4 text-left transition-colors hover:border-[var(--store-accent-border)]";

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}

export function Panel({
  title,
  description,
  action,
  children,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="surface rounded-2xl p-5 md:p-6">
      {(title || action) && (
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && <h2 className="font-display text-lg text-cream">{title}</h2>}
            {description && <p className="mt-1 text-[13px] text-mute">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
