"use client";

import Link from "next/link";
import { useStoreView } from "@/lib/store-view-context";
import { buildStoreMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { StoreImage } from "./store-image";
import { ArrowRightIcon, ChatIcon, TRUST_ICONS } from "@/components/icons";

export function Hero() {
  const { store, vehicles } = useStoreView();

  const root = `/loja/${store.slug}`;

  // Ordem de preferência da imagem: a que a loja escolheu para o banner, a
  // capa da loja e, só então, a foto do veículo em destaque. Sem nenhuma
  // delas o StoreImage desenha o placeholder — nunca imagem quebrada, nunca
  // uma URL externa que pode sair do ar.
  const featured = vehicles.find((v) => v.featured && v.coverUrl) ?? vehicles.find((v) => v.coverUrl);
  const image = store.heroImageUrl ?? store.coverUrl ?? featured?.coverUrl;

  const whatsappHref = store.whatsappNumber
    ? buildWhatsAppUrl(store.whatsappNumber, buildStoreMessage(store))
    : `${root}/contato`;

  // Três selos no rodapé do banner, tirados dos que a loja configurou.
  const chips = store.trustBadges.slice(0, 3);

  return (
    <section className="relative isolate overflow-hidden bg-ink">
      <div className="absolute inset-0">
        <StoreImage
          src={image}
          alt={store.coverUrl || store.heroImageUrl ? `Fachada da ${store.name}` : `Veículo em destaque na ${store.name}`}
          priority
          sizes="100vw"
          className="h-full w-full"
        />
        <div className="absolute inset-0 hero-scrim" />
      </div>

      <div className="container-app relative flex min-h-[560px] flex-col justify-end pb-10 pt-28 sm:min-h-[600px] md:min-h-[620px] md:justify-center md:pb-24 md:pt-40 lg:min-h-[660px]">
        <div className="max-w-2xl">
          {/* Sobre foto clara, texto na cor da loja perde legibilidade — por
              isso aqui a cor vira um traço e a frase fica em branco. */}
          <p className="on-image animate-fade-in-up mb-4 flex items-center gap-3 md:mb-6">
            <span className="accent-bg h-0.5 w-8 shrink-0 rounded-full" />
            <span className="text-[12px] font-medium uppercase tracking-[0.24em] text-cream/90">
              {store.heroEyebrow || store.slogan || "Mais que carros, grandes histórias"}
            </span>
          </p>

          <h1 className="font-display text-display on-image animate-fade-in-up delay-1 text-cream">
            {store.heroTitle || "Encontre o carro ideal para você"}
          </h1>

          {store.heroSubtitle && (
            <p className="on-image animate-fade-in-up delay-2 mt-5 max-w-lg text-[1.0625rem] leading-relaxed text-cream/85 md:mt-6 md:text-[1.1875rem]">
              {store.heroSubtitle}
            </p>
          )}

          <div className="animate-fade-in-up delay-3 mt-8 flex flex-col gap-3 sm:flex-row md:mt-10">
            <Link
              href={`${root}/veiculos`}
              className="accent-bg press inline-flex h-14 items-center justify-center gap-2.5 rounded-full px-8 text-[16px] font-semibold text-ink transition-all hover:brightness-110"
            >
              Ver veículos
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
            <a
              href={whatsappHref}
              target={store.whatsappNumber ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="press inline-flex h-14 items-center justify-center gap-2.5 rounded-full border border-white/25 bg-white/5 px-8 text-[16px] text-cream backdrop-blur transition-colors hover:border-white/50 hover:bg-white/10"
            >
              <ChatIcon className="h-5 w-5" />
              Falar com consultor
            </a>
          </div>

          {chips.length > 0 && (
            <ul className="animate-fade-in-up delay-3 mt-9 flex flex-wrap gap-x-6 gap-y-3 md:mt-12">
              {chips.map((badge) => {
                const Icon = TRUST_ICONS[badge.icon] ?? TRUST_ICONS.shield;
                return (
                  <li key={badge.id} className="on-image flex items-center gap-2 text-[13.5px] text-cream/80">
                    <Icon className="h-4 w-4 accent-text" />
                    {badge.title}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
