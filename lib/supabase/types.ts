// Formato das linhas como ficam no Postgres (snake_case), espelhando
// supabase/schema.sql. Os componentes da aplicação usam os tipos de
// /types/catalog.ts (camelCase) — a conversão fica em ./mappers.ts.

import type { BusinessAddress, SocialLinks } from "@/types/catalog";

export interface CategoryRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string;
  order: number;
  created_at: string;
}

export interface ItemVariationJson {
  id: string;
  name: string;
  available: boolean;
  price?: number;
}

export interface ItemRow {
  id: string;
  slug: string;
  name: string;
  kind: "produto" | "servico";
  category_id: string | null;
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

export interface StoreSettingsRow {
  id: string;
  brand_name: string;
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
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: CategoryRow;
        Insert: Partial<CategoryRow> & Pick<CategoryRow, "slug" | "name">;
        Update: Partial<CategoryRow>;
      };
      items: {
        Row: ItemRow;
        Insert: Partial<ItemRow> & Pick<ItemRow, "slug" | "name">;
        Update: Partial<ItemRow>;
      };
      store_settings: {
        Row: StoreSettingsRow;
        Insert: Partial<StoreSettingsRow> & Pick<StoreSettingsRow, "id">;
        Update: Partial<StoreSettingsRow>;
      };
    };
  };
}
