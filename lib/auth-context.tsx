"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getBrowserClient } from "@/lib/supabase/browser-client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { User } from "@supabase/supabase-js";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({ user: null, loading: isSupabaseConfigured });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    const supabase = getBrowserClient();
    if (!supabase) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }

    // onAuthStateChange já dispara uma vez de imediato com a sessão local
    // (evento INITIAL_SESSION, sem round-trip de rede) e depois a cada
    // mudança — não precisa de um getUser() extra só para o estado inicial,
    // isso só duplicava uma chamada de rede ao servidor de auth e deixava
    // o app mais lento pra "entrar", principalmente em conexões móveis.
    // A verificação que realmente importa pra segurança (getUser() com
    // validação no servidor) já acontece no proxy.ts antes da página
    // carregar, e o RLS protege cada operação no banco de qualquer forma.
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(() => ({ user, loading }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
