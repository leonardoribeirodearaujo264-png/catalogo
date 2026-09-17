"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "@/lib/toast-context";
import {
  fetchActivePlans,
  fetchAllSubscriptions,
  fetchStoreOverviews,
  logAudit,
  updateStore,
  updateSubscription,
  type StoreOverview,
} from "@/lib/supabase/queries";
import { cn, formatDate } from "@/lib/utils";
import type { Plan, StoreStatus, Subscription } from "@/types/store";
import { PageHeader, StatCard } from "@/components/admin/admin-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/field";
import { EmptyState, Modal, Skeleton } from "@/components/ui/feedback";
import { BuildingIcon, CarIcon, SearchIcon, UsersIcon } from "@/components/icons";

const STATUS_TONES: Record<StoreStatus, "success" | "warning" | "danger" | "neutral"> = {
  ativa: "success",
  pendente: "warning",
  bloqueada: "danger",
  desativada: "neutral",
};

const STATUS_LABELS: Record<StoreStatus, string> = {
  ativa: "Ativa",
  pendente: "Pendente",
  bloqueada: "Bloqueada",
  desativada: "Desativada",
};

export default function SuperadminStoresPage() {
  const toast = useToast();
  const [overviews, setOverviews] = useState<StoreOverview[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StoreStatus | "">("");
  const [selected, setSelected] = useState<StoreOverview | null>(null);

  const load = useCallback(async () => {
    try {
      const [data, subs, planList] = await Promise.all([
        fetchStoreOverviews(),
        fetchAllSubscriptions().catch(() => []),
        fetchActivePlans().catch(() => []),
      ]);
      setOverviews(data);
      setSubscriptions(subs);
      setPlans(planList);
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível carregar as lojas.");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- busca remota no mount; o estado só muda depois do await
    load();
  }, [load]);

  const totals = useMemo(
    () => ({
      stores: overviews.length,
      active: overviews.filter((o) => o.store.status === "ativa").length,
      vehicles: overviews.reduce((sum, o) => sum + o.vehicleCount, 0),
      members: overviews.reduce((sum, o) => sum + o.memberCount, 0),
    }),
    [overviews],
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return overviews.filter((item) => {
      if (status && item.store.status !== status) return false;
      if (!term) return true;
      return [item.store.name, item.store.slug, item.store.email].join(" ").toLowerCase().includes(term);
    });
  }, [overviews, query, status]);

  async function changeStatus(overview: StoreOverview, next: StoreStatus) {
    try {
      await updateStore(overview.store.id, { status: next });
      setOverviews((prev) =>
        prev.map((item) =>
          item.store.id === overview.store.id ? { ...item, store: { ...item.store, status: next } } : item,
        ),
      );
      setSelected((prev) => (prev ? { ...prev, store: { ...prev.store, status: next } } : prev));
      logAudit({
        storeId: overview.store.id,
        action: `store.status.${next}`,
        entity: "store",
        entityId: overview.store.id,
      });
      toast.success(`Loja ${STATUS_LABELS[next].toLowerCase()}.`);
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível alterar o status da loja.");
    }
  }

  async function changePlan(storeId: string, planId: string) {
    try {
      await updateSubscription(storeId, { planId });
      setSubscriptions((prev) => prev.map((s) => (s.storeId === storeId ? { ...s, planId } : s)));
      toast.success("Plano atualizado.");
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível alterar o plano.");
    }
  }

  const planName = (storeId: string) => {
    const subscription = subscriptions.find((s) => s.storeId === storeId);
    return plans.find((p) => p.id === subscription?.planId)?.name ?? "—";
  };

  return (
    <>
      <PageHeader title="Lojas da plataforma" description="Visão geral de todas as lojas cadastradas no Car Select." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Lojas cadastradas" value={totals.stores} icon={<BuildingIcon className="h-4 w-4" />} />
        <StatCard label="Lojas ativas" value={totals.active} tone="success" />
        <StatCard label="Veículos na plataforma" value={totals.vehicles} icon={<CarIcon className="h-4 w-4" />} />
        <StatCard label="Usuários" value={totals.members} icon={<UsersIcon className="h-4 w-4" />} />
      </div>

      <div className="my-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite-500" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar loja por nome, link ou e-mail"
            aria-label="Buscar lojas"
            className="h-11 w-full rounded-xl border border-white/12 bg-graphite-900 pl-10 pr-3.5 text-sm text-cream placeholder:text-graphite-500 focus:border-[var(--store-accent)] focus:outline-none"
          />
        </div>
        <Select
          aria-label="Filtrar por status"
          value={status}
          onChange={(event) => setStatus(event.target.value as StoreStatus | "")}
          className="sm:w-52"
        >
          <option value="">Todos os status</option>
          {(Object.keys(STATUS_LABELS) as StoreStatus[]).map((value) => (
            <option key={value} value={value}>
              {STATUS_LABELS[value]}
            </option>
          ))}
        </Select>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState title="Nenhuma loja encontrada" description="Ajuste a busca ou o filtro de status." />
      ) : (
        <ul className="flex flex-col gap-3">
          {filtered.map((item) => (
            <li
              key={item.store.id}
              className="surface flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[15px] font-semibold text-cream">{item.store.name}</span>
                  <Badge tone={STATUS_TONES[item.store.status]}>{STATUS_LABELS[item.store.status]}</Badge>
                  {!item.store.isPublished && <Badge tone="neutral">Não publicada</Badge>}
                  <Badge tone="info">{planName(item.store.id)}</Badge>
                </div>
                <p className="mt-0.5 text-[13px] text-mute">
                  <Link href={`/loja/${item.store.slug}`} target="_blank" className="hover:accent-text">
                    /loja/{item.store.slug}
                  </Link>
                  {item.store.email && ` · ${item.store.email}`}
                </p>
                <p className="mt-1 text-[12px] text-graphite-500">
                  {item.vehicleCount} veículos · {item.memberCount} usuários · {item.leadCount} leads · desde{" "}
                  {formatDate(item.store.createdAt)}
                </p>
              </div>

              <Button variant="outline" size="sm" onClick={() => setSelected(item)}>
                Gerenciar
              </Button>
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <Modal open onClose={() => setSelected(null)} title={selected.store.name} size="md">
          <div className="flex flex-col gap-5">
            <div className="surface-raised rounded-xl p-4 text-[13.5px] text-mute">
              <p>
                Link:{" "}
                <Link href={`/loja/${selected.store.slug}`} target="_blank" className="accent-text">
                  /loja/{selected.store.slug}
                </Link>
              </p>
              <p className="mt-1">
                {selected.vehicleCount} veículos · {selected.memberCount} usuários · {selected.leadCount} leads
              </p>
              {selected.store.document && (
                <p className="mt-1">
                  {selected.store.documentType.toUpperCase()}: {selected.store.document}
                </p>
              )}
            </div>

            <div>
              <p className="mb-2 text-[12px] font-semibold tracking-wide text-mute">STATUS DA LOJA</p>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(STATUS_LABELS) as StoreStatus[]).map((value) => (
                  <button
                    key={value}
                    onClick={() => changeStatus(selected, value)}
                    className={cn(
                      "h-10 rounded-xl border px-4 text-[13px] transition-colors",
                      selected.store.status === value
                        ? "accent-border accent-soft accent-text"
                        : "border-white/12 text-mute hover:border-white/30 hover:text-cream",
                    )}
                  >
                    {STATUS_LABELS[value]}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[12px] text-graphite-500">
                Bloquear ou desativar tira o catálogo do ar imediatamente, sem apagar nenhum dado.
              </p>
            </div>

            {plans.length > 0 && (
              <Select
                label="Plano"
                value={subscriptions.find((s) => s.storeId === selected.store.id)?.planId ?? ""}
                onChange={(event) => changePlan(selected.store.id, event.target.value)}
              >
                <option value="">Sem plano</option>
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name}
                  </option>
                ))}
              </Select>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}
