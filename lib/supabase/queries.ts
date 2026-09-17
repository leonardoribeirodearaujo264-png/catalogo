import type { SupabaseClient } from "@supabase/supabase-js";
import { getBrowserClient } from "./browser-client";
import {
  leadToRow,
  rowToAuditLog,
  rowToLead,
  rowToLeadHistory,
  rowToMember,
  rowToPlan,
  rowToStore,
  rowToSubscription,
  rowToTransaction,
  rowToVehicle,
  rowToVehicleImage,
  storeToRow,
  transactionToRow,
  vehicleToRow,
} from "./mappers";
import type {
  AuditLogRow,
  LeadHistoryRow,
  LeadRow,
  PlanRow,
  StoreMemberRow,
  StoreRow,
  SubscriptionRow,
  VehicleImageRow,
  VehicleRow,
  FinancialTransactionRow,
} from "./types";
import type { AuditLog, Plan, Store, StoreMember, Subscription } from "@/types/store";
import type { Lead, LeadHistoryEntry } from "@/types/lead";
import type { Vehicle, VehicleImage } from "@/types/vehicle";
import type { FinancialTransaction } from "@/types/financial";

const VEHICLE_SELECT = "*, cs_vehicle_images(*)";

function db(): SupabaseClient {
  const client = getBrowserClient();
  if (!client) throw new Error("Supabase não está configurado. Preencha .env.local.");
  return client;
}

// ============================================================
//  Público — leitura da vitrine (sem sessão)
//
//  O RLS já limita o que o anônimo enxerga (loja publicada e ativa,
//  veículo publicado e não vendido). Os filtros aqui são por
//  conveniência/performance, não são a barreira de segurança.
// ============================================================

export async function fetchPublicStoreBySlug(client: SupabaseClient, slug: string): Promise<Store | null> {
  const { data, error } = await client
    .from("cs_stores")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .eq("status", "ativa")
    .maybeSingle();
  if (error) throw error;
  return data ? rowToStore(data as StoreRow) : null;
}

/** Cap defensivo: vitrines com estoque gigante paginam pelo filtro, não pela home. */
const PUBLIC_VEHICLE_LIMIT = 500;

export async function fetchPublicVehicles(client: SupabaseClient, storeId: string): Promise<Vehicle[]> {
  const { data, error } = await client
    .from("cs_vehicles")
    .select(VEHICLE_SELECT)
    .eq("store_id", storeId)
    .eq("published", true)
    .in("status", ["disponivel", "reservado"])
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(PUBLIC_VEHICLE_LIMIT);
  if (error) throw error;
  return ((data ?? []) as VehicleRow[]).map(rowToVehicle);
}

export async function fetchPublicVehicleBySlug(
  client: SupabaseClient,
  storeId: string,
  slug: string,
): Promise<Vehicle | null> {
  const { data, error } = await client
    .from("cs_vehicles")
    .select(VEHICLE_SELECT)
    .eq("store_id", storeId)
    .eq("slug", slug)
    .eq("published", true)
    .in("status", ["disponivel", "reservado"])
    .maybeSingle();
  if (error) throw error;
  return data ? rowToVehicle(data as VehicleRow) : null;
}

/** Slugs de todas as lojas públicas — usado no sitemap. */
export async function fetchPublicStoreSlugs(client: SupabaseClient): Promise<{ slug: string }[]> {
  const { data, error } = await client
    .from("cs_stores")
    .select("slug")
    .eq("is_published", true)
    .eq("status", "ativa");
  if (error) throw error;
  return (data ?? []) as { slug: string }[];
}

export async function fetchPlans(client: SupabaseClient): Promise<Plan[]> {
  const { data, error } = await client
    .from("cs_plans")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as PlanRow[]).map(rowToPlan);
}

// ── Escrita pública: lead e eventos ──────────────────────────

export async function insertPublicLead(
  client: SupabaseClient,
  lead: Omit<Lead, "id" | "status" | "createdAt" | "updatedAt" | "notes" | "assignedTo">,
): Promise<void> {
  const { error } = await client.from("cs_leads").insert(leadToRow({ ...lead, notes: "" }));
  if (error) throw error;
}

export type StoreEventType = "view_store" | "view_vehicle" | "whatsapp_click" | "share";

