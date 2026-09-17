import { MILEAGE_RANGES, PRICE_RANGES, parseRange } from "@/lib/vehicle-options";
import { currentPrice, EMPTY_FILTERS, type Vehicle, type VehicleFilters } from "@/types/vehicle";

/** Lê os filtros da URL. Chaves ausentes viram string vazia (= sem filtro). */
export function filtersFromParams(params: URLSearchParams | ReadonlyURLSearchParamsLike): VehicleFilters {
  const get = (key: string) => params.get(key) ?? "";
  return {
    q: get("q"),
    brand: get("marca"),
    model: get("modelo"),
    version: get("versao"),
    year: get("ano"),
    priceRange: get("preco"),
    bodyType: get("tipo"),
    transmission: get("cambio"),
    fuel: get("combustivel"),
    mileage: get("km"),
    condition: get("condicao"),
    sort: get("ordem") || EMPTY_FILTERS.sort,
  };
}

interface ReadonlyURLSearchParamsLike {
  get(key: string): string | null;
}

/** Converte os filtros de volta para query string, omitindo o que está vazio. */
export function paramsFromFilters(filters: VehicleFilters): URLSearchParams {
  const map: Record<string, string> = {
    q: filters.q,
    marca: filters.brand,
    modelo: filters.model,
    versao: filters.version,
    ano: filters.year,
    preco: filters.priceRange,
    tipo: filters.bodyType,
    cambio: filters.transmission,
    combustivel: filters.fuel,
    km: filters.mileage,
    condicao: filters.condition,
    ordem: filters.sort === EMPTY_FILTERS.sort ? "" : filters.sort,
  };

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(map)) {
    if (value) params.set(key, value);
  }
  return params;
}

export function activeFilterCount(filters: VehicleFilters): number {
  return Object.entries(filters).filter(([key, value]) => key !== "sort" && value !== "").length;
}

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export function filterVehicles(vehicles: Vehicle[], filters: VehicleFilters): Vehicle[] {
  const query = normalize(filters.q.trim());
  const price = parseRange(PRICE_RANGES, filters.priceRange);
  const mileage = parseRange(MILEAGE_RANGES, filters.mileage);
  const year = filters.year ? Number(filters.year) : null;

  const result = vehicles.filter((vehicle) => {
    if (filters.brand && vehicle.brand !== filters.brand) return false;
    if (filters.model && vehicle.model !== filters.model) return false;
    if (filters.version && vehicle.version !== filters.version) return false;
    if (filters.bodyType && vehicle.bodyType !== filters.bodyType) return false;
    if (filters.transmission && vehicle.transmission !== filters.transmission) return false;
    if (filters.fuel && vehicle.fuel !== filters.fuel) return false;
    if (filters.condition && vehicle.condition !== filters.condition) return false;
    if (year && vehicle.yearModel !== year && vehicle.yearManufacture !== year) return false;

    if (price) {
      const value = currentPrice(vehicle);
      if (value < price.min || value > price.max) return false;
    }

    if (mileage && (vehicle.mileage < mileage.min || vehicle.mileage > mileage.max)) return false;

    if (query) {
      const haystack = normalize(
        [vehicle.brand, vehicle.model, vehicle.version, vehicle.color, vehicle.description].join(" "),
      );
      if (!haystack.includes(query)) return false;
    }

    return true;
  });

  return sortVehicles(result, filters.sort);
}

export function sortVehicles(vehicles: Vehicle[], sort: string): Vehicle[] {
  const sorted = [...vehicles];
  switch (sort) {
    case "preco-asc":
      return sorted.sort((a, b) => currentPrice(a) - currentPrice(b));
    case "preco-desc":
      return sorted.sort((a, b) => currentPrice(b) - currentPrice(a));
    case "km-asc":
      return sorted.sort((a, b) => a.mileage - b.mileage);
    case "ano-desc":
      return sorted.sort((a, b) => (b.yearModel ?? 0) - (a.yearModel ?? 0));
    default:
      // "recentes": destaques primeiro, depois data de cadastro.
      return sorted.sort((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }
}
