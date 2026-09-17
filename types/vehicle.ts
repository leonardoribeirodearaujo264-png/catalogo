// Tipos do veículo. Os valores dos enums são exatamente os aceitos pelos
// CHECK constraints de cs_vehicles — mudar aqui exige mudar a migração.

export type VehicleStatus = "disponivel" | "reservado" | "vendido" | "arquivado";
export type VehicleCondition = "novo" | "seminovo" | "usado";
export type Transmission = "manual" | "automatico" | "automatizado" | "cvt";
export type Fuel = "flex" | "gasolina" | "etanol" | "diesel" | "gnv" | "hibrido" | "eletrico";
export type BodyType =
  | "hatch"
  | "sedan"
  | "suv"
  | "picape"
  | "crossover"
  | "minivan"
  | "coupe"
  | "conversivel"
  | "van"
  | "utilitario"
  | "outro";

export interface VehicleImage {
  id: string;
  storeId: string;
  vehicleId: string;
  url: string;
  /** Caminho no bucket, guardado para conseguir apagar o arquivo depois. */
  path?: string;
  position: number;
  isCover: boolean;
}

export interface Vehicle {
  id: string;
  storeId: string;
  slug: string;
  brand: string;
  model: string;
  version: string;
  yearManufacture: number | null;
  yearModel: number | null;
  price: number;
  /** Preço promocional em vigor. Quando presente, é o valor cobrado. */
  pricePromo: number | null;
  /** Valor "de", riscado ao lado do preço. */
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
  /** Slugs de VEHICLE_FEATURES + itens livres digitados pela loja. */
  features: string[];
  coverUrl?: string;
  views: number;
  createdAt: string;
  updatedAt: string;
  images?: VehicleImage[];
}

/** Preço que o cliente realmente paga. */
export function currentPrice(vehicle: Pick<Vehicle, "price" | "pricePromo">): number {
  return vehicle.pricePromo && vehicle.pricePromo > 0 ? vehicle.pricePromo : vehicle.price;
}

/** Valor riscado, se houver um desconto real a mostrar. */
export function comparePrice(
  vehicle: Pick<Vehicle, "price" | "pricePromo" | "pricePrevious">,
): number | null {
  const current = currentPrice(vehicle);
  const candidates = [vehicle.pricePrevious, vehicle.pricePromo ? vehicle.price : null].filter(
    (value): value is number => typeof value === "number" && value > current,
  );
  return candidates.length > 0 ? Math.max(...candidates) : null;
}

export function vehicleTitle(vehicle: Pick<Vehicle, "brand" | "model">): string {
  return `${vehicle.brand} ${vehicle.model}`.trim();
}

export function vehicleFullTitle(
  vehicle: Pick<Vehicle, "brand" | "model" | "version" | "yearModel">,
): string {
  return [vehicle.brand, vehicle.model, vehicle.version, vehicle.yearModel]
    .filter(Boolean)
    .join(" ")
    .trim();
}

// ── Filtros da vitrine ───────────────────────────────────────

export interface VehicleFilters {
  q: string;
  brand: string;
  model: string;
  version: string;
  year: string;
  priceRange: string;
  bodyType: string;
  transmission: string;
  fuel: string;
  mileage: string;
  condition: string;
  sort: string;
}

export const EMPTY_FILTERS: VehicleFilters = {
  q: "",
  brand: "",
  model: "",
  version: "",
  year: "",
  priceRange: "",
  bodyType: "",
  transmission: "",
  fuel: "",
  mileage: "",
  condition: "",
  sort: "recentes",
};
