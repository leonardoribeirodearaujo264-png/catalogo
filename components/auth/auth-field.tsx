"use client";

import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { EyeIcon, EyeOffIcon } from "@/components/icons";

interface AuthFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "className"> {
  label: string;
  icon: ReactNode;
  error?: string;
  isPassword?: boolean;
}

export function AuthField({ label, icon, error, isPassword, type, id, ...props }: AuthFieldProps) {
  const [show, setShow] = useState(false);
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const resolvedType = isPassword ? (show ? "text" : "password") : type;

  return (
    <div>
      <label htmlFor={fieldId} className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-500">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>
        <input
          id={fieldId}
          type={resolvedType}
          className={cn(
            "w-full rounded-xl border bg-gray-50/70 py-3 pl-11 text-sm font-medium text-gray-900 outline-none transition-all duration-200 placeholder:font-normal placeholder:text-gray-400 focus:bg-white",
            isPassword ? "pr-11" : "pr-4",
            error
              ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
              : "border-gray-200 focus:border-gray-900 focus:ring-4 focus:ring-gray-900/5",
          )}
          aria-invalid={!!error}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            tabIndex={-1}
            aria-label={show ? "Ocultar senha" : "Mostrar senha"}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 transition-colors hover:text-gray-600"
          >
            {show ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
          </button>
        )}
      </div>
      {error && <p className="mt-1.5 animate-fade-in text-xs font-semibold text-red-500">{error}</p>}
    </div>
  );
}
