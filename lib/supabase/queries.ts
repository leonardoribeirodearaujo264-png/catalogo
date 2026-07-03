import { supabase } from "./client";
import { categoryToRow, itemToRow, rowToCategory, rowToItem, rowToSettings, settingsToRow } from "./mappers";
import type { CategoryRow, ItemRow, StoreSettingsRow } from "./types";
import type { CatalogItem, Category, StoreSettings } from "@/types/catalog";

function db() {
  if (!supabase) throw new Error("Supabase não está configurado.");
  return supabase;
}

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await db().from("categories").select("*").order("order", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as CategoryRow[]).map(rowToCategory);
}

export async function fetchItems(): Promise<CatalogItem[]> {
  const { data, error } = await db().from("items").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as ItemRow[]).map(rowToItem);
}

export async function fetchSettings(): Promise<StoreSettings | null> {
  const { data, error } = await db().from("store_settings").select("*").eq("id", "default").maybeSingle();
  if (error) throw error;
  return data ? rowToSettings(data as StoreSettingsRow) : null;
}

export async function insertCategory(category: Omit<Category, "id">): Promise<Category> {
  const row = categoryToRow(category);
  const { data, error } = await db().from("categories").insert(row).select("*").single();
  if (error) throw error;
  return rowToCategory(data as CategoryRow);
}

export async function updateCategoryRow(id: string, patch: Partial<Category>): Promise<void> {
  const { error } = await db().from("categories").update(categoryToRow(patch)).eq("id", id);
  if (error) throw error;
}

export async function deleteCategoryRow(id: string): Promise<void> {
  const { error } = await db().from("categories").delete().eq("id", id);
  if (error) throw error;
}

export async function insertItem(item: Omit<CatalogItem, "id" | "createdAt">): Promise<CatalogItem> {
  const row = itemToRow(item);
  const { data, error } = await db().from("items").insert(row).select("*").single();
  if (error) throw error;
  return rowToItem(data as ItemRow);
}

export async function updateItemRow(id: string, patch: Partial<CatalogItem>): Promise<void> {
  const { error } = await db().from("items").update(itemToRow(patch)).eq("id", id);
  if (error) throw error;
}

export async function deleteItemRow(id: string): Promise<void> {
  const { error } = await db().from("items").delete().eq("id", id);
  if (error) throw error;
}

export async function upsertSettings(settings: StoreSettings): Promise<void> {
  const { error } = await db()
    .from("store_settings")
    .upsert({ id: "default", ...settingsToRow(settings) });
  if (error) throw error;
}
