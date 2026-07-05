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
import type { DeliveryAddress } from "@/types/catalog";

const ADDRESS_KEY = "catalogo:enderecos-entrega";

type AddressMap = Record<string, DeliveryAddress>;

interface DeliveryAddressContextValue {
  getAddress: (catalogId: string) => DeliveryAddress | null;
  saveAddress: (catalogId: string, address: DeliveryAddress) => void;
  notice: number | null;
}

const DeliveryAddressContext = createContext<DeliveryAddressContextValue | null>(null);

export function DeliveryAddressProvider({ children }: { children: ReactNode }) {
  const [addresses, setAddresses] = useState<AddressMap>({});
  const [hydrated, setHydrated] = useState(false);
  const [notice, setNotice] = useState<number | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAddresses(readStorage(ADDRESS_KEY, {} as AddressMap));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) writeStorage(ADDRESS_KEY, addresses);
  }, [addresses, hydrated]);

  const getAddress = useCallback((catalogId: string) => addresses[catalogId] ?? null, [addresses]);

  const saveAddress = useCallback((catalogId: string, address: DeliveryAddress) => {
    setAddresses((prev) => ({ ...prev, [catalogId]: address }));
    setNotice(Date.now());
  }, []);

  const value = useMemo(
    () => ({ getAddress, saveAddress, notice }),
    [getAddress, saveAddress, notice],
  );

  return <DeliveryAddressContext.Provider value={value}>{children}</DeliveryAddressContext.Provider>;
}

export function useDeliveryAddress(): DeliveryAddressContextValue {
  const ctx = useContext(DeliveryAddressContext);
  if (!ctx) throw new Error("useDeliveryAddress deve ser usado dentro de <DeliveryAddressProvider>");
  return ctx;
}
