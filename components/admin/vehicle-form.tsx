"use client";

import { useState, type FormEvent } from "react";
import { useAdminStore } from "@/lib/admin-store-context";
import { cn, formatVehiclePrice } from "@/lib/utils";
import {
  BODY_TYPE_LABELS,
  CONDITION_LABELS,
  CONSERVATION_OPTIONS,
  DOOR_OPTIONS,
  FEATURE_GROUPS,
  FUEL_LABELS,
  STATUS_LABELS,
  TRANSMISSION_LABELS,
  VEHICLE_FEATURES,
  isKnownFeature,
  yearOptions,
} from "@/lib/vehicle-options";
import type { BodyType, Fuel, Transmission, Vehicle, VehicleCondition, VehicleStatus } from "@/types/vehicle";
import type { VehicleImage } from "@/types/vehicle";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Select, TextArea, Toggle } from "@/components/ui/field";
import { ErrorNote } from "@/components/ui/feedback";
import { VehicleImages } from "./vehicle-images";
import { CheckIcon, CloseIcon, PlusIcon } from "@/components/icons";

export interface VehicleFormValues {
  brand: string;
  model: string;
  version: string;
  yearManufacture: number | null;
  yearModel: number | null;
  price: number;
  pricePromo: number | null;
  pricePrevious: number | null;
  mileage: number;
  transmission: Transmission | null;
  fuel: Fuel | null;
  color: string;
  doors: number | null;
  bodyType: BodyType | null;
  plateEnd: string;
  internalCode: string;
  condition: VehicleCondition;
  conservation: string;
  acceptsTrade: boolean;
  financing: boolean;
  featured: boolean;
  status: VehicleStatus;
  published: boolean;
  description: string;
  documentation: string;
  location: string;
  features: string[];
}

const STEPS = ["Informações principais", "Informações comerciais", "Opcionais", "Fotos"];

export function emptyVehicleValues(): VehicleFormValues {
  return {
    brand: "",
    model: "",
    version: "",
    yearManufacture: null,
    yearModel: null,
    price: 0,
    pricePromo: null,
    pricePrevious: null,
    mileage: 0,
    transmission: null,
    fuel: null,
    color: "",
    doors: null,
    bodyType: null,
    plateEnd: "",
    internalCode: "",
    condition: "seminovo",
    conservation: "",
    acceptsTrade: false,
    financing: true,
    featured: false,
    status: "disponivel",
    published: true,
    description: "",
    documentation: "",
    location: "",
    features: [],
  };
}

export function vehicleToValues(vehicle: Vehicle): VehicleFormValues {
  return {
    brand: vehicle.brand,
    model: vehicle.model,
    version: vehicle.version,
    yearManufacture: vehicle.yearManufacture,
    yearModel: vehicle.yearModel,
    price: vehicle.price,
    pricePromo: vehicle.pricePromo,
    pricePrevious: vehicle.pricePrevious,
    mileage: vehicle.mileage,
    transmission: vehicle.transmission,
    fuel: vehicle.fuel,
    color: vehicle.color,
    doors: vehicle.doors,
    bodyType: vehicle.bodyType,
    plateEnd: vehicle.plateEnd,
    internalCode: vehicle.internalCode,
    condition: vehicle.condition,
    conservation: vehicle.conservation,
    acceptsTrade: vehicle.acceptsTrade,
    financing: vehicle.financing,
    featured: vehicle.featured,
    status: vehicle.status,
    published: vehicle.published,
    description: vehicle.description,
    documentation: vehicle.documentation,
    location: vehicle.location,
    features: vehicle.features,
  };
}

