"use client";

import Link from "next/link";
import { useStoreView } from "@/lib/store-view-context";
import { useFavorites } from "@/lib/favorites-context";
import { useToast } from "@/lib/toast-context";
import { getBrowserClient } from "@/lib/supabase/browser-client";
import { trackStoreEvent } from "@/lib/supabase/queries";
import { buildVehicleMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { cn, formatMileage, formatVehiclePrice, formatYearPair } from "@/lib/utils";
import { BODY_TYPE_LABELS, FUEL_LABELS, TRANSMISSION_LABELS } from "@/lib/vehicle-options";
import { comparePrice, currentPrice, vehicleTitle, type Vehicle } from "@/types/vehicle";
import { StoreImage } from "./store-image";
import {
  ArrowRightIcon,
  FuelIcon,
  GaugeIcon,
  GearIcon,
  HeartIcon,
  ShareIcon,
  WhatsAppIcon,
} from "@/components/icons";

/**
 * Card do veículo em duas versões no mesmo componente: compacto (duas
 * colunas no celular) e completo a partir de lg. O que muda é densidade —
 * nome, preço e botão principal nunca somem nem cortam.
 */
export function VehicleCard({ vehicle, priority }: { vehicle: Vehicle; priority?: boolean }) {
  const { store } = useStoreView();
  const { isFavorite, toggle } = useFavorites();
  const toast = useToast();

  const href = `/loja/${store.slug}/veiculos/${vehicle.slug}`;
  const price = currentPrice(vehicle);
  const compare = comparePrice(vehicle);
  const favorite = isFavorite(vehicle.id);
  const title = vehicleTitle(vehicle);

  async function handleShare(event: React.MouseEvent) {
    event.preventDefault();
    const url = `${window.location.origin}${href}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${title} — ${store.name}`, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copiado para a área de transferência.");
      }
    } catch {
      // compartilhamento cancelado pelo visitante
    }
  }

  function handleWhatsApp() {
    const client = getBrowserClient();
    if (client) trackStoreEvent(client, store.id, "whatsapp_click", vehicle.id);
  }

  return (
    <article className="group surface press flex h-full flex-col overflow-hidden rounded-2xl transition-[border-color,transform,box-shadow] duration-300 hover:border-[var(--store-accent-border)] lg:hover:-translate-y-1">
      <Link href={href} className="relative block" aria-label={`Ver ${title}`}>
        <StoreImage
          src={vehicle.coverUrl}
          alt={`${title} ${vehicle.version}`.trim()}
          priority={priority}
          sizes="(max-width: 1023px) 50vw, 33vw"
          className="aspect-4/3 w-full"
          imageClassName="transition-transform duration-700 lg:group-hover:scale-105"
        />

        <div className="pointer-events-none absolute inset-0 card-scrim opacity-70" />

        <div className="absolute left-2 top-2 flex flex-wrap gap-1 lg:left-3 lg:top-3 lg:gap-1.5">
          {vehicle.featured && <Chip tone="accent">Destaque</Chip>}
          {vehicle.status === "reservado" && <Chip tone="warn">Reservado</Chip>}
          {compare && <Chip tone="good">Oferta</Chip>}
          {vehicle.condition === "novo" && <Chip tone="neutral">0 km</Chip>}
        </div>

        <div className="absolute right-2 top-2 flex flex-col gap-1.5 lg:right-3 lg:top-3 lg:gap-2">
          <button
            type="button"
            aria-label={favorite ? `Remover ${title} dos favoritos` : `Salvar ${title} nos favoritos`}
            aria-pressed={favorite}
            onClick={(event) => {
              event.preventDefault();
              toggle(vehicle.id);
            }}
            className={cn(
              "tap-target press flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur transition-colors lg:h-11 lg:w-11",
              favorite
                ? "accent-border accent-text bg-black/60"
                : "border-white/20 bg-black/45 text-white hover:bg-black/70",
            )}
          >
            <HeartIcon className="h-4 w-4 lg:h-[18px] lg:w-[18px]" filled={favorite} />
          </button>

          {/* No card compacto o compartilhar sai: a página do veículo tem o
              botão, e aqui ele competiria com o favorito num alvo de 9px. */}
          <button
            type="button"
            aria-label={`Compartilhar ${title}`}
            onClick={handleShare}
            className="tap-target press hidden h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white backdrop-blur transition-colors hover:bg-black/70 lg:flex"
          >
            <ShareIcon className="h-[18px] w-[18px]" />
          </button>
        </div>

        {vehicle.bodyType && (
          <span className="absolute bottom-2 left-2 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-medium tracking-wide text-cream backdrop-blur lg:bottom-3 lg:left-3 lg:px-2.5 lg:py-1 lg:text-[11px]">
            {BODY_TYPE_LABELS[vehicle.bodyType]}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2.5 p-3 lg:gap-4 lg:p-5">
        <div>
          <h3 className="font-display line-clamp-2 text-[15.5px] leading-snug text-cream lg:text-[1.375rem] lg:leading-tight">
            <Link href={href} className="transition-colors hover:accent-text">
              {title}
            </Link>
          </h3>
          {vehicle.version && (
            <p className="mt-0.5 line-clamp-1 text-[12px] text-mute lg:mt-1 lg:text-[14px]">{vehicle.version}</p>
          )}
        </div>

        <dl className="flex flex-wrap items-center gap-x-2.5 gap-y-1 border-y border-white/6 py-2 text-[11.5px] text-mute lg:gap-x-4 lg:gap-y-2 lg:py-3 lg:text-[13.5px]">
          <div className="accent-text text-[11.5px] font-semibold lg:text-[13px]">
            {formatYearPair(vehicle.yearManufacture, vehicle.yearModel)}
          </div>
          <div className="flex items-center gap-1 lg:gap-1.5">
            <GaugeIcon className="h-3.5 w-3.5 text-graphite-500 lg:h-4 lg:w-4" />
            <dd>{formatMileage(vehicle.mileage)}</dd>
          </div>
          {/* Câmbio e combustível só quando a coluna comporta sem apertar. */}
          {vehicle.transmission && (
            <div className="hidden items-center gap-1.5 sm:flex">
              <GearIcon className="h-3.5 w-3.5 text-graphite-500 lg:h-4 lg:w-4" />
              <dd>{TRANSMISSION_LABELS[vehicle.transmission]}</dd>
            </div>
          )}
          {vehicle.fuel && (
            <div className="hidden items-center gap-1.5 sm:flex">
              <FuelIcon className="h-3.5 w-3.5 text-graphite-500 lg:h-4 lg:w-4" />
              <dd>{FUEL_LABELS[vehicle.fuel]}</dd>
            </div>
          )}
        </dl>

        <div className="mt-auto">
          {compare && (
            <p className="text-[11.5px] text-graphite-500 line-through lg:text-[13.5px]">
              {formatVehiclePrice(compare)}
            </p>
          )}
          <p className="font-display text-[19px] leading-none text-cream lg:text-[1.875rem]">
            {formatVehiclePrice(price)}
          </p>
          {vehicle.financing && (
            <p className="mt-1 hidden text-[12.5px] text-mute lg:block">Aceita financiamento</p>
          )}
        </div>

        <div className="flex gap-1.5 lg:gap-2.5">
          {/* whitespace-nowrap + seta só no desktop: em 360px sobram ~86px
              para este botão, e "Ver detalhes" quebrando em duas linhas
              estourava a altura de 40px. */}
          <Link
            href={href}
            className="press inline-flex h-10 min-w-0 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-white/15 text-[12.5px] font-medium text-cream transition-colors hover:accent-border hover:accent-text lg:h-12 lg:gap-2 lg:text-[14.5px]"
          >
            Ver detalhes
            <ArrowRightIcon className="hidden h-4 w-4 lg:block" />
          </Link>

          {store.whatsappNumber && (
            <a
              href={buildWhatsAppUrl(store.whatsappNumber, buildVehicleMessage(store, vehicle))}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleWhatsApp}
              aria-label={`Falar no WhatsApp sobre ${title}`}
              className="press flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#25D366]/15 text-[#3ddc84] transition-colors hover:bg-[#25D366]/25 lg:h-12 lg:w-12"
            >
              <WhatsAppIcon className="h-[18px] w-[18px] lg:h-5 lg:w-5" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

function Chip({ children, tone }: { children: React.ReactNode; tone: "accent" | "warn" | "good" | "neutral" }) {
  const tones = {
    accent: "accent-bg text-ink",
    warn: "bg-amber-400 text-ink",
    good: "bg-emerald-400 text-ink",
    neutral: "bg-white/85 text-ink",
  };
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide lg:px-2.5 lg:py-1 lg:text-[11px]",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}
