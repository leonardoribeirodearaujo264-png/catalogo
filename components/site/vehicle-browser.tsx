"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { useStoreView } from "@/lib/store-view-context";
import { activeFilterCount, filterVehicles, filtersFromParams, paramsFromFilters } from "@/lib/filter-vehicles";
import {
  BODY_TYPE_LABELS,
  CONDITION_LABELS,
  FUEL_LABELS,
  MILEAGE_RANGES,
  PRICE_RANGES,
  SORT_OPTIONS,
  TRANSMISSION_LABELS,
  yearOptions,
} from "@/lib/vehicle-options";
import { cn } from "@/lib/utils";
import { buildStoreMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import type { VehicleFilters } from "@/types/vehicle";
import { VehicleCard } from "./vehicle-card";
import { BottomSheet } from "@/components/ui/sheet";
import { Select } from "@/components/ui/field";
import { CarIcon, ChatIcon, CloseIcon, FilterIcon, SearchIcon } from "@/components/icons";

const PAGE_SIZE = 12;

/**
 * Lista com filtros. Os veículos já vêm do servidor (SSR), então filtrar é
 * instantâneo; a URL é atualizada em paralelo para o link continuar
 * compartilhável e o botão voltar funcionar.
 */
export function VehicleBrowser() {
  const { store, vehicles, brands, modelsByBrand } = useStoreView();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filters = useMemo(() => filtersFromParams(searchParams), [searchParams]);
  const results = useMemo(() => filterVehicles(vehicles, filters), [vehicles, filters]);
  const count = activeFilterCount(filters);

  const setFilters = useCallback(
    (patch: Partial<VehicleFilters>) => {
      const next = { ...filters, ...patch };
      if (patch.brand !== undefined) next.model = "";
      const query = paramsFromFilters(next).toString();
      router.replace(`/loja/${store.slug}/veiculos${query ? `?${query}` : ""}`, { scroll: false });
      setVisible(PAGE_SIZE);
    },
    [filters, router, store.slug],
  );

  const clearAll = useCallback(() => {
    router.replace(`/loja/${store.slug}/veiculos`, { scroll: false });
    setVisible(PAGE_SIZE);
  }, [router, store.slug]);

  const years = useMemo(() => {
    const available = new Set<number>();
    for (const vehicle of vehicles) {
      if (vehicle.yearModel) available.add(vehicle.yearModel);
    }
    return yearOptions().filter((year) => available.has(year));
  }, [vehicles]);

  const versions = useMemo(() => {
    const list = vehicles
      .filter((v) => (!filters.brand || v.brand === filters.brand) && (!filters.model || v.model === filters.model))
      .map((v) => v.version)
      .filter(Boolean);
    return Array.from(new Set(list)).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [vehicles, filters.brand, filters.model]);

  const panel = (
    <FilterPanel
      filters={filters}
      onChange={setFilters}
      onClear={clearAll}
      brands={brands}
      models={filters.brand ? (modelsByBrand[filters.brand] ?? []) : []}
      versions={versions}
      years={years}
      activeCount={count}
    />
  );

  const whatsappHref = store.whatsappNumber
    ? buildWhatsAppUrl(store.whatsappNumber, buildStoreMessage(store))
    : `/loja/${store.slug}/contato`;

  return (
    <div className="container-app section-y">
      <div className="grid gap-10 lg:grid-cols-[288px_minmax(0,1fr)] lg:gap-12">
        <aside className="hidden lg:block">
          <div className="surface sticky top-28 rounded-2xl p-5">{panel}</div>
        </aside>

        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[15px] text-mute">
              <span className="font-display text-[1.75rem] leading-none text-cream">{results.length}</span>{" "}
              {results.length === 1 ? "veículo encontrado" : "veículos encontrados"}
            </p>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setSheetOpen(true)}
                className="press inline-flex h-12 items-center gap-2 rounded-full border border-white/15 px-5 text-[14.5px] text-cream lg:hidden"
              >
                <FilterIcon className="h-4 w-4" />
                Filtrar
                {count > 0 && (
                  <span className="accent-bg flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold text-ink">
                    {count}
                  </span>
                )}
              </button>

              <Select
                aria-label="Ordenar resultados"
                value={filters.sort}
                onChange={(event) => setFilters({ sort: event.target.value })}
                className="w-[180px]"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {count > 0 && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <ActiveChips filters={filters} onChange={setFilters} />
              <button
                onClick={clearAll}
                className="press inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] text-mute underline underline-offset-4 hover:text-cream"
              >
                Limpar tudo
              </button>
            </div>
          )}

          {results.length === 0 ? (
            <div className="surface rounded-3xl px-6 py-16 text-center">
              <span className="accent-border accent-text accent-soft mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border">
                <CarIcon className="h-8 w-8" />
              </span>
              <h3 className="font-display text-h3 text-cream">
                {count > 0 ? "Nenhum veículo com esses filtros" : "Catálogo em montagem"}
              </h3>
              <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-mute">
                {count > 0
                  ? "Tente ampliar a busca removendo algum filtro, ou fale com um consultor para procurarmos o carro certo."
                  : "Esta loja ainda não publicou veículos. Fale com um consultor e conte o que você procura."}
              </p>
              <div className="mt-7 flex flex-col justify-center gap-2.5 sm:flex-row">
                {count > 0 && (
                  <button
                    onClick={clearAll}
                    className="press inline-flex h-13 min-h-[52px] items-center justify-center rounded-full border border-white/15 px-7 text-[15px] text-cream"
                  >
                    Limpar filtros
                  </button>
                )}
                <a
                  href={whatsappHref}
                  target={store.whatsappNumber ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="accent-bg press inline-flex h-13 min-h-[52px] items-center justify-center gap-2.5 rounded-full px-7 text-[15px] font-semibold text-ink"
                >
                  <ChatIcon className="h-5 w-5" />
                  Falar com um consultor
                </a>
              </div>
            </div>
          ) : (
            <>
              <div
                className={cn(
                  "grid auto-rows-fr gap-3 md:gap-5 lg:gap-6",
                  results.length === 1
                    ? "mx-auto max-w-md"
                    : "grid-cols-2 max-[349px]:grid-cols-1 2xl:grid-cols-3",
                )}
              >
                {results.slice(0, visible).map((vehicle, index) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} priority={index < 3} />
                ))}
              </div>

              {visible < results.length && (
                <div className="mt-10 flex justify-center">
                  <button
                    onClick={() => setVisible((value) => value + PAGE_SIZE)}
                    className="press inline-flex h-13 min-h-[52px] items-center rounded-full border border-white/15 px-8 text-[15px] text-cream transition-colors hover:accent-border hover:accent-text"
                  >
                    Carregar mais ({results.length - visible})
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Filtrar veículos"
        description={`${results.length} ${results.length === 1 ? "resultado" : "resultados"} com os filtros atuais`}
        footer={
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={clearAll}
              disabled={count === 0}
              className="press h-13 min-h-[52px] flex-1 rounded-full border border-white/15 text-[15px] text-mute disabled:opacity-40"
            >
              Limpar
            </button>
            <button
              type="button"
              onClick={() => setSheetOpen(false)}
              className="accent-bg press h-13 min-h-[52px] flex-[1.6] rounded-full text-[15px] font-semibold text-ink"
            >
              Aplicar filtros
            </button>
          </div>
        }
      >
        <div className="pt-1">{panel}</div>
      </BottomSheet>
    </div>
  );
}

/** Resumo do que está filtrado, com remoção item a item. */
function ActiveChips({
  filters,
  onChange,
}: {
  filters: VehicleFilters;
  onChange: (patch: Partial<VehicleFilters>) => void;
}) {
  const chips: { key: keyof VehicleFilters; label: string }[] = [];

  if (filters.q) chips.push({ key: "q", label: `"${filters.q}"` });
  if (filters.brand) chips.push({ key: "brand", label: filters.brand });
  if (filters.model) chips.push({ key: "model", label: filters.model });
  if (filters.version) chips.push({ key: "version", label: filters.version });
  if (filters.year) chips.push({ key: "year", label: filters.year });
  if (filters.priceRange) {
    const range = PRICE_RANGES.find((r) => r.value === filters.priceRange);
    if (range) chips.push({ key: "priceRange", label: range.label });
  }
  if (filters.mileage) {
    const range = MILEAGE_RANGES.find((r) => r.value === filters.mileage);
    if (range) chips.push({ key: "mileage", label: range.label });
  }
  if (filters.bodyType) {
    chips.push({ key: "bodyType", label: BODY_TYPE_LABELS[filters.bodyType as keyof typeof BODY_TYPE_LABELS] });
  }
  if (filters.transmission) {
    chips.push({
      key: "transmission",
      label: TRANSMISSION_LABELS[filters.transmission as keyof typeof TRANSMISSION_LABELS],
    });
  }
  if (filters.fuel) chips.push({ key: "fuel", label: FUEL_LABELS[filters.fuel as keyof typeof FUEL_LABELS] });
  if (filters.condition) {
    chips.push({ key: "condition", label: CONDITION_LABELS[filters.condition as keyof typeof CONDITION_LABELS] });
  }

  return (
    <>
      {chips.map((chip) => (
        <button
          key={chip.key}
          onClick={() => onChange({ [chip.key]: "" } as Partial<VehicleFilters>)}
          className="accent-soft accent-border accent-text press inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-[13px]"
          aria-label={`Remover filtro ${chip.label}`}
        >
          {chip.label}
          <CloseIcon className="h-3.5 w-3.5" />
        </button>
      ))}
    </>
  );
}

function FilterPanel({
  filters,
  onChange,
  onClear,
  brands,
  models,
  versions,
  years,
  activeCount,
}: {
  filters: VehicleFilters;
  onChange: (patch: Partial<VehicleFilters>) => void;
  onClear: () => void;
  brands: string[];
  models: string[];
  versions: string[];
  years: number[];
  activeCount: number;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite-500" />
        <input
          type="search"
          value={filters.q}
          onChange={(event) => onChange({ q: event.target.value })}
          placeholder="Buscar por marca, modelo..."
          aria-label="Buscar veículos"
          className="h-12 w-full rounded-xl border border-white/12 bg-graphite-900 pl-11 pr-4 text-[15px] text-cream placeholder:text-graphite-500 focus:border-[var(--store-accent)] focus:outline-none"
        />
      </div>

      <Select label="Marca" value={filters.brand} onChange={(e) => onChange({ brand: e.target.value })}>
        <option value="">Todas</option>
        {brands.map((brand) => (
          <option key={brand} value={brand}>
            {brand}
          </option>
        ))}
      </Select>

      <Select
        label="Modelo"
        value={filters.model}
        disabled={!filters.brand}
        onChange={(e) => onChange({ model: e.target.value })}
      >
        <option value="">Todos</option>
        {models.map((model) => (
          <option key={model} value={model}>
            {model}
          </option>
        ))}
      </Select>

      {versions.length > 0 && (
        <Select label="Versão" value={filters.version} onChange={(e) => onChange({ version: e.target.value })}>
          <option value="">Todas</option>
          {versions.map((version) => (
            <option key={version} value={version}>
              {version}
            </option>
          ))}
        </Select>
      )}

      <Select label="Ano" value={filters.year} onChange={(e) => onChange({ year: e.target.value })}>
        <option value="">Todos</option>
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </Select>

      <Select
        label="Faixa de preço"
        value={filters.priceRange}
        onChange={(e) => onChange({ priceRange: e.target.value })}
      >
        <option value="">Todas</option>
        {PRICE_RANGES.map((range) => (
          <option key={range.value} value={range.value}>
            {range.label}
          </option>
        ))}
      </Select>

      <Select label="Tipo de veículo" value={filters.bodyType} onChange={(e) => onChange({ bodyType: e.target.value })}>
        <option value="">Todos</option>
        {Object.entries(BODY_TYPE_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>

      <Select label="Câmbio" value={filters.transmission} onChange={(e) => onChange({ transmission: e.target.value })}>
        <option value="">Todos</option>
        {Object.entries(TRANSMISSION_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>

      <Select label="Combustível" value={filters.fuel} onChange={(e) => onChange({ fuel: e.target.value })}>
        <option value="">Todos</option>
        {Object.entries(FUEL_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>

      <Select label="Quilometragem" value={filters.mileage} onChange={(e) => onChange({ mileage: e.target.value })}>
        <option value="">Todas</option>
        {MILEAGE_RANGES.map((range) => (
          <option key={range.value} value={range.value}>
            {range.label}
          </option>
        ))}
      </Select>

      <div className="flex flex-col gap-2.5">
        <span className="text-[13px] font-medium text-mute">Condição</span>
        <div className="flex flex-wrap gap-2">
          {[["", "Todos"], ...Object.entries(CONDITION_LABELS)].map(([value, label]) => (
            <button
              key={value || "todos"}
              type="button"
              onClick={() => onChange({ condition: value })}
              className={cn(
                "press h-11 rounded-full border px-4 text-[14px] transition-colors",
                filters.condition === value
                  ? "accent-border accent-soft accent-text"
                  : "border-white/12 text-mute hover:border-white/30 hover:text-cream",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {activeCount > 0 && (
        <button
          type="button"
          onClick={onClear}
          className="press mt-1 inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/12 text-[14.5px] text-mute transition-colors hover:border-white/30 hover:text-cream"
        >
          <CloseIcon className="h-4 w-4" />
          Limpar filtros ({activeCount})
        </button>
      )}
    </div>
  );
}
