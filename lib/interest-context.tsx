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

interface InterestContextValue {
  entries: InterestListEntry[];
  totalItems: number;
  addEntry: (entry: Omit<InterestListEntry, "quantity">) => void;
  removeEntry: (itemId: string, variationName?: string) => void;
  updateQuantity: (itemId: string, variationName: string | undefined, quantity: number) => void;
  clear: () => void;
}

const InterestContext = createContext<InterestContextValue | null>(null);

function sameEntry(a: InterestListEntry, itemId: string, variationName?: string) {
  return a.itemId === itemId && (a.variationName ?? "") === (variationName ?? "");
}

export function InterestProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<InterestListEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);

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

  const addEntry: InterestContextValue["addEntry"] = useCallback((entry) => {
    setEntries((prev) => {
      const existing = prev.find((e) => sameEntry(e, entry.itemId, entry.variationName));
      if (existing) {
        return prev.map((e) =>
          sameEntry(e, entry.itemId, entry.variationName)
            ? { ...e, quantity: e.quantity + 1 }
            : e,
        );
      }
      return [...prev, { ...entry, quantity: 1 }];
    });
  }, []);

  const removeEntry: InterestContextValue["removeEntry"] = useCallback((itemId, variationName) => {
    setEntries((prev) => prev.filter((e) => !sameEntry(e, itemId, variationName)));
  }, []);

  const updateQuantity: InterestContextValue["updateQuantity"] = useCallback(
    (itemId, variationName, quantity) => {
      setEntries((prev) =>
        prev
          .map((e) => (sameEntry(e, itemId, variationName) ? { ...e, quantity } : e))
          .filter((e) => e.quantity > 0),
      );
    },
    [],
  );

  const clear = useCallback(() => setEntries([]), []);

  const totalItems = useMemo(
    () => entries.reduce((sum, e) => sum + e.quantity, 0),
    [entries],
  );

  const value = useMemo(
    () => ({ entries, totalItems, addEntry, removeEntry, updateQuantity, clear }),
    [entries, totalItems, addEntry, removeEntry, updateQuantity, clear],
  );

  return <InterestContext.Provider value={value}>{children}</InterestContext.Provider>;
}

export function useInterestList(): InterestContextValue {
  const ctx = useContext(InterestContext);
  if (!ctx) throw new Error("useInterestList deve ser usado dentro de <InterestProvider>");
  return ctx;
}
