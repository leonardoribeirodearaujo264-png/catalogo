"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabasePublishableKey, supabaseUrl } from "./config";

// Cliente usado em componentes client (auth, CRUD do admin, interatividade
// pública). Guarda a sessão em cookies (não localStorage) para que o
// proxy.ts e os componentes de servidor consigam ler o mesmo login.
let client: SupabaseClient | null = null;

export function getBrowserClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!client) {
    client = createBrowserClient(supabaseUrl as string, supabasePublishableKey as string);
  }
  return client;
}
