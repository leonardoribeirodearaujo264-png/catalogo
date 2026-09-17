"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { readStorage, writeStorage } from "@/lib/storage";

// Favoritos do visitante ficam no navegador dele: a vitrine é pública e
// sem login, então não há usuário a quem vincular no banco. Nada de dados
// pessoais é gravado — só os ids dos veículos, por loja.

const KEY = "carselect:favorites";

type FavoritesMap = Record<string, string[]>;

interface FavoritesValue {
  ids: string[];
  isFavorite: (vehicleId: string) => boolean;
  toggle: (vehicleId: string) => void;
  count: number;
}

const FavoritesContext = createContext<FavoritesValue | null>(null);

export function FavoritesProvider({ storeId, children }: { storeId: string; children: ReactNode }) {
  const [map, setMap] = useState<FavoritesMap>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Só depois da hidratação, para o HTML do servidor e do cliente baterem.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage não existe no servidor
    setMap(readStorage<FavoritesMap>(KEY, {}));
    setHydrated(true);
  }, []);

  const ids = useMemo(() => (hydrated ? (map[storeId] ?? []) : []), [map, storeId, hydrated]);

  const toggle = useCallback(
    (vehicleId: string) => {
      setMap((prev) => {
        const current = prev[storeId] ?? [];
        const next = current.includes(vehicleId)
          ? current.filter((id) => id !== vehicleId)
          : [...current, vehicleId];
        const updated = { ...prev, [storeId]: next };
        writeStorage(KEY, updated);
        return updated;
      });
    },
    [storeId],
  );

  const value = useMemo<FavoritesValue>(
    () => ({
      ids,
      isFavorite: (vehicleId: string) => ids.includes(vehicleId),
      toggle,
      count: ids.length,
    }),
    [ids, toggle],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites deve ser usado dentro de <FavoritesProvider>");
  return ctx;
}
