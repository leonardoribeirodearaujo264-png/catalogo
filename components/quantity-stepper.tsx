"use client";

import { useState, type MouseEvent } from "react";
import { cn } from "@/lib/utils";

const MAX_QUANTITY = 99;

export function QuantityStepper({
  value,
  onChange,
  size = "compact",
  className,
}: {
  value: number;
  onChange: (quantity: number) => void;
  size?: "compact" | "large";
  className?: string;
}) {
  const [text, setText] = useState(String(value));
  const [syncedValue, setSyncedValue] = useState(value);

  if (value !== syncedValue) {
    setSyncedValue(value);
    setText(String(value));
  }

  function commit(raw: string) {
    const parsed = parseInt(raw, 10);
    const clamped = !Number.isFinite(parsed) || parsed < 1 ? 1 : Math.min(parsed, MAX_QUANTITY);
    onChange(clamped);
    setText(String(clamped));
  }

  function stop(e: MouseEvent) {
    e.stopPropagation();
  }

  return (
    <div
      onClick={stop}
      className={cn(
        "flex items-center overflow-hidden rounded-lg border border-[#E4E4E4] bg-white",
        className,
      )}
    >
      <button
        type="button"
        aria-label="Diminuir quantidade"
        onClick={(e) => {
          stop(e);
          commit(String(value - 1));
        }}
        className={cn(
          "flex shrink-0 items-center justify-center font-bold text-gray-600 transition-colors hover:bg-gray-50 active:scale-90",
          size === "large" ? "h-9 w-9 text-base" : "h-7 w-7 text-sm",
        )}
      >
        −
      </button>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={text}
        onClick={stop}
        onChange={(e) => setText(e.target.value.replace(/[^0-9]/g, ""))}
        onBlur={(e) => commit(e.target.value)}
        aria-label="Quantidade"
        className={cn(
          "w-full min-w-0 flex-1 border-x border-[#E4E4E4] text-center font-bold text-black outline-none",
          size === "large" ? "h-9 text-sm" : "h-7 text-xs",
        )}
      />
      <button
        type="button"
        aria-label="Aumentar quantidade"
        onClick={(e) => {
          stop(e);
          commit(String(value + 1));
        }}
        className={cn(
          "flex shrink-0 items-center justify-center font-bold text-gray-600 transition-colors hover:bg-gray-50 active:scale-90",
          size === "large" ? "h-9 w-9 text-base" : "h-7 w-7 text-sm",
        )}
      >
        +
      </button>
    </div>
  );
}
