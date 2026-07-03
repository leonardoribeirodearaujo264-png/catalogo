import type { CatalogItem, Category, StoreSettings } from "@/types/catalog";
import type { CategoryRow, ItemRow, StoreSettingsRow } from "./types";

export function rowToCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? undefined,
    icon: row.icon,
    order: row.order,
  };
}

export function categoryToRow(cat: Partial<Category>): Partial<CategoryRow> {
  const row: Partial<CategoryRow> = {};
  if (cat.slug !== undefined) row.slug = cat.slug;
  if (cat.name !== undefined) row.name = cat.name;
  if (cat.description !== undefined) row.description = cat.description;
  if (cat.icon !== undefined) row.icon = cat.icon;
  if (cat.order !== undefined) row.order = cat.order;
  return row;
}

export function rowToItem(row: ItemRow): CatalogItem {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    kind: row.kind,
    categoryId: row.category_id ?? "",
    description: row.description ?? "",
    price: Number(row.price),
    priceCompare: row.price_compare !== null ? Number(row.price_compare) : undefined,
    image: row.image ?? "",
    gallery: row.gallery ?? undefined,
    stock: row.stock,
    variations: row.variations ?? undefined,
    active: row.active,
    featured: row.featured,
    promotional: row.promotional,
    createdAt: row.created_at,
  };
}

export function itemToRow(item: Partial<CatalogItem>): Partial<ItemRow> {
  const row: Partial<ItemRow> = {};
  if (item.slug !== undefined) row.slug = item.slug;
  if (item.name !== undefined) row.name = item.name;
  if (item.kind !== undefined) row.kind = item.kind;
  if (item.categoryId !== undefined) row.category_id = item.categoryId || null;
  if (item.description !== undefined) row.description = item.description;
  if (item.price !== undefined) row.price = item.price;
  if (item.priceCompare !== undefined) row.price_compare = item.priceCompare ?? null;
  if (item.image !== undefined) row.image = item.image;
  if (item.gallery !== undefined) row.gallery = item.gallery;
  if (item.stock !== undefined) row.stock = item.stock;
  if (item.variations !== undefined) row.variations = item.variations;
  if (item.active !== undefined) row.active = item.active;
  if (item.featured !== undefined) row.featured = item.featured;
  if (item.promotional !== undefined) row.promotional = item.promotional;
  return row;
}

export function rowToSettings(row: StoreSettingsRow): StoreSettings {
  return {
    brandName: row.brand_name,
    niche: row.niche,
    tagline: row.tagline,
    heroTitle: row.hero_title,
    heroSubtitle: row.hero_subtitle,
    logoUrl: row.logo_url ?? undefined,
    bannerUrl: row.banner_url ?? undefined,
    whatsappNumber: row.whatsapp_number,
    whatsappDefaultMessage: row.whatsapp_default_message,
    primaryColor: row.primary_color,
    accentColor: row.accent_color,
    address: row.address ?? {},
    social: row.social ?? {},
  };
}

export function settingsToRow(settings: Partial<StoreSettings>): Partial<StoreSettingsRow> {
  const row: Partial<StoreSettingsRow> = {};
  if (settings.brandName !== undefined) row.brand_name = settings.brandName;
  if (settings.niche !== undefined) row.niche = settings.niche;
  if (settings.tagline !== undefined) row.tagline = settings.tagline;
  if (settings.heroTitle !== undefined) row.hero_title = settings.heroTitle;
  if (settings.heroSubtitle !== undefined) row.hero_subtitle = settings.heroSubtitle;
  if (settings.logoUrl !== undefined) row.logo_url = settings.logoUrl;
  if (settings.bannerUrl !== undefined) row.banner_url = settings.bannerUrl;
  if (settings.whatsappNumber !== undefined) row.whatsapp_number = settings.whatsappNumber;
  if (settings.whatsappDefaultMessage !== undefined) row.whatsapp_default_message = settings.whatsappDefaultMessage;
  if (settings.primaryColor !== undefined) row.primary_color = settings.primaryColor;
  if (settings.accentColor !== undefined) row.accent_color = settings.accentColor;
  if (settings.address !== undefined) row.address = settings.address;
  if (settings.social !== undefined) row.social = settings.social;
  return row;
}
