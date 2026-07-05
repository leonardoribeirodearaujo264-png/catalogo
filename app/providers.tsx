"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/lib/auth-context";
import { InterestProvider } from "@/lib/interest-context";
import { DeliveryAddressProvider } from "@/lib/delivery-address-context";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <InterestProvider>
        <DeliveryAddressProvider>{children}</DeliveryAddressProvider>
      </InterestProvider>
    </AuthProvider>
  );
}
