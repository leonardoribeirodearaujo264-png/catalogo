// Tipos centrais do catálogo. A plataforma é multiusuário: cada Catalog
// pertence a um usuário (dono do negócio) e tem seu próprio conjunto de
// categorias, produtos/serviços e leads.

export type ItemKind = "produto" | "servico";
export type CatalogLayout = "lista" | "grade";

export interface ItemVariation {
  id: string;
  name: string;
  available: boolean;
  /** Preço adicional/alternativo da variação. Se ausente, usa o preço base do item. */
  price?: number;
}

export interface CatalogItem {
  id: string;
  catalogId: string;
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
  catalogId: string;
  slug: string;
  name: string;
  description?: string;
  icon: string;
  order: number;
  active: boolean;
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

/** O catálogo/loja de um usuário — equivalente ao antigo "StoreSettings", agora por usuário. */
export interface Catalog {
  id: string;
  userId: string;
  slug: string;
  businessName: string;
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
  isPublished: boolean;
  layout: CatalogLayout;
}

export interface InterestListEntry {
  catalogId: string;
  itemId: string;
  name: string;
  price: number;
  variationName?: string;
  quantity: number;
}

export interface Lead {
  id: string;
  catalogId: string;
  customerName?: string;
  customerPhone?: string;
  items: InterestListEntry[];
  message?: string;
  createdAt: string;
}
