"use client";

import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { lockBodyScroll } from "@/lib/scroll-lock";
import { CloseIcon } from "@/components/icons";

/**
 * Bottom sheet do celular: sobe de baixo, trava a rolagem do fundo, fecha
 * no Esc e no toque fora. O rodapé é fixo dentro da folha, para o botão de
 * aplicar ficar sempre alcançável com o polegar.
 */
export function BottomSheet({
  open,
  onClose,
  title,
  description,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => lockBodyScroll(open), [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-end justify-center sm:items-center sm:p-6">
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
          "animate-slide-up sm:animate-scale-in relative z-10 flex max-h-[88vh] w-full flex-col",
          "rounded-t-3xl bg-graphite-950 shadow-2xl sm:max-w-lg sm:rounded-3xl",
          "border-t border-white/10 sm:border",
        )}
      >
        <div className="shrink-0 px-5 pb-3 pt-3">
          <div aria-hidden className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/15 sm:hidden" />
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="font-display text-h3 text-cream">{title}</h2>
              {description && <p className="mt-0.5 text-[13px] text-mute">{description}</p>}
            </div>
            <button
              onClick={onClose}
              aria-label="Fechar"
              className="press flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/12 text-mute transition-colors hover:text-cream"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">{children}</div>

        {footer && (
          <div className="shrink-0 border-t border-white/8 bg-graphite-950 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
