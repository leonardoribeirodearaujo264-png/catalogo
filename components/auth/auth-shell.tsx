import type { ReactNode } from "react";

export function AuthShell({
  subtitle,
  children,
}: {
  subtitle: string;
  children: ReactNode;
}) {
  const year = new Date().getFullYear();

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a0a0a] px-4 py-10 sm:py-16">
      {/* glows decorativos — blur moderado de propósito, pra não pesar em celulares mais fracos */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-red-600/25 blur-[70px]" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 h-[260px] w-[260px] rounded-full bg-red-500/10 blur-[60px]" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-[220px] w-[220px] rounded-full bg-white/5 blur-[60px]" />

      <div className="relative w-full max-w-[420px] animate-fade-in-up">
        <div className="mb-7 flex flex-col items-center gap-4 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-rr.png"
            alt="RR Repuxação"
            className="h-20 w-20 rounded-2xl object-cover shadow-[0_8px_30px_rgba(0,0,0,0.5)] sm:h-24 sm:w-24"
          />
          <div>
            <p className="text-2xl font-extrabold tracking-tight text-white">Catálogo Digital</p>
            <p className="mt-1.5 text-sm text-white/45">{subtitle}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white p-7 shadow-[0_20px_60px_rgba(0,0,0,0.55)] sm:p-9">
          {children}
        </div>

        <p className="mt-7 text-center text-xs text-white/25">© {year} Catálogo Digital — RR Repuxação</p>
      </div>
    </div>
  );
}
