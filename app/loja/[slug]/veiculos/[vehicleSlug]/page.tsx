import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicClient } from "@/lib/supabase/public-client";
import { fetchPublicStoreBySlug, fetchPublicVehicleBySlug } from "@/lib/supabase/queries";
import { formatMileage, formatVehiclePrice, formatYearPair } from "@/lib/utils";
import {
  BODY_TYPE_LABELS,
  CONDITION_LABELS,
  FUEL_LABELS,
  TRANSMISSION_LABELS,
  featureLabel,
} from "@/lib/vehicle-options";
import { comparePrice, currentPrice, vehicleFullTitle, vehicleTitle, type Vehicle } from "@/types/vehicle";
import { VehicleGallery } from "@/components/site/vehicle-gallery";
import { FinancingSimulator, VehicleActions } from "@/components/site/vehicle-actions";
import { SimilarVehicles } from "@/components/site/similar-vehicles";
import { VehicleViewTracker } from "@/components/site/view-tracker";
import { Badge } from "@/components/ui/badge";
import { ArrowLeftIcon, CheckIcon } from "@/components/icons";

export const revalidate = 60;

async function load(slug: string, vehicleSlug: string) {
  const client = getPublicClient();
  if (!client) return null;
  try {
    const store = await fetchPublicStoreBySlug(client, slug);
    if (!store) return null;
    const vehicle = await fetchPublicVehicleBySlug(client, store.id, vehicleSlug);
    if (!vehicle) return null;
    return { store, vehicle };
  } catch (error) {
    console.error("Erro ao carregar veículo:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; vehicleSlug: string }>;
}): Promise<Metadata> {
  const { slug, vehicleSlug } = await params;
  const data = await load(slug, vehicleSlug);
  if (!data) return { title: "Veículo não encontrado" };

  const { store, vehicle } = data;
  const title = `${vehicleFullTitle(vehicle)} — ${formatVehiclePrice(currentPrice(vehicle))}`;
  const description = [
    vehicleFullTitle(vehicle),
    formatMileage(vehicle.mileage),
    vehicle.transmission ? TRANSMISSION_LABELS[vehicle.transmission] : null,
    vehicle.fuel ? FUEL_LABELS[vehicle.fuel] : null,
    `à venda na ${store.name}.`,
  ]
    .filter(Boolean)
    .join(" · ");

  const image = vehicle.coverUrl ?? vehicle.images?.[0]?.url ?? store.coverUrl;

  return {
    title,
    description,
    alternates: { canonical: `/loja/${store.slug}/veiculos/${vehicle.slug}` },
    openGraph: {
      type: "website",
      siteName: store.name,
      title,
      description,
      url: `/loja/${store.slug}/veiculos/${vehicle.slug}`,
      locale: "pt_BR",
      images: image ? [{ url: image, width: 1200, height: 630, alt: vehicleTitle(vehicle) }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ slug: string; vehicleSlug: string }>;
}) {
  const { slug, vehicleSlug } = await params;
  const data = await load(slug, vehicleSlug);
  if (!data) notFound();

  const { store, vehicle } = data;
  const price = currentPrice(vehicle);
  const compare = comparePrice(vehicle);

  const specs = buildSpecs(vehicle);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    name: vehicleFullTitle(vehicle),
    brand: { "@type": "Brand", name: vehicle.brand },
    model: vehicle.model,
    vehicleModelDate: vehicle.yearModel ?? undefined,
    productionDate: vehicle.yearManufacture ?? undefined,
    color: vehicle.color || undefined,
    numberOfDoors: vehicle.doors ?? undefined,
    fuelType: vehicle.fuel ? FUEL_LABELS[vehicle.fuel] : undefined,
    vehicleTransmission: vehicle.transmission ? TRANSMISSION_LABELS[vehicle.transmission] : undefined,
    bodyType: vehicle.bodyType ? BODY_TYPE_LABELS[vehicle.bodyType] : undefined,
    mileageFromOdometer: { "@type": "QuantitativeValue", value: vehicle.mileage, unitCode: "KMT" },
    image: vehicle.images?.map((image) => image.url) ?? (vehicle.coverUrl ? [vehicle.coverUrl] : undefined),
    description: vehicle.description || undefined,
    offers: {
      "@type": "Offer",
      price,
      priceCurrency: "BRL",
      availability:
        vehicle.status === "disponivel"
          ? "https://schema.org/InStock"
          : "https://schema.org/LimitedAvailability",
      seller: { "@type": "AutoDealer", name: store.name },
    },
  };

  return (
    <div className="container-app pb-14 pt-[96px] md:pb-20 md:pt-[128px]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <VehicleViewTracker vehicleId={vehicle.id} />

      <Link
        href={`/loja/${store.slug}/veiculos`}
        className="mb-6 inline-flex items-center gap-2 text-sm text-mute transition-colors hover:text-cream"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Voltar para o estoque
      </Link>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-10">
        <div className="flex flex-col gap-8">
          <VehicleGallery vehicle={vehicle} />

          {vehicle.description && (
            <section className="surface rounded-2xl p-6">
              <h2 className="font-display text-xl text-cream">Sobre o veículo</h2>
              <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-mute">
                {vehicle.description}
              </p>
            </section>
          )}

          <section className="surface rounded-2xl p-6">
            <h2 className="font-display text-xl text-cream">Ficha técnica</h2>
            <dl className="mt-4 grid gap-x-8 gap-y-0 sm:grid-cols-2">
              {specs.map((spec) => (
                <div
                  key={spec.label}
                  className="flex items-center justify-between gap-4 border-b border-white/6 py-3 last:border-0"
                >
                  <dt className="text-[13px] text-mute">{spec.label}</dt>
                  <dd className="text-right text-[14px] text-cream">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {vehicle.features.length > 0 && (
            <section className="surface rounded-2xl p-6">
              <h2 className="font-display text-xl text-cream">Itens e opcionais</h2>
              <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {vehicle.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5 text-[14px] text-mute">
                    <CheckIcon className="h-4 w-4 shrink-0 accent-text" />
                    {featureLabel(feature)}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {(vehicle.documentation || vehicle.location) && (
            <section className="surface rounded-2xl p-6">
              <h2 className="font-display text-xl text-cream">Documentação e localização</h2>
              {vehicle.documentation && (
                <p className="mt-3 whitespace-pre-line text-[14px] leading-relaxed text-mute">
                  {vehicle.documentation}
                </p>
              )}
              {vehicle.location && (
                <p className="mt-3 text-[14px] text-mute">
                  <span className="text-cream">Onde está: </span>
                  {vehicle.location}
                </p>
              )}
            </section>
          )}

          {vehicle.financing && <FinancingSimulator vehicle={vehicle} />}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="surface rounded-2xl p-6">
            <div className="mb-4 flex flex-wrap gap-2">
              <Badge tone="neutral">{CONDITION_LABELS[vehicle.condition]}</Badge>
              {vehicle.status === "reservado" && <Badge tone="warning">Reservado</Badge>}
              {vehicle.featured && <Badge tone="accent">Destaque</Badge>}
              {vehicle.acceptsTrade && <Badge tone="info">Aceita troca</Badge>}
            </div>

            <h1 className="font-display text-[26px] leading-tight text-cream sm:text-3xl">
              {vehicleTitle(vehicle)}
            </h1>
            {vehicle.version && <p className="mt-1 text-[14px] text-mute">{vehicle.version}</p>}

            <p className="mt-2 text-[13px] text-graphite-500">
              {formatYearPair(vehicle.yearManufacture, vehicle.yearModel)} · {formatMileage(vehicle.mileage)}
            </p>

            <div className="mt-5 border-t border-white/8 pt-5">
              {compare && <p className="text-sm text-graphite-500 line-through">{formatVehiclePrice(compare)}</p>}
              <p className="font-display text-[36px] leading-none text-cream">{formatVehiclePrice(price)}</p>
              {vehicle.financing && (
                <p className="mt-2 text-[13px] text-mute">Financiamento disponível · simule abaixo</p>
              )}
            </div>

            <div className="mt-6">
              <VehicleActions vehicle={vehicle} />
            </div>

            {vehicle.internalCode && (
              <p className="mt-5 text-center text-[12px] text-graphite-500">
                Código interno: {vehicle.internalCode}
              </p>
            )}
          </div>
        </aside>
      </div>

      <SimilarVehicles vehicle={vehicle} />
    </div>
  );
}

function buildSpecs(vehicle: Vehicle): { label: string; value: string }[] {
  const specs: { label: string; value: string }[] = [
    { label: "Marca", value: vehicle.brand },
    { label: "Modelo", value: vehicle.model },
  ];

  if (vehicle.version) specs.push({ label: "Versão", value: vehicle.version });
  if (vehicle.yearManufacture) specs.push({ label: "Ano de fabricação", value: String(vehicle.yearManufacture) });
  if (vehicle.yearModel) specs.push({ label: "Ano do modelo", value: String(vehicle.yearModel) });
  specs.push({ label: "Quilometragem", value: formatMileage(vehicle.mileage) });
  if (vehicle.transmission) specs.push({ label: "Câmbio", value: TRANSMISSION_LABELS[vehicle.transmission] });
  if (vehicle.fuel) specs.push({ label: "Combustível", value: FUEL_LABELS[vehicle.fuel] });
  if (vehicle.color) specs.push({ label: "Cor", value: vehicle.color });
  if (vehicle.doors) specs.push({ label: "Portas", value: String(vehicle.doors) });
  if (vehicle.bodyType) specs.push({ label: "Carroceria", value: BODY_TYPE_LABELS[vehicle.bodyType] });
  if (vehicle.plateEnd) specs.push({ label: "Final da placa", value: vehicle.plateEnd });
  if (vehicle.conservation) specs.push({ label: "Estado de conservação", value: vehicle.conservation });
  specs.push({ label: "Condição", value: CONDITION_LABELS[vehicle.condition] });
  specs.push({ label: "Aceita troca", value: vehicle.acceptsTrade ? "Sim" : "Não" });
  specs.push({ label: "Financiamento", value: vehicle.financing ? "Disponível" : "Não disponível" });

  return specs;
}
