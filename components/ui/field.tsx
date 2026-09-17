"use client";

import type { ComponentProps, ReactNode } from "react";
import { useId } from "react";
import { cn } from "@/lib/utils";
import { ChevronDownIcon } from "@/components/icons";

const CONTROL =
  "w-full rounded-xl border border-white/12 bg-graphite-900 px-3.5 text-sm text-cream placeholder:text-graphite-500 transition-colors focus:border-[var(--store-accent)] focus:outline-none disabled:opacity-50";

function Shell({
  label,
  hint,
  error,
  htmlFor,
  children,
  className,
}: {
  label?: string;
  hint?: string;
  error?: string;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={htmlFor} className="text-[12px] font-semibold tracking-wide text-mute">
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-[12px] text-red-400">{error}</p>
      ) : hint ? (
        <p className="text-[12px] text-graphite-500">{hint}</p>
      ) : null}
    </div>
  );
}

export function Field({
  label,
  hint,
  error,
  className,
  ...rest
}: { label?: string; hint?: string; error?: string } & ComponentProps<"input">) {
  const generated = useId();
  const id = rest.id ?? generated;
  return (
    <Shell label={label} hint={hint} error={error} htmlFor={id} className={className}>
      <input {...rest} id={id} aria-invalid={!!error} className={cn(CONTROL, "h-11", error && "border-red-500/60")} />
    </Shell>
  );
}

export function TextArea({
  label,
  hint,
  error,
  className,
  ...rest
}: { label?: string; hint?: string; error?: string } & ComponentProps<"textarea">) {
  const generated = useId();
  const id = rest.id ?? generated;
  return (
    <Shell label={label} hint={hint} error={error} htmlFor={id} className={className}>
      <textarea
        rows={4}
        {...rest}
        id={id}
        aria-invalid={!!error}
        className={cn(CONTROL, "resize-y py-3 leading-relaxed", error && "border-red-500/60")}
      />
    </Shell>
  );
}

export function Select({
  label,
  hint,
  error,
  className,
  children,
  ...rest
}: { label?: string; hint?: string; error?: string } & ComponentProps<"select">) {
  const generated = useId();
  const id = rest.id ?? generated;
  return (
    <Shell label={label} hint={hint} error={error} htmlFor={id} className={className}>
      <div className="relative">
        <select
          {...rest}
          id={id}
          aria-invalid={!!error}
          className={cn(CONTROL, "h-11 appearance-none pr-10", error && "border-red-500/60")}
        >
          {children}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite-500" />
      </div>
    </Shell>
  );
}

export function Checkbox({
  label,
  description,
  ...rest
}: { label: string; description?: string } & ComponentProps<"input">) {
  const generated = useId();
  const id = rest.id ?? generated;
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-graphite-900 p-3 transition-colors hover:border-white/25"
    >
      <input type="checkbox" {...rest} id={id} className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--store-accent)]" />
      <span className="min-w-0">
        <span className="block text-sm text-cream">{label}</span>
        {description && <span className="block text-[12px] text-graphite-500">{description}</span>}
      </span>
    </label>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center gap-3 text-left text-sm text-cream"
    >
      <span
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full border transition-colors",
          checked ? "accent-bg border-transparent" : "border-white/15 bg-graphite-800",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform",
            checked ? "translate-x-5" : "translate-x-0.5",
          )}
        />
      </span>
      <span className="min-w-0">
        <span className="block">{label}</span>
        {description && <span className="block text-[12px] text-graphite-500">{description}</span>}
      </span>
    </button>
  );
}
