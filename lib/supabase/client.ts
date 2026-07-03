import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(url && key);

// Sem o genérico <Database>: as versões mais novas do postgrest-js exigem um
// formato de tipos bem específico (com Views/Functions/Relationships) e
// travar nisso não vale a pena aqui — a tipagem de entrada/saída é garantida
// pelas funções em ./queries.ts e pelos mappers em ./mappers.ts.
let client: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  client = createClient(url as string, key as string);
}

/** null quando as variáveis de ambiente do Supabase não estão configuradas. */
export const supabase = client;
