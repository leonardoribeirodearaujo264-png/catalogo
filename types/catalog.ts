// Tipos centrais do catálogo. Qualquer nicho (produto físico, serviço,
// item com variações, etc.) é representado pela mesma forma de dados.

export type ItemKind = "produto" | "servico";

export interface ItemVariation {
  id: string;
  name: string;
  available: boolean;
  /** Preço adicional/alternativo da variação. Se ausente, usa o preço base do item. */
  price?: number;
}

export interface CatalogItem {
  id: string;
  slug: string;
  name: string;
  kind: ItemKind;
  categoryId: string;
  description: string;
  price: number;
  /** Preço "de", usado para mostrar desconto quando maior que `price`. */
  priceCompare?: number;
  image: string;
  /** Galeria opcional de imagens adicionais. */
  gallery?: string[];
  /** null/undefined = estoque não controlado (ex.: serviços). 0 = esgotado. */
  stock?: number | null;
  variations?: ItemVariation[];
  active: boolean;
  featured?: boolean;
  promotional?: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string;
  icon: string;
  order: number;
}

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  site?: string;
}

export interface BusinessAddress {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
}

export interface StoreSettings {
  brandName: string;
  niche: string;
  tagline: string;
  heroTitle: string;
  heroSubtitle: string;
  logoUrl?: string;
  bannerUrl?: string;
  whatsappNumber: string;
  whatsappDefaultMessage: string;
  primaryColor: string;
  accentColor: string;
  address: BusinessAddress;
  social: SocialLinks;
}

export interface InterestListEntry {
  itemId: string;
  name: string;
  price: number;
  variationName?: string;
  quantity: number;
}
