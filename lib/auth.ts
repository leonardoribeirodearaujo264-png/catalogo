"use client";

import { getBrowserClient } from "@/lib/supabase/browser-client";
import { createCatalog, fetchMyCatalog, isSlugTaken } from "@/lib/supabase/queries";
import { slugify } from "@/lib/utils";
import type { Catalog } from "@/types/catalog";
import type { User } from "@supabase/supabase-js";

function client() {
  const c = getBrowserClient();
  if (!c) throw new Error("Supabase não está configurado. Preencha .env.local.");
  return c;
}

export async function signUp(params: { email: string; password: string; businessName: string }) {
  const { data, error } = await client().auth.signUp({
    email: params.email,
    password: params.password,
    options: { data: { business_name: params.businessName } },
  });
  if (error) throw error;
  return data; // data.session é null se a confirmação de e-mail estiver ativa
}

export async function signIn(params: { email: string; password: string }) {
  const { data, error } = await client().auth.signInWithPassword(params);
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await client().auth.signOut();
  if (error) throw error;
}

async function uniqueSlug(base: string): Promise<string> {
  const root = base || "catalogo";
  let candidate = root;
  let attempt = 1;
  while (await isSlugTaken(candidate)) {
    attempt += 1;
    candidate = `${root}-${attempt}`;
  }
  return candidate;
}

/** Garante que o usuário logado tenha um catálogo; cria um na primeira vez. */
export async function ensureCatalogForUser(user: User): Promise<Catalog> {
  const existing = await fetchMyCatalog(user.id);
  if (existing) return existing;

  const businessName =
    (user.user_metadata?.business_name as string | undefined) || user.email?.split("@")[0] || "Minha Loja";
  const slug = await uniqueSlug(slugify(businessName));

  return createCatalog(user.id, {
    slug,
    businessName,
    heroTitle: businessName,
    heroSubtitle: "Conheça nossos produtos e serviços e finalize seu pedido direto pelo WhatsApp.",
    whatsappDefaultMessage: "Olá! Vim pelo catálogo digital e tenho interesse em:",
  });
}
