"use client";

import { useCatalogView } from "@/lib/catalog-view-context";
import { ArrowRightIcon } from "@/components/icons";

export function HeroBanner() {
  const { catalog } = useCatalogView();

  return (
    <section
      className="relative overflow-hidden bg-gray-950 text-white"
      style={catalog.bannerUrl ? { backgroundImage: `url(${catalog.bannerUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
    >
      {catalog.bannerUrl && <div className="absolute inset-0 bg-gray-950/70" />}
      <div className="container-app relative flex flex-col items-start gap-5 py-14 sm:py-20 md:py-28">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/80">
          {catalog.niche}
        </span>
        <h1 className="max-w-2xl text-3xl font-extrabold leading-tight sm:text-4xl md:text-5xl">
          {catalog.heroTitle}
        </h1>
        <p className="max-w-xl text-base text-white/70 md:text-lg">{catalog.heroSubtitle}</p>
        <a
          href="#produtos"
          className="mt-2 inline-flex items-center gap-2 rounded-xl bg-brand-accent px-6 py-3.5 text-sm font-bold text-white transition-transform hover:scale-[1.02]"
        >
          Ver catálogo completo
          <ArrowRightIcon className="h-4 w-4" />
        </a>
      </div>
    </section>
  );
}
