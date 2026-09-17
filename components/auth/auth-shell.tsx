import Link from "next/link";
import type { ReactNode } from "react";
import { CarIcon } from "@/components/icons";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-ink">
      <div className="container-app flex h-[72px] items-center">
        <Link href="/" className="flex items-center gap-2.5">
          <CarIcon className="h-6 w-6 accent-text" />
          <span className="brand-wordmark text-[15px] uppercase text-cream">Car Select</span>
        </Link>
      </div>

      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="surface rounded-2xl p-7 sm:p-9">
            <h1 className="font-display text-[28px] leading-tight text-cream">{title}</h1>
            <p className="mt-2 mb-7 text-[14px] leading-relaxed text-mute">{subtitle}</p>
            {children}
          </div>
          <div className="mt-6 text-center text-[13.5px] text-mute">{footer}</div>
        </div>
      </main>
    </div>
  );
}