export function VehicleForm({
  initial,
  vehicleId,
  images,
  onImagesChange,
  onSubmit,
  submitLabel,
}: {
  initial: VehicleFormValues;
  /** Só existe na edição — fotos precisam do veículo já salvo. */
  vehicleId?: string;
  images?: VehicleImage[];
  onImagesChange?: (images: VehicleImage[]) => void;
  onSubmit: (values: VehicleFormValues) => Promise<void>;
  submitLabel: string;
}) {
  const { store, permissions } = useAdminStore();
  const [values, setValues] = useState<VehicleFormValues>(initial);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [customFeature, setCustomFeature] = useState("");

  const steps = vehicleId ? STEPS : STEPS.slice(0, 3);

  function set<K extends keyof VehicleFormValues>(key: K, value: VehicleFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!values.brand.trim()) next.brand = "Informe a marca.";
    if (!values.model.trim()) next.model = "Informe o modelo.";
    if (!values.price || values.price <= 0) next.price = "Informe o preço de venda.";
    if (values.mileage < 0) next.mileage = "A quilometragem não pode ser negativa.";
    if (values.pricePromo && values.pricePromo >= values.price) {
      next.pricePromo = "O preço promocional deve ser menor que o preço.";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) {
      setStep(next.brand || next.model || next.mileage ? 0 : 1);
      setFormError("Revise os campos destacados antes de salvar.");
      return false;
    }
    setFormError(null);
    return true;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      await onSubmit(values);
    } catch (err) {
      console.error(err);
      setFormError(err instanceof Error ? err.message : "Não foi possível salvar o veículo.");
    } finally {
      setSaving(false);
    }
  }

  function toggleFeature(slug: string) {
    set(
      "features",
      values.features.includes(slug)
        ? values.features.filter((item) => item !== slug)
        : [...values.features, slug],
    );
  }

  function addCustomFeature() {
    const value = customFeature.trim();
    if (!value || values.features.includes(value)) return;
    set("features", [...values.features, value]);
    setCustomFeature("");
  }

  const years = yearOptions();
  const canPublish = permissions.vehicles_publish;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
      <nav aria-label="Etapas do cadastro" className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        {steps.map((label, index) => (
          <button
            key={label}
            type="button"
            onClick={() => setStep(index)}
            aria-current={step === index ? "step" : undefined}
            className={cn(
              "flex h-10 shrink-0 items-center gap-2 rounded-xl border px-4 text-[13px] transition-colors",
              step === index
                ? "accent-border accent-soft accent-text font-semibold"
                : "border-white/12 text-mute hover:border-white/30 hover:text-cream",
            )}
          >
            <span
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded-full text-[11px]",
                step > index ? "accent-bg text-ink" : "bg-white/10 text-mute",
              )}
            >
              {step > index ? <CheckIcon className="h-3 w-3" /> : index + 1}
            </span>
            {label}
          </button>
        ))}
      </nav>

      {formError && <ErrorNote>{formError}</ErrorNote>}

      {step === 0 && (
        <div className="surface grid gap-4 rounded-2xl p-5 sm:grid-cols-2 md:p-6">
          <Field
            label="Marca *"
            value={values.brand}
            onChange={(e) => set("brand", e.target.value)}
            error={errors.brand}
            placeholder="Toyota"
            required
          />
          <Field
            label="Modelo *"
            value={values.model}
            onChange={(e) => set("model", e.target.value)}
            error={errors.model}
            placeholder="Corolla"
            required
          />
          <Field
            label="Versão"
            value={values.version}
            onChange={(e) => set("version", e.target.value)}
            placeholder="XEi 2.0 Flex"
            className="sm:col-span-2"
          />

          <Select
            label="Ano de fabricação"
            value={values.yearManufacture ?? ""}
            onChange={(e) => set("yearManufacture", e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">Selecione</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </Select>
          <Select
            label="Ano do modelo"
            value={values.yearModel ?? ""}
            onChange={(e) => set("yearModel", e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">Selecione</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </Select>

          <Field
            label="Preço de venda *"
            value={values.price || ""}
            onChange={(e) => set("price", Number(e.target.value.replace(/\D/g, "")))}
            error={errors.price}
            inputMode="numeric"
            hint={values.price ? formatVehiclePrice(values.price) : "Somente números."}
            required
          />
          <Field
            label="Quilometragem"
            value={values.mileage || ""}
            onChange={(e) => set("mileage", Number(e.target.value.replace(/\D/g, "")))}
            error={errors.mileage}
            inputMode="numeric"
            hint={`${values.mileage.toLocaleString("pt-BR")} km`}
          />

          <Select
            label="Câmbio"
            value={values.transmission ?? ""}
            onChange={(e) => set("transmission", (e.target.value || null) as Transmission | null)}
          >
            <option value="">Selecione</option>
            {Object.entries(TRANSMISSION_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Select
            label="Combustível"
            value={values.fuel ?? ""}
            onChange={(e) => set("fuel", (e.target.value || null) as Fuel | null)}
          >
            <option value="">Selecione</option>
            {Object.entries(FUEL_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>

          <Field label="Cor" value={values.color} onChange={(e) => set("color", e.target.value)} placeholder="Preto" />
          <Select
            label="Portas"
            value={values.doors ?? ""}
            onChange={(e) => set("doors", e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">Selecione</option>
            {DOOR_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>

          <Select
            label="Carroceria"
            value={values.bodyType ?? ""}
            onChange={(e) => set("bodyType", (e.target.value || null) as BodyType | null)}
          >
            <option value="">Selecione</option>
            {Object.entries(BODY_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Field
            label="Final da placa"
            value={values.plateEnd}
            maxLength={1}
            onChange={(e) => set("plateEnd", e.target.value.replace(/\D/g, ""))}
            inputMode="numeric"
          />

          <Field
            label="Código interno"
            value={values.internalCode}
            onChange={(e) => set("internalCode", e.target.value)}
            hint="Aparece na página do veículo, para o cliente citar ao entrar em contato."
          />
          <Select
            label="Estado de conservação"
            value={values.conservation}
            onChange={(e) => set("conservation", e.target.value)}
          >
            <option value="">Selecione</option>
            {CONSERVATION_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>

          <Select
            label="Condição"
            value={values.condition}
            onChange={(e) => set("condition", e.target.value as VehicleCondition)}
          >
            {Object.entries(CONDITION_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>

          <TextArea
            label="Descrição"
            value={values.description}
            onChange={(e) => set("description", e.target.value)}
            className="sm:col-span-2"
            placeholder="Conte o histórico do veículo, revisões feitas e diferenciais."
          />
        </div>
      )}

      {step === 1 && (
        <div className="surface grid gap-4 rounded-2xl p-5 sm:grid-cols-2 md:p-6">
          <Field
            label="Preço promocional"
            value={values.pricePromo ?? ""}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "");
              set("pricePromo", digits ? Number(digits) : null);
            }}
            error={errors.pricePromo}
            inputMode="numeric"
            hint={values.pricePromo ? formatVehiclePrice(values.pricePromo) : "Deixe vazio se não houver."}
          />
          <Field
            label="Valor anterior (riscado)"
            value={values.pricePrevious ?? ""}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "");
              set("pricePrevious", digits ? Number(digits) : null);
            }}
            inputMode="numeric"
            hint={values.pricePrevious ? formatVehiclePrice(values.pricePrevious) : "Mostra o desconto na vitrine."}
          />

          <Select
            label="Status do veículo"
            value={values.status}
            onChange={(e) => set("status", e.target.value as VehicleStatus)}
          >
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Field
            label="Localização"
            value={values.location}
            onChange={(e) => set("location", e.target.value)}
            placeholder="Loja centro — São Paulo/SP"
          />

          <TextArea
            label="Informações sobre documentação"
            value={values.documentation}
            onChange={(e) => set("documentation", e.target.value)}
            className="sm:col-span-2"
            placeholder="IPVA quitado, licenciamento em dia, laudo cautelar aprovado..."
          />

          <div className="flex flex-col gap-3 sm:col-span-2">
            <Toggle
              checked={values.acceptsTrade}
              onChange={(value) => set("acceptsTrade", value)}
              label="Aceita troca"
            />
            <Toggle
              checked={values.financing}
              onChange={(value) => set("financing", value)}
              label="Financiamento disponível"
              description="Mostra o simulador na página do veículo."
            />
            <Toggle
              checked={values.featured}
              onChange={(value) => set("featured", value)}
              label="Veículo em destaque"
              description="Aparece primeiro na home do catálogo."
            />
            <Toggle
              checked={values.published}
              onChange={(value) => canPublish && set("published", value)}
              label="Publicado no catálogo"
              description={
                canPublish
                  ? "Desmarque para deixar o anúncio invisível para o público."
                  : "Você não tem permissão para publicar ou arquivar anúncios."
              }
            />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="surface flex flex-col gap-6 rounded-2xl p-5 md:p-6">
          {FEATURE_GROUPS.map((group) => (
            <div key={group}>
              <h3 className="mb-3 text-[12px] font-semibold tracking-wide text-mute">{group.toUpperCase()}</h3>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {VEHICLE_FEATURES.filter((feature) => feature.group === group).map((feature) => (
                  <Checkbox
                    key={feature.slug}
                    label={feature.label}
                    checked={values.features.includes(feature.slug)}
                    onChange={() => toggleFeature(feature.slug)}
                  />
                ))}
              </div>
            </div>
          ))}

          <div>
            <h3 className="mb-3 text-[12px] font-semibold tracking-wide text-mute">OUTROS OPCIONAIS</h3>
            <div className="flex gap-2">
              <Field
                value={customFeature}
                onChange={(e) => setCustomFeature(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomFeature();
                  }
                }}
                placeholder="Rodas de liga leve 18''"
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={addCustomFeature}>
                <PlusIcon className="h-4 w-4" />
                Adicionar
              </Button>
            </div>

            {values.features.filter((slug) => !isKnownFeature(slug)).length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {values.features
                  .filter((slug) => !isKnownFeature(slug))
                  .map((slug) => (
                    <span
                      key={slug}
                      className="surface-raised inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] text-cream"
                    >
                      {slug}
                      <button
                        type="button"
                        onClick={() => toggleFeature(slug)}
                        aria-label={`Remover ${slug}`}
                        className="text-mute hover:text-red-300"
                      >
                        <CloseIcon className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {step === 3 && vehicleId && store && (
        <div className="surface rounded-2xl p-5 md:p-6">
          <VehicleImages
            storeId={store.id}
            vehicleId={vehicleId}
            images={images ?? []}
            onChange={onImagesChange ?? (() => {})}
            disabled={!permissions.vehicles_edit}
          />
        </div>
      )}

      <div className="sticky bottom-0 -mx-4 flex flex-col-reverse gap-2 border-t border-white/8 bg-ink/95 px-4 py-4 backdrop-blur sm:flex-row sm:justify-between md:-mx-8 md:px-8">
        <div className="flex gap-2">
          {step > 0 && (
            <Button type="button" variant="ghost" onClick={() => setStep((value) => value - 1)}>
              Voltar
            </Button>
          )}
          {step < steps.length - 1 && (
            <Button type="button" variant="outline" onClick={() => setStep((value) => value + 1)}>
              Próxima etapa
            </Button>
          )}
        </div>

        <Button type="submit" loading={saving}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
