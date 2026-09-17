"use client";

import { getBrowserClient } from "@/lib/supabase/browser-client";
import { createStore, fetchMyMemberships, fetchStoreById, isSlugTaken } from "@/lib/supabase/queries";
import { slugify } from "@/lib/utils";
import type { Store } from "@/types/store";
import type { User } from "@supabase/supabase-js";

function client() {
  const c = getBrowserClient();
  if (!c) throw new Error("Supabase não está configurado. Preencha .env.local.");
  return c;
}

export async function signUp(params: { email: string; password: string; storeName: string; fullName: string }) {
  const { data, error } = await client().auth.signUp({
    email: params.email,
    password: params.password,
    options: { data: { store_name: params.storeName, full_name: params.fullName } },
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

export async function suggestUniqueSlug(base: string): Promise<string> {
  const root = slugify(base) || "minha-loja";
  let candidate = root;
  let attempt = 1;
  while (await isSlugTaken(candidate)) {
    attempt += 1;
    candidate = `${root}-${attempt}`;
  }
  return candidate;
}

async function findStoreOfUser(): Promise<Store | null> {
  const memberships = await fetchMyMemberships();
  if (memberships.length === 0) return null;
  // Prioriza a loja em que a pessoa é dona, se participar de mais de uma.
  const preferred = memberships.find((m) => m.role === "owner") ?? memberships[0];
  return fetchStoreById(preferred.storeId);
}

async function resolveStore(user: User): Promise<Store> {
  const existing = await findStoreOfUser();
  if (existing) return existing;

  const storeName =
    (user.user_metadata?.store_name as string | undefined) || user.email?.split("@")[0] || "Minha Loja";

  try {
    return await createStore(user.id, {
      slug: await suggestUniqueSlug(storeName),
      name: storeName,
      email: user.email ?? "",
      isPublished: false,
      onboardingStep: 1,
    });
  } catch (err) {
    // Criação concorrente: cs_stores.owner_id é unique, então a segunda
    // tentativa estoura. Acontece de verdade — o StrictMode do React roda o
    // efeito duas vezes em dev, e um duplo clique faz o mesmo em produção.
    // Se a loja já existe, é ela que vale.
    const created = await findStoreOfUser();
    if (created) return created;
    throw err;
  }
}

/** Chamadas simultâneas para o mesmo usuário compartilham a mesma promise. */
const inFlight = new Map<string, Promise<Store>>();

/**
 * Resolve a loja do usuário logado. Se ele ainda não tem nenhuma, cria
 * uma em rascunho (is_published = false) para o onboarding preencher —
 * assim o painel nunca abre sem contexto de loja.
 *
 * A associação dono/loja é feita pelo banco (trigger cs_add_owner_membership),
 * não aqui: o frontend não decide de quem é a loja.
 */
export function ensureStoreForUser(user: User): Promise<Store> {
  const pending = inFlight.get(user.id);
  if (pending) return pending;

  const promise = resolveStore(user).finally(() => inFlight.delete(user.id));
  inFlight.set(user.id, promise);
  return promise;
}
