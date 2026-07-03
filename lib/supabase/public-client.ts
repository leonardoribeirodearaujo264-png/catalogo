import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabasePublishableKey, supabaseUrl } from "./config";

// Cliente "anônimo" para leitura pública server-side (Server Components das
// páginas /catalogo/[slug]). Não usa cookies nem sessão — só serve para ler
// dados de catálogos publicados, que o RLS libera para qualquer um.
let client: SupabaseClient | null = null;

export function getPublicClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!client) {
    client = createClient(supabaseUrl as string, supabasePublishableKey as string);
  }
  return client;
}
