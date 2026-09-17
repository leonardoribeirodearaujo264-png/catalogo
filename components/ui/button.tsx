"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { SpinnerIcon } from "@/components/icons";

type Variant = "primary" | "outline" | "ghost" | "danger" | "soft";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  // "primary" usa a cor de acento da loja (var(--store-accent)).
  primary: "accent-bg text-ink font-semibold hover:brightness-110 border border-transparent",
  outline: "border border-white/20 text-cream hover:border-white/45 hover:bg-white/5",
  ghost: "text-mute hover:text-cream hover:bg-white/5 border border-transparent",
  danger: "bg-red-500/10 text-red-300 border border-red-500/30 hover:bg-red-500/20",
  soft: "accent-soft accent-text accent-border border hover:brightness-125",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3.5 text-[13px] gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-12 px-6 text-[15px] gap-2.5",
};

const BASE =
  "inline-flex items-center justify-center rounded-xl transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";

interface CommonProps {
  variant?: Variant;
  size?: Size;
  full?: boolean;
  children: ReactNode;
  className?: string;
}

export function Button({
  variant = "primary",
  size = "md",
  loading,
  full,
  children,
  className,
  disabled,
  ...rest
}: CommonProps & { loading?: boolean } & ComponentProps<"button">) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={cn(BASE, VARIANTS[variant], SIZES[size], full && "w-full", className)}
    >
      {loading && <SpinnerIcon className="h-4 w-4" />}
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  full,
  children,
  className,
  ...rest
}: CommonProps & ComponentProps<typeof Link>) {
  return (
    <Link {...rest} className={cn(BASE, VARIANTS[variant], SIZES[size], full && "w-full", className)}>
      {children}
    </Link>
  );
}
