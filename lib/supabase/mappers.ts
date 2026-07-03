import type { CatalogItem, Category, Catalog } from "@/types/catalog";
import type { FinancialTransaction } from "@/types/financial";
import type { CatalogRow, CategoryRow, FinancialTransactionRow, ProductRow } from "./types";

export function rowToCatalog(row: CatalogRow): Catalog {
  return {
    id: row.id,
    userId: row.user_id,
    slug: row.slug,
    businessName: row.business_name,
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
    isPublished: row.is_published,
    layout: row.layout ?? "grade",
  };
}

export function catalogToRow(catalog: Partial<Catalog>): Partial<CatalogRow> {
  const row: Partial<CatalogRow> = {};
  if (catalog.slug !== undefined) row.slug = catalog.slug;
  if (catalog.businessName !== undefined) row.business_name = catalog.businessName;
  if (catalog.niche !== undefined) row.niche = catalog.niche;
  if (catalog.tagline !== undefined) row.tagline = catalog.tagline;
  if (catalog.heroTitle !== undefined) row.hero_title = catalog.heroTitle;
  if (catalog.heroSubtitle !== undefined) row.hero_subtitle = catalog.heroSubtitle;
  if (catalog.logoUrl !== undefined) row.logo_url = catalog.logoUrl;
  if (catalog.bannerUrl !== undefined) row.banner_url = catalog.bannerUrl;
  if (catalog.whatsappNumber !== undefined) row.whatsapp_number = catalog.whatsappNumber;
  if (catalog.whatsappDefaultMessage !== undefined) row.whatsapp_default_message = catalog.whatsappDefaultMessage;
  if (catalog.primaryColor !== undefined) row.primary_color = catalog.primaryColor;
  if (catalog.accentColor !== undefined) row.accent_color = catalog.accentColor;
  if (catalog.address !== undefined) row.address = catalog.address;
  if (catalog.social !== undefined) row.social = catalog.social;
  if (catalog.isPublished !== undefined) row.is_published = catalog.isPublished;
  if (catalog.layout !== undefined) row.layout = catalog.layout;
  return row;
}

export function rowToCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    catalogId: row.catalog_id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? undefined,
    icon: row.icon,
    order: row.order,
    active: row.active,
  };
}

export function categoryToRow(cat: Partial<Category>): Partial<CategoryRow> {
  const row: Partial<CategoryRow> = {};
  if (cat.catalogId !== undefined) row.catalog_id = cat.catalogId;
  if (cat.slug !== undefined) row.slug = cat.slug;
  if (cat.name !== undefined) row.name = cat.name;
  if (cat.description !== undefined) row.description = cat.description;
  if (cat.icon !== undefined) row.icon = cat.icon;
  if (cat.order !== undefined) row.order = cat.order;
  if (cat.active !== undefined) row.active = cat.active;
  return row;
}

export function rowToItem(row: ProductRow): CatalogItem {
  return {
    id: row.id,
    catalogId: row.catalog_id,
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

export function itemToRow(item: Partial<CatalogItem>): Partial<ProductRow> {
  const row: Partial<ProductRow> = {};
  if (item.catalogId !== undefined) row.catalog_id = item.catalogId;
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

export function rowToTransaction(row: FinancialTransactionRow): FinancialTransaction {
  return {
    id: row.id,
    userId: row.user_id,
    catalogId: row.catalog_id,
    type: row.type,
    description: row.description,
    customerName: row.customer_name ?? undefined,
    productId: row.product_id ?? undefined,
    amount: Number(row.amount),
    dueDate: row.due_date ?? undefined,
    paidDate: row.paid_date ?? undefined,
    status: row.status,
    paymentMethod: row.payment_method ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function transactionToRow(tx: Partial<FinancialTransaction>): Partial<FinancialTransactionRow> {
  const row: Partial<FinancialTransactionRow> = {};
  if (tx.userId !== undefined) row.user_id = tx.userId;
  if (tx.catalogId !== undefined) row.catalog_id = tx.catalogId;
  if (tx.type !== undefined) row.type = tx.type;
  if (tx.description !== undefined) row.description = tx.description;
  if (tx.customerName !== undefined) row.customer_name = tx.customerName || null;
  if (tx.productId !== undefined) row.product_id = tx.productId || null;
  if (tx.amount !== undefined) row.amount = tx.amount;
  if (tx.dueDate !== undefined) row.due_date = tx.dueDate || null;
  if (tx.paidDate !== undefined) row.paid_date = tx.paidDate || null;
  if (tx.status !== undefined) row.status = tx.status;
  if (tx.paymentMethod !== undefined) row.payment_method = tx.paymentMethod || null;
  if (tx.notes !== undefined) row.notes = tx.notes || null;
  return row;
}
