"use client";

import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/lib/toast-context";
import { fetchAllStores, fetchAuditLogs } from "@/lib/supabase/queries";
import { formatDateTime } from "@/lib/utils";
import type { AuditLog, Store } from "@/types/store";
import { PageHeader, Panel } from "@/components/admin/admin-ui";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/field";
import { EmptyState, Skeleton } from "@/components/ui/feedback";

const ACTION_LABELS: Record<string, string> = {
  "store.update": "Dados da loja alterados",
  "store.status.ativa": "Loja ativada",
  "store.status.bloqueada": "Loja bloqueada",
  "store.status.desativada": "Loja desativada",
  "store.status.pendente": "Loja marcada como pendente",
  "vehicle.create": "Veículo cadastrado",
  "vehicle.update": "Veículo atualizado",
  "vehicle.delete": "Veículo excluído",
  "member.join": "Colaborador entrou na loja",
};

export default function AuditPage() {
  const toast = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [storeId, setStoreId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchAuditLogs(300), fetchAllStores().catch(() => [])])
      .then(([logList, storeList]) => {
        setLogs(logList);
        setStores(storeList);
      })
      .catch(() => toast.error("Não foi possível carregar os registros."))
      .finally(() => setLoading(false));
  }, [toast]);

  const storeName = useMemo(() => {
    const map = new Map(stores.map((store) => [store.id, store.name]));
    return (id?: string) => (id ? (map.get(id) ?? "Loja removida") : "Plataforma");
  }, [stores]);

  const filtered = storeId ? logs.filter((log) => log.storeId === storeId) : logs;

  return (
    <>
      <PageHeader
        title="Auditoria"
        description="Registro das ações relevantes feitas nas lojas e na plataforma."
        action={
          <Select
            aria-label="Filtrar por loja"
            value={storeId}
            onChange={(event) => setStoreId(event.target.value)}
            className="w-56"
          >
            <option value="">Todas as lojas</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </Select>
        }
      />

      <Panel>
        {loading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-12 rounded-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="Nenhum registro"
            description="As ações aparecem aqui conforme as lojas usam a plataforma."
          />
        ) : (
          <ul className="flex flex-col">
            {filtered.map((log) => (
              <li
                key={log.id}
                className="flex flex-wrap items-center justify-between gap-3 border-b border-white/6 py-3 last:border-0"
              >
                <div className="min-w-0">
                  <p className="text-[14px] text-cream">{ACTION_LABELS[log.action] ?? log.action}</p>
                  <p className="text-[12px] text-graphite-500">
                    {storeName(log.storeId)}
                    {log.entity && ` · ${log.entity}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone="neutral">{log.action.split(".")[0]}</Badge>
                  <span className="text-[12px] text-graphite-500">{formatDateTime(log.createdAt)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}
