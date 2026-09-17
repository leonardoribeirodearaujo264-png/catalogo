"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { AlertIcon, CloseIcon } from "@/components/icons";
import { Button } from "./button";

// ── Skeletons ────────────────────────────────────────────────

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("skeleton rounded-lg", className)} />;
}

export function VehicleCardSkeleton() {
  return (
    <div className="surface overflow-hidden rounded-2xl">
      <Skeleton className="aspect-4/3 w-full rounded-none" />
      <div className="flex flex-col gap-3 p-5">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-3.5 w-1/3" />
        <Skeleton className="h-3.5 w-1/2" />
        <Skeleton className="h-7 w-2/5" />
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    </div>
  );
}

// ── Estado vazio ─────────────────────────────────────────────

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/12 px-6 py-16 text-center">
      {icon && <div className="accent-text opacity-70">{icon}</div>}
      <h3 className="font-display text-xl text-cream">{title}</h3>
      {description && <p className="max-w-md text-sm leading-relaxed text-mute">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

// ── Erro ─────────────────────────────────────────────────────

export function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
    >
      <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

// ── Modal acessível ──────────────────────────────────────────

export function Modal({
  open,
  onClose,
  title,
  children,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "full";
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  const widths = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-3xl", full: "max-w-6xl" };

  return (
    <div className="fixed inset-0 z-100 flex items-end justify-center sm:items-center">
      <button
        aria-label="Fechar"
        onClick={onClose}
        className="absolute inset-0 animate-fade-in bg-black/80 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "surface relative z-10 max-h-[92vh] w-full overflow-y-auto rounded-t-2xl sm:rounded-2xl",
          "animate-slide-up sm:animate-scale-in",
          widths[size],
        )}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-white/8 bg-graphite-850/95 px-5 py-4 backdrop-blur">
          <h2 className="font-display text-lg text-cream">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-mute transition-colors hover:bg-white/8 hover:text-cream"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// ── Confirmação antes de excluir ─────────────────────────────

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Excluir",
  loading,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal open={open} onClose={onCancel} title={title} size="sm">
      <p className="text-sm leading-relaxed text-mute">{description}</p>
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button variant="danger" loading={loading} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
