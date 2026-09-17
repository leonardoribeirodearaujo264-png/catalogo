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
import { useAdminStore } from "@/lib/admin-store-context";
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
  addTransaction: (tx: Omit<FinancialTransaction, "id" | "userId" | "storeId" | "createdAt" | "updatedAt">) => Promise<FinancialTransaction>;
  updateTransaction: (id: string, patch: Partial<FinancialTransaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  getTransaction: (id: string) => FinancialTransaction | undefined;
}

const FinancialContext = createContext<FinancialContextValue | null>(null);

export function FinancialProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { store, loading: storeLoading } = useAdminStore();
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (storeLoading) return;
      if (!store) {
        setLoading(false);
        return;
      }
      try {
        const data = await fetchTransactions(store.id);
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
  }, [store, storeLoading]);

  const addTransaction: FinancialContextValue["addTransaction"] = useCallback(
    async (tx) => {
      if (!store || !user) throw new Error("Loja ainda não carregada.");
      const created = await insertTransaction({ ...tx, storeId: store.id, userId: user.id });
      setTransactions((prev) => [created, ...prev]);
      return created;
    },
    [store, user],
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
