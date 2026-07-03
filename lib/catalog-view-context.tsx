"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import type { CatalogItem, Category, Catalog } from "@/types/catalog";

interface CatalogViewValue {
  catalog: Catalog;
  categories: Category[];
  items: CatalogItem[];
  getCategory: (id: string) => Category | undefined;
  getItem: (id: string) => CatalogItem | undefined;
}

const CatalogViewContext = createContext<CatalogViewValue | null>(null);

export function CatalogViewProvider({
  catalog,
  categories,
  items,
  children,
}: {
  catalog: Catalog;
  categories: Category[];
  items: CatalogItem[];
  children: ReactNode;
}) {
  const getCategory = useCallback((id: string) => categories.find((c) => c.id === id), [categories]);
  const getItem = useCallback((id: string) => items.find((i) => i.id === id), [items]);

  const value = useMemo(
    () => ({ catalog, categories, items, getCategory, getItem }),
    [catalog, categories, items, getCategory, getItem],
  );

  return <CatalogViewContext.Provider value={value}>{children}</CatalogViewContext.Provider>;
}

export function useCatalogView(): CatalogViewValue {
  const ctx = useContext(CatalogViewContext);
  if (!ctx) throw new Error("useCatalogView deve ser usado dentro de <CatalogViewProvider>");
  return ctx;
}
