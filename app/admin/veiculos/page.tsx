"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useAdminStore } from "@/lib/admin-store-context";
import { useToast } from "@/lib/toast-context";
import { cn, formatMileage, formatVehiclePrice, formatYearPair } from "@/lib/utils";
import { STATUS_LABELS } from "@/lib/vehicle-options";
import { vehicleTitle, type VehicleStatus } from "@/types/vehicle";
import { PageHeader } from "@/components/admin/admin-ui";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { ConfirmDialog, EmptyState } from "@/components/ui/feedback";
import { CarIcon, EditIcon, EyeIcon, PlusIcon, SearchIcon, TrashIcon } from "@/components/icons";

const STATUS_TONES: Record<VehicleStatus, "success" | "warning" | "info" | "neutral"> = {
  disponivel: "success",
  reservado: "warning",
  vendido: "info",
  arquivado: "neutral",
};

export default function AdminVehiclesPage() {
  const { store, vehicles, deleteVehicle, updateVehicle, permissions, role } = useAdminStore();
  const toast = useToast();

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<VehicleStatus | "">("");
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return vehicles.filter((vehicle) => {
      if (status && vehicle.status !== status) return false;
      if (!term) return true;
      return [vehicle.brand, vehicle.model, vehicle.version, vehicle.internalCode]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [vehicles, query, status]);

  async function handleDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteVehicle(pendingDelete);
      toast.success("Veículo excluído.");
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível excluir. Verifique suas permissões.");
    } finally {
      setDeleting(false);
      setPendingDelete(null);
    }
  }

  async function handleArchive(id: string, current: VehicleStatus) {
    const next: VehicleStatus = current === "arquivado" ? "disponivel" : "arquivado";
    try {
      await updateVehicle(id, { status: next, published: next !== "arquivado" });
      toast.success(next === "arquivado" ? "Veículo arquivado." : "Veículo reativado.");
    } catch {
      toast.error("Não foi possível alterar o status.");
    }
  }

  return (
    <>
      <PageHeader
        title="Veículos"
        description="Todo o estoque da loja. Arquivar preserva o histórico; excluir remove de vez."
        action={
          permissions.vehicles_create ? (
            <ButtonLink href="/admin/veiculos/novo">
              <PlusIcon className="h-4 w-4" />
              Adicionar veículo
            </ButtonLink>
          ) : null
        }
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite-500" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por marca, modelo ou código"
            aria-label="Buscar veículos"
            className="h-11 w-full rounded-xl border border-white/12 bg-graphite-900 pl-10 pr-3.5 text-sm text-cream placeholder:text-graphite-500 focus:border-[var(--store-accent)] focus:outline-none"
          />
        </div>

        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {([["", "Todos"], ...Object.entries(STATUS_LABELS)] as [VehicleStatus | "", string][]).map(
            ([value, label]) => (
              <button
                key={value || "todos"}
                type="button"
                onClick={() => setStatus(value)}
                className={cn(
                  "h-11 shrink-0 rounded-xl border px-4 text-[13px] transition-colors",
                  status === value
                    ? "accent-border accent-soft accent-text"
                    : "border-white/12 text-mute hover:border-white/30 hover:text-cream",
                )}
              >
                {label}
              </button>
            ),
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<CarIcon className="h-12 w-12" />}
          title={vehicles.length === 0 ? "Nenhum veículo cadastrado" : "Nada encontrado"}
          description={
            vehicles.length === 0
              ? "Cadastre o primeiro veículo para o catálogo sair do zero."
              : "Ajuste a busca ou o filtro de status."
          }
          action={
            vehicles.length === 0 && permissions.vehicles_create ? (
              <ButtonLink href="/admin/veiculos/novo">
                <PlusIcon className="h-4 w-4" />
                Adicionar veículo
              </ButtonLink>
            ) : null
          }
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {filtered.map((vehicle) => (
            <li
              key={vehicle.id}
              className="surface flex flex-col gap-4 rounded-2xl p-3 sm:flex-row sm:items-center sm:p-4"
            >
              <div className="relative h-36 w-full shrink-0 overflow-hidden rounded-xl bg-graphite-900 sm:h-20 sm:w-28">
                {vehicle.coverUrl ? (
                  <Image src={vehicle.coverUrl} alt="" fill sizes="160px" className="object-cover" />
                ) : (
                  <span className="flex h-full items-center justify-center text-graphite-600">
                    <CarIcon className="h-7 w-7" />
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate text-[15px] font-semibold text-cream">{vehicleTitle(vehicle)}</h3>
                  <Badge tone={STATUS_TONES[vehicle.status]}>{STATUS_LABELS[vehicle.status]}</Badge>
                  {vehicle.featured && <Badge tone="accent">Destaque</Badge>}
                  {!vehicle.published && <Badge tone="neutral">Não publicado</Badge>}
                </div>
                <p className="mt-0.5 truncate text-[13px] text-mute">
                  {vehicle.version || "—"} · {formatYearPair(vehicle.yearManufacture, vehicle.yearModel)} ·{" "}
                  {formatMileage(vehicle.mileage)}
                </p>
                <p className="mt-1 flex flex-wrap items-center gap-3 text-[13px]">
                  <span className="accent-text font-semibold">
                    {formatVehiclePrice(vehicle.pricePromo ?? vehicle.price)}
                  </span>
                  <span className="flex items-center gap-1 text-graphite-500">
                    <EyeIcon className="h-3.5 w-3.5" />
                    {vehicle.views}
                  </span>
                  {vehicle.internalCode && (
                    <span className="text-graphite-500">cód. {vehicle.internalCode}</span>
                  )}
                </p>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                {store && vehicle.published && (
                  <ButtonLink
                    href={`/loja/${store.slug}/veiculos/${vehicle.slug}`}
                    target="_blank"
                    variant="ghost"
                    size="sm"
                  >
                    <EyeIcon className="h-4 w-4" />
                    Ver
                  </ButtonLink>
                )}
                <ButtonLink href={`/admin/veiculos/${vehicle.id}`} variant="outline" size="sm">
                  <EditIcon className="h-4 w-4" />
                  Editar
                </ButtonLink>
                {permissions.vehicles_publish && (
                  <Button variant="ghost" size="sm" onClick={() => handleArchive(vehicle.id, vehicle.status)}>
                    {vehicle.status === "arquivado" ? "Reativar" : "Arquivar"}
                  </Button>
                )}
                {role !== "collaborator" && (
                  <Button variant="danger" size="sm" onClick={() => setPendingDelete(vehicle.id)}>
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        title="Excluir veículo?"
        description="O anúncio e as fotos serão removidos definitivamente. Se a ideia é apenas tirar do ar, prefira arquivar."
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}