/** Best-effort: métrica nunca deve quebrar a navegação do visitante. */
export async function trackStoreEvent(
  client: SupabaseClient,
  storeId: string,
  type: StoreEventType,
  vehicleId?: string,
): Promise<void> {
  try {
    await client.from("cs_store_events").insert({ store_id: storeId, type, vehicle_id: vehicleId ?? null });
  } catch {
    // silencioso de propósito
  }
}

// ============================================================
//  Sessão — loja do usuário logado
// ============================================================

/** Lojas em que o usuário logado é membro (RLS já filtra por auth.uid()). */
export async function fetchMyMemberships(): Promise<StoreMember[]> {
  const { data, error } = await db().from("cs_store_members").select("*").eq("status", "active");
  if (error) throw error;
  return ((data ?? []) as StoreMemberRow[]).map(rowToMember);
}

export async function fetchStoreById(storeId: string): Promise<Store | null> {
  const { data, error } = await db().from("cs_stores").select("*").eq("id", storeId).maybeSingle();
  if (error) throw error;
  return data ? rowToStore(data as StoreRow) : null;
}

export async function isSlugTaken(slug: string): Promise<boolean> {
  // Só conta como "livre" o slug que o anônimo não encontra E que não é meu.
  // Se o slug pertencer a uma loja não publicada de outra pessoa, o insert
  // falha na unique constraint e a mensagem é tratada em quem chama.
  const { data, error } = await db().from("cs_stores").select("id").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return !!data;
}

export async function createStore(
  ownerId: string,
  patch: Partial<Store> & { slug: string; name: string },
): Promise<Store> {
  const row = { owner_id: ownerId, ...storeToRow(patch) };
  const { data, error } = await db().from("cs_stores").insert(row).select("*").single();
  if (error) throw error;
  return rowToStore(data as StoreRow);
}

export async function updateStore(id: string, patch: Partial<Store>): Promise<void> {
  const { error } = await db().from("cs_stores").update(storeToRow(patch)).eq("id", id);
  if (error) throw error;
}

export async function isPlatformAdmin(userId: string): Promise<boolean> {
  const { data, error } = await db().from("cs_platform_admins").select("user_id").eq("user_id", userId).maybeSingle();
  if (error) return false;
  return !!data;
}

// ============================================================
//  Veículos (painel da loja)
// ============================================================

export async function fetchStoreVehicles(storeId: string): Promise<Vehicle[]> {
  const { data, error } = await db()
    .from("cs_vehicles")
    .select(VEHICLE_SELECT)
    .eq("store_id", storeId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as VehicleRow[]).map(rowToVehicle);
}

export async function fetchStoreVehicle(storeId: string, id: string): Promise<Vehicle | null> {
  const { data, error } = await db()
    .from("cs_vehicles")
    .select(VEHICLE_SELECT)
    .eq("store_id", storeId)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToVehicle(data as VehicleRow) : null;
}

export async function insertVehicle(vehicle: Partial<Vehicle> & { storeId: string; slug: string }): Promise<Vehicle> {
  const { data, error } = await db().from("cs_vehicles").insert(vehicleToRow(vehicle)).select(VEHICLE_SELECT).single();
  if (error) throw error;
  return rowToVehicle(data as VehicleRow);
}

export async function updateVehicle(id: string, patch: Partial<Vehicle>): Promise<void> {
  const { error } = await db().from("cs_vehicles").update(vehicleToRow(patch)).eq("id", id);
  if (error) throw error;
}

export async function deleteVehicle(id: string): Promise<void> {
  const { error } = await db().from("cs_vehicles").delete().eq("id", id);
  if (error) throw error;
}

// ── Fotos ────────────────────────────────────────────────────

export async function insertVehicleImage(image: {
  storeId: string;
  vehicleId: string;
  url: string;
  path: string;
  position: number;
  isCover: boolean;
}): Promise<VehicleImage> {
  const { data, error } = await db()
    .from("cs_vehicle_images")
    .insert({
      store_id: image.storeId,
      vehicle_id: image.vehicleId,
      url: image.url,
      path: image.path,
      position: image.position,
      is_cover: image.isCover,
    })
    .select("*")
    .single();
  if (error) throw error;
  return rowToVehicleImage(data as VehicleImageRow);
}

export async function deleteVehicleImage(id: string): Promise<void> {
  const { error } = await db().from("cs_vehicle_images").delete().eq("id", id);
  if (error) throw error;
}

