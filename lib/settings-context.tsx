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
import { defaultSettings } from "@/data/settings";
import { readStorage, writeStorage } from "@/lib/storage";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { fetchSettings, upsertSettings } from "@/lib/supabase/queries";
import type { StoreSettings } from "@/types/catalog";

const SETTINGS_KEY = "catalogo:settings";

interface SettingsContextValue {
  settings: StoreSettings;
  loading: boolean;
  updateSettings: (patch: Partial<StoreSettings>) => Promise<void>;
  resetToDefaults: () => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (isSupabaseConfigured) {
        try {
          const dbSettings = await fetchSettings();
          if (!cancelled && dbSettings) setSettings(dbSettings);
        } catch (err) {
          console.error("Falha ao carregar configurações do Supabase, usando dados locais.", err);
          if (!cancelled) {
            setSettings(readStorage(SETTINGS_KEY, defaultSettings));
          }
        } finally {
          if (!cancelled) setLoading(false);
        }
      } else {
        setSettings(readStorage(SETTINGS_KEY, defaultSettings));
      }
      if (!cancelled) setHydrated(true);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (hydrated && !isSupabaseConfigured) writeStorage(SETTINGS_KEY, settings);
  }, [settings, hydrated]);

  useEffect(() => {
    document.documentElement.style.setProperty("--brand-primary", settings.primaryColor);
    document.documentElement.style.setProperty("--brand-accent", settings.accentColor);
  }, [settings.primaryColor, settings.accentColor]);

  const updateSettings = useCallback(
    async (patch: Partial<StoreSettings>) => {
      const next = { ...settings, ...patch };
      if (isSupabaseConfigured) await upsertSettings(next);
      setSettings(next);
    },
    [settings],
  );

  const resetToDefaults = useCallback(() => setSettings(defaultSettings), []);

  const value = useMemo(
    () => ({ settings, loading, updateSettings, resetToDefaults }),
    [settings, loading, updateSettings, resetToDefaults],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings deve ser usado dentro de <SettingsProvider>");
  return ctx;
}
