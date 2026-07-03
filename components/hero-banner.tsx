"use client";

import Link from "next/link";
import { useSettings } from "@/lib/settings-context";
import { ArrowRightIcon } from "@/components/icons";

export function HeroBanner() {
  const { settings } = useSettings();

  return (
    <section
      className="relative overflow-hidden bg-gray-950 text-white"
      style={settings.bannerUrl ? { backgroundImage: `url(${settings.bannerUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
    >
      {settings.bannerUrl && <div className="absolute inset-0 bg-gray-950/70" />}
      <div className="container-app relative flex flex-col items-start gap-5 py-20 md:py-28">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/80">
          {settings.niche}
        </span>
        <h1 className="max-w-2xl text-4xl font-extrabold leading-tight md:text-5xl">
          {settings.heroTitle}
        </h1>
        <p className="max-w-xl text-base text-white/70 md:text-lg">{settings.heroSubtitle}</p>
        <Link
          href="/catalogo"
          className="mt-2 inline-flex items-center gap-2 rounded-xl bg-brand-accent px-6 py-3.5 text-sm font-bold text-white transition-transform hover:scale-[1.02]"
        >
          Ver catálogo completo
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
