"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { categories as defaultCategories } from "@/data/categories";
import { items as defaultItems } from "@/data/products";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  deleteCategoryRow,
  deleteItemRow,
  fetchCategories,
  fetchItems,
  insertCategory,
  insertItem,
  updateCategoryRow,
  updateItemRow,
} from "@/lib/supabase/queries";
import { readStorage, writeStorage } from "@/lib/storage";
import { generateId, slugify } from "@/lib/utils";
import type { CatalogItem, Category } from "@/types/catalog";

const ITEMS_KEY = "catalogo:items";
const CATEGORIES_KEY = "catalogo:categories";

interface CatalogContextValue {
  items: CatalogItem[];
  categories: Category[];
  loading: boolean;
  getItem: (id: string) => CatalogItem | undefined;
  getCategory: (id: string) => Category | undefined;
  addItem: (item: Omit<CatalogItem, "id" | "slug" | "createdAt"> & { slug?: string }) => Promise<CatalogItem>;
  updateItem: (id: string, patch: Partial<CatalogItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  addCategory: (category: Omit<Category, "id" | "slug"> & { slug?: string }) => Promise<Category>;
  updateCategory: (id: string, patch: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  resetToDefaults: () => void;
}

const CatalogContext = createContext<CatalogContextValue | null>(null);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CatalogItem[]>(defaultItems);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (isSupabaseConfigured) {
        try {
          const [dbCategories, dbItems] = await Promise.all([fetchCategories(), fetchItems()]);
          if (!cancelled) {
            setCategories(dbCategories.length ? dbCategories : defaultCategories);
            setItems(dbItems);
          }
        } catch (err) {
          console.error("Falha ao carregar dados do Supabase, usando dados locais.", err);
          if (!cancelled) {
            setItems(readStorage(ITEMS_KEY, defaultItems));
            setCategories(readStorage(CATEGORIES_KEY, defaultCategories));
          }
        } finally {
          if (!cancelled) setLoading(false);
        }
      } else {
        setItems(readStorage(ITEMS_KEY, defaultItems));
        setCategories(readStorage(CATEGORIES_KEY, defaultCategories));
      }
      if (!cancelled) setHydrated(true);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (hydrated && !isSupabaseConfigured) writeStorage(ITEMS_KEY, items);
  }, [items, hydrated]);

  useEffect(() => {
    if (hydrated && !isSupabaseConfigured) writeStorage(CATEGORIES_KEY, categories);
  }, [categories, hydrated]);

  const getItem = useCallback((id: string) => items.find((i) => i.id === id), [items]);
  const getCategory = useCallback(
    (id: string) => categories.find((c) => c.id === id),
    [categories],
  );

  const addItem: CatalogContextValue["addItem"] = useCallback(async (item) => {
    if (isSupabaseConfigured) {
      const created = await insertItem({ ...item, slug: item.slug || slugify(item.name) });
      setItems((prev) => [created, ...prev]);
      return created;
    }
    const created: CatalogItem = {
      ...item,
      id: generateId("item"),
      slug: item.slug || slugify(item.name),
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setItems((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateItem: CatalogContextValue["updateItem"] = useCallback(async (id, patch) => {
    if (isSupabaseConfigured) await updateItemRow(id, patch);
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }, []);

  const deleteItem: CatalogContextValue["deleteItem"] = useCallback(async (id) => {
    if (isSupabaseConfigured) await deleteItemRow(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const addCategory: CatalogContextValue["addCategory"] = useCallback(async (category) => {
    if (isSupabaseConfigured) {
      const created = await insertCategory({ ...category, slug: category.slug || slugify(category.name) });
      setCategories((prev) => [...prev, created].sort((a, b) => a.order - b.order));
      return created;
    }
    const created: Category = {
      ...category,
      id: generateId("cat"),
      slug: category.slug || slugify(category.name),
    };
    setCategories((prev) => [...prev, created].sort((a, b) => a.order - b.order));
    return created;
  }, []);

  const updateCategory: CatalogContextValue["updateCategory"] = useCallback(async (id, patch) => {
    if (isSupabaseConfigured) await updateCategoryRow(id, patch);
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }, []);

  const deleteCategory: CatalogContextValue["deleteCategory"] = useCallback(async (id) => {
    if (isSupabaseConfigured) await deleteCategoryRow(id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const resetToDefaults = useCallback(() => {
    setItems(defaultItems);
    setCategories(defaultCategories);
  }, []);

  const value = useMemo(
    () => ({
      items,
      categories,
      loading,
      getItem,
      getCategory,
      addItem,
      updateItem,
      deleteItem,
      addCategory,
      updateCategory,
      deleteCategory,
      resetToDefaults,
    }),
    [
      items,
      categories,
      loading,
      getItem,
      getCategory,
      addItem,
      updateItem,
      deleteItem,
      addCategory,
      updateCategory,
      deleteCategory,
      resetToDefaults,
    ],
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): CatalogContextValue {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog deve ser usado dentro de <CatalogProvider>");
  return ctx;
}
