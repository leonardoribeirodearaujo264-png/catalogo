// Formato das linhas como ficam no Postgres (snake_case), espelhando
// supabase/setup.sql. Os componentes da aplicação usam os tipos de
// /types/catalog.ts (camelCase) — a conversão fica em ./mappers.ts.

import type { BusinessAddress, CatalogLayout, InterestListEntry, OrderStatus, SocialLinks } from "@/types/catalog";
import type { PaymentMethod, TransactionStatus, TransactionType } from "@/types/financial";

export interface CatalogRow {
  id: string;
  user_id: string;
  slug: string;
  business_name: string;
  niche: string;
  tagline: string;
  hero_title: string;
  hero_subtitle: string;
  logo_url: string | null;
  banner_url: string | null;
  whatsapp_number: string;
  whatsapp_default_message: string;
  primary_color: string;
  accent_color: string;
  address: BusinessAddress;
  social: SocialLinks;
  is_published: boolean;
  layout: CatalogLayout;
  created_at: string;
}

export interface CategoryRow {
  id: string;
  catalog_id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string;
  order: number;
  active: boolean;
  created_at: string;
}

export interface ItemVariationJson {
  id: string;
  name: string;
  available: boolean;
  price?: number;
}

export interface ProductRow {
  id: string;
  catalog_id: string;
  category_id: string | null;
  slug: string;
  name: string;
  kind: "produto" | "servico";
  description: string | null;
  price: number;
  price_compare: number | null;
  image: string | null;
  gallery: string[] | null;
  stock: number | null;
  variations: ItemVariationJson[] | null;
  active: boolean;
  featured: boolean;
  promotional: boolean;
  created_at: string;
}

export interface OrderRow {
  id: string;
  catalog_id: string;
  customer_name: string | null;
  customer_phone: string | null;
  items: InterestListEntry[];
  total_amount: number;
  status: OrderStatus;
  origin: string;
  message: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface FinancialTransactionRow {
  id: string;
  user_id: string;
  catalog_id: string;
  order_id: string | null;
  type: TransactionType;
  description: string;
  customer_name: string | null;
  product_id: string | null;
  amount: number;
  due_date: string | null;
  paid_date: string | null;
  status: TransactionStatus;
  payment_method: PaymentMethod | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
