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
import { ensureStoreForUser } from "@/lib/auth";
import {
  deleteVehicle as deleteVehicleRow,
  fetchMyMemberships,
  fetchStoreLeads,
  fetchStoreMetrics,
  fetchStoreVehicles,
  insertVehicle,
  isPlatformAdmin,
  logAudit,
  updateLead as updateLeadRow,
  updateStore,
  updateVehicle as updateVehicleRow,
  type StoreMetrics,
} from "@/lib/supabase/queries";
import { slugify } from "@/lib/utils";
import {
  DEFAULT_PERMISSIONS,
  effectivePermissions,
  type MemberPermissions,
  type MemberRole,
  type Store,
} from "@/types/store";
import type { Lead } from "@/types/lead";
import type { Vehicle } from "@/types/vehicle";

interface AdminStoreValue {
  store: Store | null;
  vehicles: Vehicle[];
  leads: Lead[];
  metrics: StoreMetrics;
  role: MemberRole;
  permissions: MemberPermissions;
  isPlatformAdmin: boolean;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateStoreData: (patch: Partial<Store>) => Promise<void>;
  createVehicle: (vehicle: Partial<Vehicle>) => Promise<Vehicle>;
  updateVehicle: (id: string, patch: Partial<Vehicle>) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  updateLead: (id: string, patch: Partial<Lead>) => Promise<void>;
  getVehicle: (id: string) => Vehicle | undefined;
}

const AdminStoreContext = createContext<AdminStoreValue | null>(null);

const EMPTY_METRICS: StoreMetrics = { catalogViews: 0, vehicleViews: 0, whatsappClicks: 0 };

/** Slug único dentro da loja — dois "Onix 1.0" não podem colidir. */
function uniqueVehicleSlug(base: string, taken: Set<string>): string {
  const root = slugify(base) || "veiculo";
  if (!taken.has(root)) return root;
  let attempt = 2;
  while (taken.has(`${root}-${attempt}`)) attempt += 1;
  return `${root}-${attempt}`;
}

export function AdminStoreProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [store, setStore] = useState<Store | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [metrics, setMetrics] = useState<StoreMetrics>(EMPTY_METRICS);
  const [role, setRole] = useState<MemberRole>("collaborator");
  const [permissions, setPermissions] = useState<MemberPermissions>(DEFAULT_PERMISSIONS);
  const [platformAdmin, setPlatformAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      setError(null);
      const [currentStore, superAdmin] = await Promise.all([
        ensureStoreForUser(user),
        isPlatformAdmin(user.id),
      ]);
      setStore(currentStore);
      setPlatformAdmin(superAdmin);

      const memberships = await fetchMyMemberships();
      const membership = memberships.find((m) => m.storeId === currentStore.id);
      const currentRole: MemberRole = membership?.role ?? (superAdmin ? "admin" : "collaborator");
      setRole(currentRole);
      setPermissions(effectivePermissions(currentRole, membership?.permissions ?? DEFAULT_PERMISSIONS));

      const [vehicleList, leadList, metricData] = await Promise.all([
        fetchStoreVehicles(currentStore.id),
        fetchStoreLeads(currentStore.id).catch(() => []),
        fetchStoreMetrics(currentStore.id).catch(() => EMPTY_METRICS),
      ]);
      setVehicles(vehicleList);
      setLeads(leadList);
      setMetrics(metricData);
    } catch (err) {
      console.error(err);
      setError(
        "Não foi possível carregar sua loja. Confirme as variáveis do Supabase e se o supabase/setup.sql já foi executado.",
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial da loja; o estado só muda depois do await
    load();
  }, [authLoading, load]);

  const updateStoreData = useCallback(
    async (patch: Partial<Store>) => {
      if (!store) return;
      await updateStore(store.id, patch);
      setStore((prev) => (prev ? { ...prev, ...patch } : prev));
      logAudit({ storeId: store.id, action: "store.update", entity: "store", entityId: store.id });
    },
    [store],
  );

  const createVehicle = useCallback(
    async (vehicle: Partial<Vehicle>) => {
      if (!store) throw new Error("Loja ainda não carregada.");
      const base = [vehicle.brand, vehicle.model, vehicle.version, vehicle.yearModel].filter(Boolean).join(" ");
      const slug = uniqueVehicleSlug(base, new Set(vehicles.map((v) => v.slug)));
      const created = await insertVehicle({ ...vehicle, storeId: store.id, slug });
      setVehicles((prev) => [created, ...prev]);
      logAudit({ storeId: store.id, action: "vehicle.create", entity: "vehicle", entityId: created.id });
      return created;
    },
    [store, vehicles],
  );

  const updateVehicle = useCallback(
    async (id: string, patch: Partial<Vehicle>) => {
      await updateVehicleRow(id, patch);
      setVehicles((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)));
      if (store) logAudit({ storeId: store.id, action: "vehicle.update", entity: "vehicle", entityId: id });
    },
    [store],
  );

  const deleteVehicle = useCallback(
    async (id: string) => {
      await deleteVehicleRow(id);
      setVehicles((prev) => prev.filter((v) => v.id !== id));
      if (store) logAudit({ storeId: store.id, action: "vehicle.delete", entity: "vehicle", entityId: id });
    },
    [store],
  );

  const updateLead = useCallback(async (id: string, patch: Partial<Lead>) => {
    await updateLeadRow(id, patch);
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }, []);

  const getVehicle = useCallback((id: string) => vehicles.find((v) => v.id === id), [vehicles]);

  const value = useMemo<AdminStoreValue>(
    () => ({
      store,
      vehicles,
      leads,
      metrics,
      role,
      permissions,
      isPlatformAdmin: platformAdmin,
      loading,
      error,
      refresh: load,
      updateStoreData,
      createVehicle,
      updateVehicle,
      deleteVehicle,
      updateLead,
      getVehicle,
    }),
    [
      store,
      vehicles,
      leads,
      metrics,
      role,
      permissions,
      platformAdmin,
      loading,
      error,
      load,
      updateStoreData,
      createVehicle,
      updateVehicle,
      deleteVehicle,
      updateLead,
      getVehicle,
    ],
  );

  return <AdminStoreContext.Provider value={value}>{children}</AdminStoreContext.Provider>;
}

export function useAdminStore(): AdminStoreValue {
  const ctx = useContext(AdminStoreContext);
  if (!ctx) throw new Error("useAdminStore deve ser usado dentro de <AdminStoreProvider>");
  return ctx;
}
