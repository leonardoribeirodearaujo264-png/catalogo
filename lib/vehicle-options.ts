// Vocabulário do nicho automotivo: rótulos dos enums, lista de opcionais e
// faixas usadas nos filtros. Nada aqui é específico de uma loja — são
// opções da plataforma, e cada loja preenche os valores nos seus veículos.

import type { BodyType, Fuel, Transmission, VehicleCondition, VehicleStatus } from "@/types/vehicle";

export const TRANSMISSION_LABELS: Record<Transmission, string> = {
  manual: "Manual",
  automatico: "Automático",
  automatizado: "Automatizado",
  cvt: "CVT",
};

export const FUEL_LABELS: Record<Fuel, string> = {
  flex: "Flex",
  gasolina: "Gasolina",
  etanol: "Etanol",
  diesel: "Diesel",
  gnv: "GNV",
  hibrido: "Híbrido",
  eletrico: "Elétrico",
};

export const BODY_TYPE_LABELS: Record<BodyType, string> = {
  hatch: "Hatch",
  sedan: "Sedã",
  suv: "SUV",
  picape: "Picape",
  crossover: "Crossover",
  minivan: "Minivan",
  coupe: "Cupê",
  conversivel: "Conversível",
  van: "Van",
  utilitario: "Utilitário",
  outro: "Outro",
};

export const CONDITION_LABELS: Record<VehicleCondition, string> = {
  novo: "Novo",
  seminovo: "Seminovo",
  usado: "Usado",
};

export const STATUS_LABELS: Record<VehicleStatus, string> = {
  disponivel: "Disponível",
  reservado: "Reservado",
  vendido: "Vendido",
  arquivado: "Arquivado",
};

export const CONSERVATION_OPTIONS = ["Excelente", "Muito bom", "Bom", "Regular"];

export const DOOR_OPTIONS = [2, 3, 4, 5];

/** Opcionais mais comuns. A loja ainda pode digitar itens personalizados. */
export const VEHICLE_FEATURES: { slug: string; label: string; group: string }[] = [
  { slug: "ar-condicionado", label: "Ar-condicionado", group: "Conforto" },
  { slug: "direcao-eletrica", label: "Direção elétrica", group: "Conforto" },
  { slug: "direcao-hidraulica", label: "Direção hidráulica", group: "Conforto" },
  { slug: "vidros-eletricos", label: "Vidros elétricos", group: "Conforto" },
  { slug: "travas-eletricas", label: "Travas elétricas", group: "Conforto" },
  { slug: "bancos-couro", label: "Bancos em couro", group: "Conforto" },
  { slug: "teto-solar", label: "Teto solar", group: "Conforto" },
  { slug: "chave-presencial", label: "Chave presencial", group: "Conforto" },
  { slug: "piloto-automatico", label: "Piloto automático", group: "Conforto" },
  { slug: "airbags", label: "Airbags", group: "Segurança" },
  { slug: "freios-abs", label: "Freios ABS", group: "Segurança" },
  { slug: "controle-estabilidade", label: "Controle de estabilidade", group: "Segurança" },
  { slug: "sensor-estacionamento", label: "Sensor de estacionamento", group: "Segurança" },
  { slug: "camera-re", label: "Câmera de ré", group: "Segurança" },
  { slug: "central-multimidia", label: "Central multimídia", group: "Tecnologia" },
];

const FEATURE_LABEL_BY_SLUG = new Map(VEHICLE_FEATURES.map((f) => [f.slug, f.label]));

/** Opcionais personalizados são gravados como o próprio texto. */
export function featureLabel(slug: string): string {
  return FEATURE_LABEL_BY_SLUG.get(slug) ?? slug;
}

export function isKnownFeature(slug: string): boolean {
  return FEATURE_LABEL_BY_SLUG.has(slug);
}

export const FEATURE_GROUPS = Array.from(new Set(VEHICLE_FEATURES.map((f) => f.group)));

// ── Faixas usadas nos filtros da vitrine ─────────────────────

export const PRICE_RANGES: { value: string; label: string; min: number; max: number }[] = [
  { value: "0-50000", label: "Até R$ 50.000", min: 0, max: 50_000 },
  { value: "50000-80000", label: "R$ 50.000 a R$ 80.000", min: 50_000, max: 80_000 },
  { value: "80000-120000", label: "R$ 80.000 a R$ 120.000", min: 80_000, max: 120_000 },
  { value: "120000-180000", label: "R$ 120.000 a R$ 180.000", min: 120_000, max: 180_000 },
  { value: "180000-250000", label: "R$ 180.000 a R$ 250.000", min: 180_000, max: 250_000 },
  { value: "250000-9999999", label: "Acima de R$ 250.000", min: 250_000, max: Number.MAX_SAFE_INTEGER },
];

export const MILEAGE_RANGES: { value: string; label: string; min: number; max: number }[] = [
  { value: "0-10000", label: "Até 10.000 km", min: 0, max: 10_000 },
  { value: "10000-30000", label: "10.000 a 30.000 km", min: 10_000, max: 30_000 },
  { value: "30000-60000", label: "30.000 a 60.000 km", min: 30_000, max: 60_000 },
  { value: "60000-100000", label: "60.000 a 100.000 km", min: 60_000, max: 100_000 },
  { value: "100000-9999999", label: "Acima de 100.000 km", min: 100_000, max: Number.MAX_SAFE_INTEGER },
];

export function parseRange(
  ranges: { value: string; min: number; max: number }[],
  value: string,
): { min: number; max: number } | null {
  return ranges.find((r) => r.value === value) ?? null;
}

export const SORT_OPTIONS = [
  { value: "recentes", label: "Mais recentes" },
  { value: "preco-asc", label: "Menor preço" },
  { value: "preco-desc", label: "Maior preço" },
  { value: "km-asc", label: "Menor quilometragem" },
  { value: "ano-desc", label: "Ano mais novo" },
];

/** Anos oferecidos no cadastro e no filtro (do mais novo para o mais antigo). */
export function yearOptions(): number[] {
  const max = new Date().getFullYear() + 1;
  return Array.from({ length: 40 }, (_, i) => max - i);
}

/** Selos de confiança padrão de uma loja nova — ela pode editar ou remover. */
export const DEFAULT_TRUST_BADGES = [
  {
    id: "revisados",
    icon: "shield",
    title: "Veículos revisados",
    description: "Mais segurança para você e sua família.",
  },
  {
    id: "compra-segura",
    icon: "lock",
    title: "Compra segura",
    description: "Processo transparente e confiável.",
  },
  {
    id: "procedencia",
    icon: "certificate",
    title: "Procedência",
    description: "Histórico e documentação conferidos.",
  },
  {
    id: "atendimento",
    icon: "users",
    title: "Atendimento personalizado",
    description: "Nossa equipe pronta para te atender.",
  },
];
