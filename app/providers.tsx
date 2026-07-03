"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/lib/auth-context";
import { InterestProvider } from "@/lib/interest-context";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <InterestProvider>{children}</InterestProvider>
    </AuthProvider>
  );
}
