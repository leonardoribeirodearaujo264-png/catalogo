"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useStoreView } from "@/lib/store-view-context";
import { cn, formatPhone } from "@/lib/utils";
import { buildStoreMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { StoreImage } from "./store-image";
import { VehicleCard } from "./vehicle-card";
import {
  ArrowRightIcon,
  CarIcon,
  ChatIcon,
  ChevronDownIcon,
  ClockIcon,
  FacebookIcon,
  GlobeIcon,
  InstagramIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  TRUST_ICONS,
  WhatsAppIcon,
  YoutubeIcon,
} from "@/components/icons";

/** Título de seção com sobrelinha — usado em todas as faixas da vitrine. */
function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-5 md:mb-12">
      <div className="max-w-xl">
        <p className="eyebrow mb-3">{eyebrow}</p>
        <h2 className="font-display text-h2 text-cream">{title}</h2>
        {description && <p className="mt-3 text-[15px] leading-relaxed text-mute md:text-[17px]">{description}</p>}
      </div>
      {action}
    </div>
  );
}

// ── Selos de confiança ───────────────────────────────────────

export function TrustStrip() {
  const { store } = useStoreView();
  if (store.trustBadges.length === 0) return null;

  return (
    <section className="band">
      {/* Quatro selos numa linha só, em qualquer tela. No celular sobram ~76px
          por coluna, então o item vira ícone + título centralizados e a
          descrição fica para o desktop — cabe inteiro, sem corte nem rolagem
          lateral. */}
      <div className="container-app section-y">
        <div className="grid grid-cols-4 gap-2 sm:gap-5 md:gap-8">
          {store.trustBadges.map((badge) => {
            const Icon = TRUST_ICONS[badge.icon] ?? TRUST_ICONS.shield;
            return (
              <div
                key={badge.id}
                className="flex flex-col items-center gap-2 text-center md:items-start md:gap-4 md:text-left"
              >
                <span className="accent-border accent-text accent-soft flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border md:h-13 md:w-13 md:rounded-2xl">
                  <Icon className="h-5 w-5 md:h-6 md:w-6" />
                </span>
                <div className="min-w-0">
                  <h3 className="line-clamp-2 text-[10.5px] font-semibold leading-tight text-cream sm:text-[13px] md:text-[17px] md:leading-snug">
                    {badge.title}
                  </h3>
                  <p className="mt-1.5 hidden text-[14.5px] leading-relaxed text-mute md:block">
                    {badge.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── Veículos em destaque ─────────────────────────────────────

export function FeaturedVehicles() {
  const { store, vehicles } = useStoreView();

  // Os destaques vêm primeiro; o resto do estoque completa a lista. Sem isso
  // uma loja com 3 destaques deixava um card órfão sozinho na última linha.
  // São 4 no celular (2×2) e 6 no desktop (2 linhas de 3) — em nenhum dos
  // dois sobra card solto.
  const featured = vehicles.filter((v) => v.featured);
  const resto = vehicles.filter((v) => !v.featured);
  const list = [...featured, ...resto].slice(0, 6);
  const whatsappHref = store.whatsappNumber
    ? buildWhatsAppUrl(store.whatsappNumber, buildStoreMessage(store))
    : `/loja/${store.slug}/contato`;

  return (
    <section className="glow-accent">
      <div className="container-app section-y">
        <SectionHeading
          eyebrow="Estoque selecionado"
          title="Veículos em destaque"
          description="Cada carro passa por revisão e checagem de procedência antes de entrar no catálogo."
          action={
            vehicles.length > 0 ? (
              <Link
                href={`/loja/${store.slug}/veiculos`}
                className="accent-text press inline-flex h-12 items-center gap-2 rounded-full border accent-border px-6 text-[14.5px] font-medium transition-colors hover:bg-[var(--store-accent-soft)]"
              >
                Ver todos os veículos
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            ) : null
          }
        />

        {list.length === 0 ? (
          <EmptyStock whatsappHref={whatsappHref} storeName={store.name} hasWhatsApp={!!store.whatsappNumber} />
        ) : (
          <div
            className={cn(
              "grid auto-rows-fr gap-3 md:gap-5 lg:gap-6",
              // Um carro sozinho não pode ficar perdido num canto da grade.
              list.length === 1
                ? "mx-auto max-w-md"
                : list.length === 2
                  ? "mx-auto grid-cols-2 sm:max-w-3xl"
                  : "grid-cols-2 max-[349px]:grid-cols-1 lg:grid-cols-3",
            )}
          >
            {list.map((vehicle, index) => (
              // Os dois últimos só entram no desktop: ficam no HTML (bom para
              // busca e para quem compartilha a página), mas não empurram a
              // home do celular para baixo.
              <div key={vehicle.id} className={cn("h-full", index >= 4 && "hidden lg:block")}>
                <VehicleCard vehicle={vehicle} priority={index < 3} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function EmptyStock({
  whatsappHref,
  storeName,
  hasWhatsApp,
}: {
  whatsappHref: string;
  storeName: string;
  hasWhatsApp: boolean;
}) {
  return (
    <div className="surface relative overflow-hidden rounded-3xl px-6 py-14 text-center md:py-20">
      <div className="absolute inset-0 opacity-[0.05]">
        <CarIcon className="absolute -right-10 -top-10 h-64 w-64 text-cream" />
      </div>
      <div className="relative mx-auto max-w-md">
        <span className="accent-border accent-text accent-soft mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border">
          <CarIcon className="h-8 w-8" />
        </span>
        <h3 className="font-display text-h3 text-cream">Novos veículos chegando</h3>
        <p className="mt-3 text-[15px] leading-relaxed text-mute">
          A {storeName} está preparando o estoque. Fale com um consultor e conte o que você procura — a gente
          avisa assim que entrar algo com o seu perfil.
        </p>
        <a
          href={whatsappHref}
          target={hasWhatsApp ? "_blank" : undefined}
          rel="noopener noreferrer"
          className="accent-bg press mt-7 inline-flex h-13 min-h-[52px] items-center justify-center gap-2.5 rounded-full px-7 text-[15px] font-semibold text-ink"
        >
          <ChatIcon className="h-5 w-5" />
          Falar com um consultor
        </a>
      </div>
    </div>
  );
}

// ── Apresentação da loja ─────────────────────────────────────

export function AboutSection() {
  const { store, vehicles } = useStoreView();

  // Indicador só aparece quando a loja informou o número — nunca inventamos
  // "+500 veículos vendidos" para uma loja que acabou de entrar. O contador
  // de estoque é o único derivado, porque conta o que está publicado agora.
  const stats = [
    { value: store.statVehiclesSold, label: "Veículos vendidos", format: (v: number) => `+${v}` },
    { value: store.statSatisfaction, label: "Clientes satisfeitos", format: (v: number) => `${v}%` },
    { value: store.statYearsMarket, label: "Anos de mercado", format: (v: number) => `+${v}` },
    vehicles.length > 0
      ? { value: vehicles.length, label: "Veículos no estoque", format: (v: number) => String(v) }
      : null,
  ].filter((stat): stat is { value: number; label: string; format: (v: number) => string } => !!stat && typeof stat.value === "number");

  if (!store.description && !store.aboutImageUrl && stats.length === 0) return null;

  return (
    <section className="band">
      <div className="container-app section-y">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
          <div className="relative order-2 lg:order-1">
            <StoreImage
              src={store.aboutImageUrl ?? store.coverUrl}
              alt={`Estrutura da ${store.name}`}
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="aspect-4/3 w-full lg:aspect-5/4"
              rounded="rounded-3xl"
            />
            <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/10" />
          </div>

          <div className="order-1 lg:order-2">
            <p className="eyebrow mb-3">Sobre a loja</p>
            <h2 className="font-display text-h2 text-cream">
              {store.slogan || "Seu próximo carro está aqui"}
            </h2>

            {store.description && (
              <p className="mt-5 whitespace-pre-line text-[15.5px] leading-relaxed text-mute md:text-[17px]">
                {store.description}
              </p>
            )}

            {stats.length > 0 && (
              <dl className="mt-9 grid grid-cols-2 gap-x-6 gap-y-7 border-t border-white/8 pt-8 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <dd className="font-display text-[2rem] leading-none accent-text">
                      {stat.format(stat.value)}
                    </dd>
                    <dt className="mt-2 text-[13px] leading-snug text-mute">{stat.label}</dt>
                  </div>
                ))}
              </dl>
            )}

            <div className="mt-9">
              <StoreContactLines />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function StoreContactLines({ compact }: { compact?: boolean }) {
  const { store } = useStoreView();
  const address = store.address;

  const addressLine = [
    [address.street, address.number].filter(Boolean).join(", "),
    address.neighborhood,
    [address.city, address.state].filter(Boolean).join("/"),
  ]
    .filter(Boolean)
    .join(" · ");

  if (!addressLine && !store.phone && store.businessHours.length === 0) return null;

  return (
    <div className={cn("flex flex-col gap-3", compact ? "text-[13.5px]" : "text-[14.5px]", "text-mute")}>
      {addressLine && (
        <p className="flex items-start gap-3">
          <MapPinIcon className="mt-0.5 h-[18px] w-[18px] shrink-0 accent-text" />
          {addressLine}
        </p>
      )}
      {store.phone && (
        <a href={`tel:${store.phone}`} className="flex items-center gap-3 transition-colors hover:text-cream">
          <PhoneIcon className="h-[18px] w-[18px] shrink-0 accent-text" />
          {formatPhone(store.phone)}
        </a>
      )}
      {store.businessHours.length > 0 && (
        <div className="flex items-start gap-3">
          <ClockIcon className="mt-0.5 h-[18px] w-[18px] shrink-0 accent-text" />
          <span className="flex flex-col gap-1">
            {store.businessHours.map((hour) => (
              <span key={hour.label}>
                <span className="text-cream">{hour.label}:</span> {hour.hours}
              </span>
            ))}
          </span>
        </div>
      )}
    </div>
  );
}

// ── Faixa de chamada antes do rodapé ─────────────────────────

export function CallToActionBand() {
  const { store, vehicles } = useStoreView();

  const whatsappHref = store.whatsappNumber
    ? buildWhatsAppUrl(store.whatsappNumber, buildStoreMessage(store))
    : `/loja/${store.slug}/contato`;

  // Imagem discreta ao fundo: capa da loja ou um carro do próprio estoque.
  const backdrop = store.coverUrl ?? vehicles.find((v) => v.coverUrl)?.coverUrl;

  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0">
        <StoreImage src={backdrop} alt="" sizes="100vw" className="h-full w-full" imageClassName="opacity-30" />
        <div className="absolute inset-0 bg-linear-to-r from-ink via-ink/92 to-ink/70" />
      </div>

      <div className="container-app relative section-y">
        <div className="max-w-2xl">
          <h2 className="font-display text-h2 text-cream">Ainda não encontrou o carro ideal?</h2>
          <p className="mt-4 text-[15.5px] leading-relaxed text-mute md:text-[17px]">
            Conte para a equipe da {store.name} o que você procura — modelo, faixa de preço, forma de pagamento —
            e a gente busca a opção certa para o seu momento.
          </p>
          <a
            href={whatsappHref}
            target={store.whatsappNumber ? "_blank" : undefined}
            rel="noopener noreferrer"
            className="accent-bg press mt-8 inline-flex h-14 items-center justify-center gap-2.5 rounded-full px-8 text-[16px] font-semibold text-ink transition-all hover:brightness-110"
          >
            <ChatIcon className="h-5 w-5" />
            Falar com um consultor
          </a>
        </div>
      </div>
    </section>
  );
}

// ── Rodapé ───────────────────────────────────────────────────

const SOCIAL_ICONS = {
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  youtube: YoutubeIcon,
  site: GlobeIcon,
} as const;

export function StoreFooter() {
  const { store } = useStoreView();
  const root = `/loja/${store.slug}`;

  const socials = (Object.keys(SOCIAL_ICONS) as (keyof typeof SOCIAL_ICONS)[])
    .map((key) => ({ key, url: store.social[key] }))
    .filter((item): item is { key: keyof typeof SOCIAL_ICONS; url: string } => !!item.url);

  const links = [
    { href: root, label: "Início" },
    { href: `${root}/veiculos`, label: "Veículos" },
    { href: `${root}/sobre`, label: "Sobre nós" },
    { href: `${root}/contato`, label: "Contato" },
  ];

  return (
    <footer className="border-t border-white/8 bg-graphite-950">
      <div className="container-app py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1.2fr] md:gap-12">
          <div>
            {store.logoUrl ? (
              <Image
                src={store.logoUrl}
                alt={store.name}
                width={180}
                height={48}
                className="h-11 w-auto max-w-[180px] object-contain"
              />
            ) : (
              <span className="brand-wordmark text-[17px] uppercase text-cream">{store.name}</span>
            )}
            {store.slogan && (
              <p className="mt-4 max-w-xs text-[14.5px] leading-relaxed text-mute">{store.slogan}</p>
            )}

            {socials.length > 0 && (
              <div className="mt-6 flex gap-2.5">
                {socials.map(({ key, url }) => {
                  const Icon = SOCIAL_ICONS[key];
                  return (
                    <a
                      key={key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${store.name} no ${key}`}
                      className="press flex h-11 w-11 items-center justify-center rounded-full border border-white/12 text-mute transition-colors hover:accent-border hover:accent-text"
                    >
                      <Icon className="h-[18px] w-[18px]" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          <FooterBlock title="Navegação">
            <ul className="flex flex-col gap-3 text-[14.5px] text-mute">
              {links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition-colors hover:text-cream">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </FooterBlock>

          <FooterBlock title="Contato">
            <div className="flex flex-col gap-3 text-[14.5px] text-mute">
              {store.whatsappNumber && (
                <a
                  href={buildWhatsAppUrl(store.whatsappNumber, buildStoreMessage(store))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 transition-colors hover:text-cream"
                >
                  <WhatsAppIcon className="h-[18px] w-[18px] shrink-0 accent-text" />
                  {formatPhone(store.whatsappNumber)}
                </a>
              )}
              {store.email && (
                <a
                  href={`mailto:${store.email}`}
                  className="flex items-center gap-3 break-all transition-colors hover:text-cream"
                >
                  <MailIcon className="h-[18px] w-[18px] shrink-0 accent-text" />
                  {store.email}
                </a>
              )}
              <StoreContactLines compact />
            </div>
          </FooterBlock>
        </div>
      </div>

      <div className="border-t border-white/8">
        <div className="container-app flex flex-col items-center justify-between gap-2 py-6 text-[12.5px] text-graphite-400 sm:flex-row">
          <p className="text-center sm:text-left">
            © {new Date().getFullYear()} {store.name}
            {store.document && ` · ${store.documentType.toUpperCase()} ${store.document}`}
          </p>
          <p>
            Catálogo desenvolvido com <span className="brand-wordmark accent-text">CAR SELECT</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

/** No celular vira acordeão, para o rodapé não virar uma coluna quilométrica. */
function FooterBlock({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-t border-white/8 pt-5 md:border-0 md:pt-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 text-left md:pointer-events-none"
      >
        <span className="eyebrow-mute">{title}</span>
        <ChevronDownIcon
          className={cn("h-4 w-4 text-graphite-500 transition-transform md:hidden", open && "rotate-180")}
        />
      </button>
      <div className={cn("overflow-hidden transition-all md:mt-5 md:block md:max-h-none", open ? "mt-4 max-h-96" : "max-h-0 md:max-h-none")}>
        {children}
      </div>
    </div>
  );
}

// ── Ações fixas do celular ───────────────────────────────────

/**
 * Barra inferior do celular. Fica acima do conteúdo, mas o layout reserva
 * o espaço dela (padding no <main>), então nada é encoberto.
 */
export function MobileActionBar() {
  const { store } = useStoreView();
  const root = `/loja/${store.slug}`;

  const whatsappHref = store.whatsappNumber
    ? buildWhatsAppUrl(store.whatsappNumber, buildStoreMessage(store))
    : `${root}/contato`;

  return (
    <nav
      aria-label="Ações rápidas"
      className="surface-glass fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 lg:hidden"
    >
      <Link
        href={`${root}/veiculos`}
        className="press flex min-h-[52px] flex-col items-center justify-center gap-1 text-[11.5px] text-mute transition-colors hover:text-cream"
      >
        <CarIcon className="h-5 w-5" />
        Veículos
      </Link>
      <Link
        href={`${root}/contato`}
        className="press flex min-h-[52px] flex-col items-center justify-center gap-1 text-[11.5px] text-mute transition-colors hover:text-cream"
      >
        <MailIcon className="h-5 w-5" />
        Contato
      </Link>
      <a
        href={whatsappHref}
        target={store.whatsappNumber ? "_blank" : undefined}
        rel="noopener noreferrer"
        className="press flex min-h-[52px] flex-col items-center justify-center gap-1 text-[11.5px] font-semibold text-[#3ddc84]"
      >
        <WhatsAppIcon className="h-5 w-5" />
        WhatsApp
      </a>
    </nav>
  );
}

/** Botão flutuante só no desktop — no celular quem cumpre o papel é a barra. */
export function WhatsAppFab() {
  const { store } = useStoreView();
  if (!store.whatsappNumber) return null;

  return (
    <a
      href={buildWhatsAppUrl(store.whatsappNumber, buildStoreMessage(store))}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Falar com ${store.name} no WhatsApp`}
      className="press fixed bottom-7 right-7 z-40 hidden h-15 w-15 items-center justify-center rounded-full bg-[#25D366] text-white shadow-2xl transition-transform hover:scale-105 lg:flex"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
