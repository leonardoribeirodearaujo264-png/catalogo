"use client";

import type { ReactNode } from "react";
import { CatalogProvider } from "@/lib/catalog-context";
import { InterestProvider } from "@/lib/interest-context";
import { SettingsProvider } from "@/lib/settings-context";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SettingsProvider>
      <CatalogProvider>
        <InterestProvider>{children}</InterestProvider>
      </CatalogProvider>
    </SettingsProvider>
  );
}
