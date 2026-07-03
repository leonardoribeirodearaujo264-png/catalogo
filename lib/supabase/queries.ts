import type { SupabaseClient } from "@supabase/supabase-js";
import { getBrowserClient } from "./browser-client";
import {
  catalogToRow,
  categoryToRow,
  itemToRow,
  rowToCatalog,
  rowToCategory,
  rowToItem,
  rowToTransaction,
  transactionToRow,
} from "./mappers";
import type { CategoryRow, LeadRow, CatalogRow, FinancialTransactionRow, ProductRow } from "./types";
import type { CatalogItem, Category, Catalog, InterestListEntry } from "@/types/catalog";
import type { FinancialTransaction } from "@/types/financial";

function requireBrowserClient(): SupabaseClient {
  const client = getBrowserClient();
  if (!client) throw new Error("Supabase não está configurado.");
  return client;
}

// ── Público (por slug, sem sessão) ───────────────────────────────

export async function fetchPublishedCatalogBySlug(
  client: SupabaseClient,
  slug: string,
): Promise<Catalog | null> {
  const { data, error } = await client
    .from("cd_catalogs")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToCatalog(data as CatalogRow) : null;
}

export async function fetchPublicCategories(client: SupabaseClient, catalogId: string): Promise<Category[]> {
  const { data, error } = await client
    .from("cd_categories")
    .select("*")
    .eq("catalog_id", catalogId)
    .eq("active", true)
    .order("order", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as CategoryRow[]).map(rowToCategory);
}

export async function fetchPublicProducts(client: SupabaseClient, catalogId: string): Promise<CatalogItem[]> {
  const { data, error } = await client
    .from("cd_products")
    .select("*")
    .eq("catalog_id", catalogId)
    .eq("active", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as ProductRow[]).map(rowToItem);
}

export async function insertLead(
  client: SupabaseClient,
  lead: { catalogId: string; items: InterestListEntry[]; message?: string },
): Promise<void> {
  const { error } = await client.from("cd_leads").insert({
    catalog_id: lead.catalogId,
    items: lead.items,
    message: lead.message ?? null,
  });
  if (error) throw error;
}

// ── Admin (autenticado, dono do catálogo) ────────────────────────

export async function fetchMyCatalog(userId: string): Promise<Catalog | null> {
  const { data, error } = await requireBrowserClient()
    .from("cd_catalogs")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToCatalog(data as CatalogRow) : null;
}

export async function isSlugTaken(slug: string): Promise<boolean> {
  const { data, error } = await requireBrowserClient()
    .from("cd_catalogs")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

export async function createCatalog(userId: string, patch: Partial<Catalog> & { slug: string; businessName: string }): Promise<Catalog> {
  const row = { user_id: userId, ...catalogToRow(patch) };
  const { data, error } = await requireBrowserClient().from("cd_catalogs").insert(row).select("*").single();
  if (error) throw error;
  return rowToCatalog(data as CatalogRow);
}

export async function updateMyCatalog(id: string, patch: Partial<Catalog>): Promise<void> {
  const { error } = await requireBrowserClient().from("cd_catalogs").update(catalogToRow(patch)).eq("id", id);
  if (error) throw error;
}

export async function fetchOwnerCategories(catalogId: string): Promise<Category[]> {
  const { data, error } = await requireBrowserClient()
    .from("cd_categories")
    .select("*")
    .eq("catalog_id", catalogId)
    .order("order", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as CategoryRow[]).map(rowToCategory);
}

export async function fetchOwnerProducts(catalogId: string): Promise<CatalogItem[]> {
  const { data, error } = await requireBrowserClient()
    .from("cd_products")
    .select("*")
    .eq("catalog_id", catalogId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as ProductRow[]).map(rowToItem);
}

export async function insertCategory(category: Omit<Category, "id">): Promise<Category> {
  const row = categoryToRow(category);
  const { data, error } = await requireBrowserClient().from("cd_categories").insert(row).select("*").single();
  if (error) throw error;
  return rowToCategory(data as CategoryRow);
}

export async function updateCategoryRow(id: string, patch: Partial<Category>): Promise<void> {
  const { error } = await requireBrowserClient().from("cd_categories").update(categoryToRow(patch)).eq("id", id);
  if (error) throw error;
}

export async function deleteCategoryRow(id: string): Promise<void> {
  const { error } = await requireBrowserClient().from("cd_categories").delete().eq("id", id);
  if (error) throw error;
}

export async function insertItem(item: Omit<CatalogItem, "id" | "createdAt">): Promise<CatalogItem> {
  const row = itemToRow(item);
  const { data, error } = await requireBrowserClient().from("cd_products").insert(row).select("*").single();
  if (error) throw error;
  return rowToItem(data as ProductRow);
}

export async function updateItemRow(id: string, patch: Partial<CatalogItem>): Promise<void> {
  const { error } = await requireBrowserClient().from("cd_products").update(itemToRow(patch)).eq("id", id);
  if (error) throw error;
}

export async function deleteItemRow(id: string): Promise<void> {
  const { error } = await requireBrowserClient().from("cd_products").delete().eq("id", id);
  if (error) throw error;
}

export interface LeadSummary {
  id: string;
  items: InterestListEntry[];
  message?: string;
  createdAt: string;
}

export async function fetchOwnerLeads(catalogId: string): Promise<LeadSummary[]> {
  const { data, error } = await requireBrowserClient()
    .from("cd_leads")
    .select("*")
    .eq("catalog_id", catalogId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as LeadRow[]).map((row) => ({
    id: row.id,
    items: row.items ?? [],
    message: row.message ?? undefined,
    createdAt: row.created_at,
  }));
}

// ── Financeiro (100% privado, dono do catálogo) ──────────────────

export async function fetchTransactions(catalogId: string): Promise<FinancialTransaction[]> {
  const { data, error } = await requireBrowserClient()
    .from("cd_financial_transactions")
    .select("*")
    .eq("catalog_id", catalogId)
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as FinancialTransactionRow[]).map(rowToTransaction);
}

export async function insertTransaction(
  tx: Omit<FinancialTransaction, "id" | "createdAt" | "updatedAt">,
): Promise<FinancialTransaction> {
  const row = transactionToRow(tx);
  const { data, error } = await requireBrowserClient().from("cd_financial_transactions").insert(row).select("*").single();
  if (error) throw error;
  return rowToTransaction(data as FinancialTransactionRow);
}

export async function updateTransactionRow(id: string, patch: Partial<FinancialTransaction>): Promise<void> {
  const row = { ...transactionToRow(patch), updated_at: new Date().toISOString() };
  const { error } = await requireBrowserClient().from("cd_financial_transactions").update(row).eq("id", id);
  if (error) throw error;
}

export async function deleteTransactionRow(id: string): Promise<void> {
  const { error } = await requireBrowserClient().from("cd_financial_transactions").delete().eq("id", id);
  if (error) throw error;
}
