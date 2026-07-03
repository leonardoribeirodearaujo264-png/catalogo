"use client";

import type { ReactNode } from "react";
import { FinancialProvider } from "@/lib/financial-context";

export default function FinanceiroLayout({ children }: { children: ReactNode }) {
  return <FinancialProvider>{children}</FinancialProvider>;
}
