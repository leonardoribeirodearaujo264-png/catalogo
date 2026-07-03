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
import { useAuth } from "@/lib/auth-context";
import { ensureCatalogForUser } from "@/lib/auth";
import {
  deleteCategoryRow,
  deleteItemRow,
  fetchOwnerCategories,
  fetchOwnerProducts,
  insertCategory,
  insertItem,
  updateCategoryRow,
  updateItemRow,
  updateMyCatalog,
} from "@/lib/supabase/queries";
import { slugify } from "@/lib/utils";
import type { CatalogItem, Category, Catalog } from "@/types/catalog";

interface AdminCatalogContextValue {
  catalog: Catalog | null;
  items: CatalogItem[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  getItem: (id: string) => CatalogItem | undefined;
  getCategory: (id: string) => Category | undefined;
  updateCatalog: (patch: Partial<Catalog>) => Promise<void>;
  addItem: (item: Omit<CatalogItem, "id" | "catalogId" | "slug" | "createdAt"> & { slug?: string }) => Promise<CatalogItem>;
  updateItem: (id: string, patch: Partial<CatalogItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  addCategory: (category: Omit<Category, "id" | "catalogId" | "slug"> & { slug?: string }) => Promise<Category>;
  updateCategory: (id: string, patch: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

const AdminCatalogContext = createContext<AdminCatalogContextValue | null>(null);

export function AdminCatalogProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (authLoading) return;
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const myCatalog = await ensureCatalogForUser(user);
        const [cats, prods] = await Promise.all([
          fetchOwnerCategories(myCatalog.id),
          fetchOwnerProducts(myCatalog.id),
        ]);
        if (!cancelled) {
          setCatalog(myCatalog);
          setCategories(cats);
          setItems(prods);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setError("Não foi possível carregar seu catálogo. Verifique sua conexão com o Supabase.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  const getItem = useCallback((id: string) => items.find((i) => i.id === id), [items]);
  const getCategory = useCallback((id: string) => categories.find((c) => c.id === id), [categories]);

  const updateCatalog = useCallback(
    async (patch: Partial<Catalog>) => {
      if (!catalog) return;
      await updateMyCatalog(catalog.id, patch);
      setCatalog((prev) => (prev ? { ...prev, ...patch } : prev));
    },
    [catalog],
  );

  const addItem: AdminCatalogContextValue["addItem"] = useCallback(
    async (item) => {
      if (!catalog) throw new Error("Catálogo ainda não carregado.");
      const created = await insertItem({
        ...item,
        catalogId: catalog.id,
        slug: item.slug || slugify(item.name),
      });
      setItems((prev) => [created, ...prev]);
      return created;
    },
    [catalog],
  );

  const updateItem: AdminCatalogContextValue["updateItem"] = useCallback(async (id, patch) => {
    await updateItemRow(id, patch);
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }, []);

  const deleteItem: AdminCatalogContextValue["deleteItem"] = useCallback(async (id) => {
    await deleteItemRow(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const addCategory: AdminCatalogContextValue["addCategory"] = useCallback(
    async (category) => {
      if (!catalog) throw new Error("Catálogo ainda não carregado.");
      const created = await insertCategory({
        ...category,
        catalogId: catalog.id,
        slug: category.slug || slugify(category.name),
      });
      setCategories((prev) => [...prev, created].sort((a, b) => a.order - b.order));
      return created;
    },
    [catalog],
  );

  const updateCategory: AdminCatalogContextValue["updateCategory"] = useCallback(async (id, patch) => {
    await updateCategoryRow(id, patch);
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }, []);

  const deleteCategory: AdminCatalogContextValue["deleteCategory"] = useCallback(async (id) => {
    await deleteCategoryRow(id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      catalog,
      items,
      categories,
      loading,
      error,
      getItem,
      getCategory,
      updateCatalog,
      addItem,
      updateItem,
      deleteItem,
      addCategory,
      updateCategory,
      deleteCategory,
    }),
    [
      catalog,
      items,
      categories,
      loading,
      error,
      getItem,
      getCategory,
      updateCatalog,
      addItem,
      updateItem,
      deleteItem,
      addCategory,
      updateCategory,
      deleteCategory,
    ],
  );

  return <AdminCatalogContext.Provider value={value}>{children}</AdminCatalogContext.Provider>;
}

export function useAdminCatalog(): AdminCatalogContextValue {
  const ctx = useContext(AdminCatalogContext);
  if (!ctx) throw new Error("useAdminCatalog deve ser usado dentro de <AdminCatalogProvider>");
  return ctx;
}