/** Grava a nova ordem e marca a primeira foto como capa. */
export async function reorderVehicleImages(images: VehicleImage[]): Promise<void> {
  const client = db();
  await Promise.all(
    images.map((image, index) =>
      client
        .from("cs_vehicle_images")
        .update({ position: index, is_cover: index === 0 })
        .eq("id", image.id),
    ),
  );
}

export async function setVehicleCover(vehicleId: string, imageId: string, url: string): Promise<void> {
  const client = db();
  await client.from("cs_vehicle_images").update({ is_cover: false }).eq("vehicle_id", vehicleId);
  await client.from("cs_vehicle_images").update({ is_cover: true }).eq("id", imageId);
  await client.from("cs_vehicles").update({ cover_url: url }).eq("id", vehicleId);
}

// ============================================================
//  Leads
// ============================================================

export async function fetchStoreLeads(storeId: string): Promise<Lead[]> {
  const { data, error } = await db()
    .from("cs_leads")
    .select("*")
    .eq("store_id", storeId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as LeadRow[]).map(rowToLead);
}

export async function insertLead(lead: Partial<Lead> & { storeId: string }): Promise<Lead> {
  const { data, error } = await db().from("cs_leads").insert(leadToRow(lead)).select("*").single();
  if (error) throw error;
  return rowToLead(data as LeadRow);
}

export async function updateLead(id: string, patch: Partial<Lead>): Promise<void> {
  const { error } = await db().from("cs_leads").update(leadToRow(patch)).eq("id", id);
  if (error) throw error;
}

export async function deleteLead(id: string): Promise<void> {
  const { error } = await db().from("cs_leads").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchLeadHistory(leadId: string): Promise<LeadHistoryEntry[]> {
  const { data, error } = await db()
    .from("cs_lead_history")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as LeadHistoryRow[]).map(rowToLeadHistory);
}

export async function insertLeadNote(leadId: string, note: string): Promise<void> {
  const { error } = await db().from("cs_lead_history").insert({ lead_id: leadId, action: "nota", note });
  if (error) throw error;
}

// ============================================================
//  Equipe
// ============================================================

export async function fetchStoreMembers(storeId: string): Promise<StoreMember[]> {
  const { data, error } = await db()
    .from("cs_store_members")
    .select("*")
    .eq("store_id", storeId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as StoreMemberRow[]).map(rowToMember);
}

export async function updateMember(id: string, patch: Partial<StoreMember>): Promise<void> {
  const row: Record<string, unknown> = {};
  if (patch.role !== undefined) row.role = patch.role;
  if (patch.permissions !== undefined) row.permissions = patch.permissions;
  if (patch.status !== undefined) row.status = patch.status;
  if (patch.displayName !== undefined) row.display_name = patch.displayName;
  const { error } = await db().from("cs_store_members").update(row).eq("id", id);
  if (error) throw error;
}

export async function deleteMember(id: string): Promise<void> {
  const { error } = await db().from("cs_store_members").delete().eq("id", id);
  if (error) throw error;
}

// ============================================================
//  Métricas do painel
// ============================================================

export interface StoreMetrics {
  catalogViews: number;
  vehicleViews: number;
  whatsappClicks: number;
}

export async function fetchStoreMetrics(storeId: string, days = 30): Promise<StoreMetrics> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await db()
    .from("cs_store_events")
    .select("type")
    .eq("store_id", storeId)
    .gte("created_at", since);
  if (error) throw error;

  const rows = (data ?? []) as { type: string }[];
  return {
    catalogViews: rows.filter((r) => r.type === "view_store").length,
    vehicleViews: rows.filter((r) => r.type === "view_vehicle").length,
    whatsappClicks: rows.filter((r) => r.type === "whatsapp_click").length,
  };
}

export async function fetchStoreSubscription(storeId: string): Promise<Subscription | null> {
  const { data, error } = await db().from("cs_subscriptions").select("*").eq("store_id", storeId).maybeSingle();
  if (error) return null;
  return data ? rowToSubscription(data as SubscriptionRow) : null;
}

export async function fetchActivePlans(): Promise<Plan[]> {
  const { data, error } = await db().from("cs_plans").select("*").order("sort_order", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as PlanRow[]).map(rowToPlan);
}

