"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { useStoreView } from "@/lib/store-view-context";
import { filterVehicles, paramsFromFilters } from "@/lib/filter-vehicles";
import { PRICE_RANGES, yearOptions } from "@/lib/vehicle-options";
import { EMPTY_FILTERS } from "@/types/vehicle";
import { BottomSheet } from "@/components/ui/sheet";
import { CalendarIcon, CarIcon, ChevronDownIcon, ListIcon, SearchIcon, TagIcon } from "@/components/icons";

/**
 * Busca da home. Não filtra na própria página: monta a query e leva para
 * /veiculos, que é a página que sabe filtrar e cujo link é compartilhável.
 *
 * No desktop o cartão sobe sobre o fim do banner; no celular vira uma barra
 * compacta que abre um bottom sheet — sete selects empilhados na home seriam
 * uma parede de formulário antes do primeiro carro.
 */
export function QuickSearch() {
  const { store, vehicles, brands, modelsByBrand } = useStoreView();
  const router = useRouter();

  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);

  const models = brand ? (modelsByBrand[brand] ?? []) : [];

  // Só oferece anos que existem no estoque — filtro que não devolve nada frustra.
  const years = useMemo(() => {
    const available = new Set<number>();
    for (const vehicle of vehicles) {
      if (vehicle.yearModel) available.add(vehicle.yearModel);
    }
    return yearOptions().filter((value) => available.has(value));
  }, [vehicles]);

  const draft = { ...EMPTY_FILTERS, brand, model, year, priceRange };
  const matches = useMemo(() => filterVehicles(vehicles, draft).length, [vehicles, brand, model, year, priceRange]); // eslint-disable-line react-hooks/exhaustive-deps

  function submit() {
    const query = paramsFromFilters(draft).toString();
    router.push(`/loja/${store.slug}/veiculos${query ? `?${query}` : ""}`);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    submit();
  }

  const fields = (
    <>
      <SearchSelect
        icon={<CarIcon className="h-4 w-4" />}
        label="Marca"
        value={brand}
        onChange={(value) => {
          setBrand(value);
          setModel("");
        }}
        options={brands.map((b) => ({ value: b, label: b }))}
        allLabel="Todas as marcas"
      />
      <SearchSelect
        icon={<ListIcon className="h-4 w-4" />}
        label="Modelo"
        value={model}
        onChange={setModel}
        options={models.map((m) => ({ value: m, label: m }))}
        allLabel={brand ? "Todos os modelos" : "Escolha a marca"}
        disabled={!brand}
      />
      <SearchSelect
        icon={<CalendarIcon className="h-4 w-4" />}
        label="Ano"
        value={year}
        onChange={setYear}
        options={years.map((y) => ({ value: String(y), label: String(y) }))}
        allLabel="Qualquer ano"
      />
      <SearchSelect
        icon={<TagIcon className="h-4 w-4" />}
        label="Faixa de preço"
        value={priceRange}
        onChange={setPriceRange}
        options={PRICE_RANGES.map((r) => ({ value: r.value, label: r.label }))}
        allLabel="Qualquer valor"
      />
    </>
  );

  return (
    <div className="container-app relative z-20 -mt-8 md:-mt-14">
      {/* Celular: barra compacta */}
      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        className="surface press flex w-full items-center gap-3 rounded-2xl px-5 py-4 text-left md:hidden"
      >
        <span className="accent-soft accent-text flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
          <SearchIcon className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-semibold text-cream">Encontrar meu carro</span>
          <span className="block truncate text-[13px] text-mute">
            {vehicles.length} {vehicles.length === 1 ? "veículo disponível" : "veículos disponíveis"}
          </span>
        </span>
        <ChevronDownIcon className="h-5 w-5 shrink-0 -rotate-90 text-graphite-500" />
      </button>

      {/* Desktop: cartão sobre o banner */}
      <form
        onSubmit={handleSubmit}
        className="surface hidden rounded-2xl p-6 md:grid md:grid-cols-[repeat(4,minmax(0,1fr))_auto] md:items-end md:gap-5 lg:p-7"
        style={{ boxShadow: "var(--shadow-float)" }}
      >
        {fields}
        <button
          type="submit"
          className="accent-bg press inline-flex h-[52px] items-center justify-center gap-2 rounded-xl px-8 text-[15px] font-semibold text-ink transition-all hover:brightness-110"
        >
          <SearchIcon className="h-4.5 w-4.5" />
          Buscar
        </button>
      </form>

      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Encontrar meu carro"
        description="Filtre pelo que importa para você."
        footer={
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={() => {
                setBrand("");
                setModel("");
                setYear("");
                setPriceRange("");
              }}
              className="press h-13 min-h-[52px] flex-1 rounded-full border border-white/15 text-[15px] text-mute"
            >
              Limpar
            </button>
            <button
              type="button"
              onClick={() => {
                setSheetOpen(false);
                submit();
              }}
              className="accent-bg press h-13 min-h-[52px] flex-[1.6] rounded-full text-[15px] font-semibold text-ink"
            >
              Ver {matches} {matches === 1 ? "veículo" : "veículos"}
            </button>
          </div>
        }
      >
        <div className="flex flex-col gap-4 pt-1">{fields}</div>
      </BottomSheet>
    </div>
  );
}

function SearchSelect({
  icon,
  label,
  value,
  onChange,
  options,
  allLabel,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  allLabel: string;
  disabled?: boolean;
}) {
  const id = `busca-${label.toLowerCase().replace(/\s/g, "-")}`;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="flex items-center gap-2 text-[13px] font-medium text-mute">
        <span className="accent-text">{icon}</span>
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className="h-[52px] w-full appearance-none rounded-xl border border-white/12 bg-graphite-900 px-4 pr-11 text-[15px] text-cream transition-colors focus:border-[var(--store-accent)] focus:outline-none disabled:opacity-40"
        >
          <option value="">{allLabel}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite-500" />
      </div>
    </div>
  );
}
