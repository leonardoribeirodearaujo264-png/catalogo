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
import { readStorage, writeStorage } from "@/lib/storage";
import type { InterestListEntry } from "@/types/catalog";

const INTEREST_KEY = "catalogo:interesse";

export interface AddedNotice {
  id: number;
  quantity: number;
}

interface InterestContextValue {
  entries: InterestListEntry[];
  addEntry: (entry: Omit<InterestListEntry, "quantity">, quantity?: number) => void;
  removeEntry: (catalogId: string, itemId: string, variationName?: string) => void;
  updateQuantity: (catalogId: string, itemId: string, variationName: string | undefined, quantity: number) => void;
  clear: (catalogId: string) => void;
  entriesForCatalog: (catalogId: string) => InterestListEntry[];
  totalItemsForCatalog: (catalogId: string) => number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  notice: AddedNotice | null;
}

const InterestContext = createContext<InterestContextValue | null>(null);

function sameEntry(a: InterestListEntry, catalogId: string, itemId: string, variationName?: string) {
  return a.catalogId === catalogId && a.itemId === itemId && (a.variationName ?? "") === (variationName ?? "");
}

export function InterestProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<InterestListEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [notice, setNotice] = useState<AddedNotice | null>(null);
  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  useEffect(() => {
    // Lê o localStorage só depois da montagem para o HTML da hidratação
    // bater com o gerado no build (que não tem acesso ao localStorage).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEntries(readStorage(INTEREST_KEY, [] as InterestListEntry[]));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) writeStorage(INTEREST_KEY, entries);
  }, [entries, hydrated]);

  const addEntry: InterestContextValue["addEntry"] = useCallback((entry, quantity) => {
    const qty = quantity && quantity > 0 ? quantity : 1;
    setEntries((prev) => {
      const existing = prev.find((e) => sameEntry(e, entry.catalogId, entry.itemId, entry.variationName));
      if (existing) {
        return prev.map((e) =>
          sameEntry(e, entry.catalogId, entry.itemId, entry.variationName)
            ? { ...e, quantity: e.quantity + qty }
            : e,
        );
      }
      return [...prev, { ...entry, quantity: qty }];
    });
    setNotice({ id: Date.now(), quantity: qty });
  }, []);

  const removeEntry: InterestContextValue["removeEntry"] = useCallback((catalogId, itemId, variationName) => {
    setEntries((prev) => prev.filter((e) => !sameEntry(e, catalogId, itemId, variationName)));
  }, []);

  const updateQuantity: InterestContextValue["updateQuantity"] = useCallback(
    (catalogId, itemId, variationName, quantity) => {
      setEntries((prev) =>
        prev
          .map((e) => (sameEntry(e, catalogId, itemId, variationName) ? { ...e, quantity } : e))
          .filter((e) => e.quantity > 0),
      );
    },
    [],
  );

  const clear = useCallback((catalogId: string) => {
    setEntries((prev) => prev.filter((e) => e.catalogId !== catalogId));
  }, []);

  const entriesForCatalog = useCallback(
    (catalogId: string) => entries.filter((e) => e.catalogId === catalogId),
    [entries],
  );

  const totalItemsForCatalog = useCallback(
    (catalogId: string) => entries.filter((e) => e.catalogId === catalogId).reduce((sum, e) => sum + e.quantity, 0),
    [entries],
  );

  const value = useMemo(
    () => ({
      entries,
      addEntry,
      removeEntry,
      updateQuantity,
      clear,
      entriesForCatalog,
      totalItemsForCatalog,
      isCartOpen,
      openCart,
      closeCart,
      notice,
    }),
    [
      entries,
      addEntry,
      removeEntry,
      updateQuantity,
      clear,
      entriesForCatalog,
      totalItemsForCatalog,
      isCartOpen,
      openCart,
      closeCart,
      notice,
    ],
  );

  return <InterestContext.Provider value={value}>{children}</InterestContext.Provider>;
}

export function useInterestList(): InterestContextValue {
  const ctx = useContext(InterestContext);
  if (!ctx) throw new Error("useInterestList deve ser usado dentro de <InterestProvider>");
  return ctx;
}