// ============================================================
//  Superadministrador
// ============================================================

export interface StoreOverview {
  store: Store;
  vehicleCount: number;
  memberCount: number;
  leadCount: number;
}

export async function fetchAllStores(): Promise<Store[]> {
  const { data, error } = await db().from("cs_stores").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as StoreRow[]).map(rowToStore);
}

/** Contagens por loja em 3 consultas, em vez de 3 por loja. */
export async function fetchStoreOverviews(): Promise<StoreOverview[]> {
  const client = db();
  const stores = await fetchAllStores();

  const [vehicles, members, leads] = await Promise.all([
    client.from("cs_vehicles").select("store_id"),
    client.from("cs_store_members").select("store_id"),
    client.from("cs_leads").select("store_id"),
  ]);

  const count = (rows: { store_id: string }[] | null, storeId: string) =>
    (rows ?? []).filter((r) => r.store_id === storeId).length;

  return stores.map((store) => ({
    store,
    vehicleCount: count(vehicles.data as { store_id: string }[] | null, store.id),
    memberCount: count(members.data as { store_id: string }[] | null, store.id),
    leadCount: count(leads.data as { store_id: string }[] | null, store.id),
  }));
}

export async function fetchAllSubscriptions(): Promise<Subscription[]> {
  const { data, error } = await db().from("cs_subscriptions").select("*");
  if (error) throw error;
  return ((data ?? []) as SubscriptionRow[]).map(rowToSubscription);
}

export async function updateSubscription(storeId: string, patch: { planId?: string; status?: string }): Promise<void> {
  const row: Record<string, unknown> = {};
  if (patch.planId !== undefined) row.plan_id = patch.planId;
  if (patch.status !== undefined) row.status = patch.status;
  const { error } = await db().from("cs_subscriptions").update(row).eq("store_id", storeId);
  if (error) throw error;
}

export async function updatePlan(id: string, patch: Partial<Plan>): Promise<void> {
  const row: Record<string, unknown> = {};
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.description !== undefined) row.description = patch.description;
  if (patch.priceMonthly !== undefined) row.price_monthly = patch.priceMonthly;
  if (patch.vehicleLimit !== undefined) row.vehicle_limit = patch.vehicleLimit;
  if (patch.memberLimit !== undefined) row.member_limit = patch.memberLimit;
  if (patch.features !== undefined) row.features = patch.features;
  if (patch.active !== undefined) row.active = patch.active;
  const { error } = await db().from("cs_plans").update(row).eq("id", id);
  if (error) throw error;
}

export async function fetchAuditLogs(limit = 200): Promise<AuditLog[]> {
  const { data, error } = await db()
    .from("cs_audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return ((data ?? []) as AuditLogRow[]).map(rowToAuditLog);
}

export async function logAudit(entry: {
  storeId?: string;
  action: string;
  entity?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    await db()
      .from("cs_audit_logs")
      .insert({
        store_id: entry.storeId ?? null,
        action: entry.action,
        entity: entry.entity ?? "",
        entity_id: entry.entityId ?? "",
        metadata: entry.metadata ?? {},
      });
  } catch {
    // auditoria nunca deve impedir a ação principal
  }
}

// ============================================================
//  Financeiro
// ============================================================

export async function fetchTransactions(storeId: string): Promise<FinancialTransaction[]> {
  const { data, error } = await db()
    .from("cs_financial_transactions")
    .select("*")
    .eq("store_id", storeId)
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as FinancialTransactionRow[]).map(rowToTransaction);
}

export async function insertTransaction(
  tx: Omit<FinancialTransaction, "id" | "createdAt" | "updatedAt">,
): Promise<FinancialTransaction> {
  const { data, error } = await db()
    .from("cs_financial_transactions")
    .insert(transactionToRow(tx))
    .select("*")
    .single();
  if (error) throw error;
  return rowToTransaction(data as FinancialTransactionRow);
}

export async function updateTransactionRow(id: string, patch: Partial<FinancialTransaction>): Promise<void> {
  const { error } = await db().from("cs_financial_transactions").update(transactionToRow(patch)).eq("id", id);
  if (error) throw error;
}

export async function deleteTransactionRow(id: string): Promise<void> {
  const { error } = await db().from("cs_financial_transactions").delete().eq("id", id);
  if (error) throw error;
}
