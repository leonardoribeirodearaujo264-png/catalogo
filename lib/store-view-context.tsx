"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Store } from "@/types/store";
import type { Vehicle } from "@/types/vehicle";

// Dados da vitrine pública, carregados no servidor (SSR) e distribuídos
// para os componentes client. Nenhuma chamada autenticada acontece aqui.

interface StoreViewValue {
  store: Store;
  vehicles: Vehicle[];
  brands: string[];
  modelsByBrand: Record<string, string[]>;
  getVehicle: (id: string) => Vehicle | undefined;
}

const StoreViewContext = createContext<StoreViewValue | null>(null);

export function StoreViewProvider({
  store,
  vehicles,
  children,
}: {
  store: Store;
  vehicles: Vehicle[];
  children: ReactNode;
}) {
  const value = useMemo<StoreViewValue>(() => {
    const brands = Array.from(new Set(vehicles.map((v) => v.brand).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b, "pt-BR"),
    );

    const modelsByBrand: Record<string, string[]> = {};
    for (const vehicle of vehicles) {
      if (!vehicle.brand || !vehicle.model) continue;
      const list = (modelsByBrand[vehicle.brand] ??= []);
      if (!list.includes(vehicle.model)) list.push(vehicle.model);
    }
    for (const list of Object.values(modelsByBrand)) list.sort((a, b) => a.localeCompare(b, "pt-BR"));

    return {
      store,
      vehicles,
      brands,
      modelsByBrand,
      getVehicle: (id: string) => vehicles.find((v) => v.id === id),
    };
  }, [store, vehicles]);

  return <StoreViewContext.Provider value={value}>{children}</StoreViewContext.Provider>;
}

export function useStoreView(): StoreViewValue {
  const ctx = useContext(StoreViewContext);
  if (!ctx) throw new Error("useStoreView deve ser usado dentro de <StoreViewProvider>");
  return ctx;
}
