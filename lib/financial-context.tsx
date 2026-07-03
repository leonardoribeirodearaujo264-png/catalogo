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
import { useAuth } from "@/lib/auth-context";
import { useAdminCatalog } from "@/lib/admin-catalog-context";
import {
  deleteTransactionRow,
  fetchTransactions,
  insertTransaction,
  updateTransactionRow,
} from "@/lib/supabase/queries";
import type { FinancialTransaction } from "@/types/financial";

interface FinancialContextValue {
  transactions: FinancialTransaction[];
  loading: boolean;
  error: string | null;
  addTransaction: (tx: Omit<FinancialTransaction, "id" | "userId" | "catalogId" | "createdAt" | "updatedAt">) => Promise<FinancialTransaction>;
  updateTransaction: (id: string, patch: Partial<FinancialTransaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  getTransaction: (id: string) => FinancialTransaction | undefined;
}

const FinancialContext = createContext<FinancialContextValue | null>(null);

export function FinancialProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { catalog, loading: catalogLoading } = useAdminCatalog();
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (catalogLoading) return;
      if (!catalog) {
        setLoading(false);
        return;
      }
      try {
        const data = await fetchTransactions(catalog.id);
        if (!cancelled) setTransactions(data);
      } catch (err) {
        console.error(err);
        if (!cancelled) setError("Não foi possível carregar o financeiro. Rode o supabase/setup.sql mais recente.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [catalog, catalogLoading]);

  const addTransaction: FinancialContextValue["addTransaction"] = useCallback(
    async (tx) => {
      if (!catalog || !user) throw new Error("Catálogo ainda não carregado.");
      const created = await insertTransaction({ ...tx, catalogId: catalog.id, userId: user.id });
      setTransactions((prev) => [created, ...prev]);
      return created;
    },
    [catalog, user],
  );

  const updateTransaction: FinancialContextValue["updateTransaction"] = useCallback(async (id, patch) => {
    await updateTransactionRow(id, patch);
    setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }, []);

  const deleteTransaction: FinancialContextValue["deleteTransaction"] = useCallback(async (id) => {
    await deleteTransactionRow(id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const getTransaction = useCallback((id: string) => transactions.find((t) => t.id === id), [transactions]);

  const value = useMemo(
    () => ({ transactions, loading, error, addTransaction, updateTransaction, deleteTransaction, getTransaction }),
    [transactions, loading, error, addTransaction, updateTransaction, deleteTransaction, getTransaction],
  );

  return <FinancialContext.Provider value={value}>{children}</FinancialContext.Provider>;
}

export function useFinancial(): FinancialContextValue {
  const ctx = useContext(FinancialContext);
  if (!ctx) throw new Error("useFinancial deve ser usado dentro de <FinancialProvider>");
  return ctx;
}
