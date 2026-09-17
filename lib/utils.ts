export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function formatPrice(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** Preço sem centavos — o padrão do mercado automotivo (R$ 189.900). */
export function formatVehiclePrice(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function formatMileage(value: number): string {
  return `${value.toLocaleString("pt-BR")} km`;
}

export function formatYearPair(manufacture: number | null, model: number | null): string {
  if (manufacture && model && manufacture !== model) return `${manufacture}/${model}`;
  return String(model ?? manufacture ?? "—");
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("pt-BR");
}

export function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/** (11) 98888-7777 — formatação visual, o valor cru continua só dígitos. */
export function formatPhone(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function formatDocument(value: string, type: "cnpj" | "cpf"): string {
  const digits = onlyDigits(value);
  if (type === "cpf") {
    return digits
      .slice(0, 11)
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1-$2");
  }
  return digits
    .slice(0, 14)
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/** Validação estrutural (dígitos verificadores) de CPF. */
export function isValidCpf(value: string): boolean {
  const digits = onlyDigits(value);
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false;
  const calc = (slice: number) => {
    let sum = 0;
    for (let i = 0; i < slice; i++) sum += Number(digits[i]) * (slice + 1 - i);
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };
  return calc(9) === Number(digits[9]) && calc(10) === Number(digits[10]);
}

/** Validação estrutural (dígitos verificadores) de CNPJ. */
export function isValidCnpj(value: string): boolean {
  const digits = onlyDigits(value);
  if (digits.length !== 14 || /^(\d)\1{13}$/.test(digits)) return false;
  const calc = (slice: number) => {
    const weights = slice === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < slice; i++) sum += Number(digits[i]) * weights[i];
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };
  return calc(12) === Number(digits[12]) && calc(13) === Number(digits[13]);
}

/** Slugs reservados: não podem virar nome de loja porque são rotas do app. */
export const RESERVED_SLUGS = new Set([
  "admin",
  "superadmin",
  "login",
  "register",
  "onboarding",
  "loja",
  "api",
  "sitemap",
  "planos",
  "sobre",
  "contato",
]);

export function slugError(slug: string): string | null {
  if (!slug) return "Informe o link da loja.";
  if (slug.length < 3) return "O link precisa ter pelo menos 3 caracteres.";
  if (slug.length > 48) return "O link pode ter no máximo 48 caracteres.";
  if (!/^[a-z0-9-]+$/.test(slug)) return "Use apenas letras minúsculas, números e hífen.";
  if (RESERVED_SLUGS.has(slug)) return "Esse link é reservado pela plataforma. Escolha outro.";
  return null;
}
