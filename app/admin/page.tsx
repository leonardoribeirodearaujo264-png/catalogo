"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAdminStore } from "@/lib/admin-store-context";
import { formatDateTime, formatVehiclePrice } from "@/lib/utils";
import { LEAD_STATUS_LABELS } from "@/types/lead";
import { STATUS_LABELS } from "@/lib/vehicle-options";
import { vehicleTitle } from "@/types/vehicle";
import { PageHeader, Panel, QuickAction, StatCard } from "@/components/admin/admin-ui";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/feedback";
import {
  CarIcon,
  ChatIcon,
  EyeIcon,
  LinkIcon,
  PlusIcon,
  SettingsIcon,
  UsersIcon,
  WhatsAppIcon,
} from "@/components/icons";

export default function AdminDashboardPage() {
  const { store, vehicles, leads, metrics, permissions, role } = useAdminStore();

  const counts = useMemo(() => {
    return {
      total: vehicles.length,
      available: vehicles.filter((v) => v.status === "disponivel").length,
      reserved: vehicles.filter((v) => v.status === "reservado").length,
      sold: vehicles.filter((v) => v.status === "vendido").length,
      newLeads: leads.filter((l) => l.status === "novo").length,
      negotiating: leads.filter((l) => l.status === "negociacao").length,
    };
  }, [vehicles, leads]);

  const mostViewed = useMemo(
    () => [...vehicles].sort((a, b) => b.views - a.views).filter((v) => v.views > 0).slice(0, 5),
    [vehicles],
  );

  const recentLeads = leads.slice(0, 5);

  return (
    <>
      <PageHeader
        title={`Olá, ${store?.name ?? "bem-vindo"}`}
        description="Resumo do seu estoque, dos contatos recebidos e do desempenho do catálogo."
      />

      {store && !store.isPublished && (
        <div className="accent-border accent-soft mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-5 py-4">
          <p className="text-sm text-cream">
            Seu catálogo ainda está <span className="accent-text font-semibold">despublicado</span> — só você
            consegue ver.
          </p>
          <Link href="/admin/link-publico" className="accent-text text-sm font-semibold underline underline-offset-4">
            Publicar agora
          </Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total de veículos" value={counts.total} icon={<CarIcon className="h-4 w-4" />} />
        <StatCard label="Disponíveis" value={counts.available} tone="success" />
        <StatCard label="Reservados" value={counts.reserved} tone="warning" />
        <StatCard label="Vendidos" value={counts.sold} />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Novos leads"
          value={counts.newLeads}
          tone="accent"
          icon={<ChatIcon className="h-4 w-4" />}
          hint={`${counts.negotiating} em negociação`}
        />
        <StatCard
          label="Visualizações do catálogo"
          value={metrics.catalogViews}
          icon={<EyeIcon className="h-4 w-4" />}
          hint="Últimos 30 dias"
        />
        <StatCard label="Veículos visualizados" value={metrics.vehicleViews} hint="Últimos 30 dias" />
        <StatCard
          label="Cliques no WhatsApp"
          value={metrics.whatsappClicks}
          icon={<WhatsAppIcon className="h-4 w-4" />}
          hint="Últimos 30 dias"
        />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <QuickAction
          href="/admin/veiculos/novo"
          label="Adicionar veículo"
          description="Cadastrar um carro no estoque"
          icon={<PlusIcon className="h-5 w-5" />}
        />
        {store && (
          <QuickAction
            href={`/loja/${store.slug}`}
            label="Ver catálogo público"
            description={`/loja/${store.slug}`}
            icon={<LinkIcon className="h-5 w-5" />}
          />
        )}
        {permissions.leads && (
          <QuickAction
            href="/admin/leads"
            label="Gerenciar leads"
            description={`${counts.newLeads} aguardando atendimento`}
            icon={<ChatIcon className="h-5 w-5" />}
          />
        )}
        {role !== "collaborator" && (
          <>
            <QuickAction
              href="/admin/loja"
              label="Editar dados da loja"
              description="Marca, cores, contato e textos"
              icon={<SettingsIcon className="h-5 w-5" />}
            />
            <QuickAction
              href="/admin/equipe"
              label="Convidar colaborador"
              description="Definir permissões da equipe"
              icon={<UsersIcon className="h-5 w-5" />}
            />
          </>
        )}
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Panel title="Veículos mais visualizados">
          {mostViewed.length === 0 ? (
            <p className="py-6 text-center text-[13.5px] text-mute">
              Ainda não há visualizações registradas.
            </p>
          ) : (
            <ul className="flex flex-col">
              {mostViewed.map((vehicle) => (
                <li
                  key={vehicle.id}
                  className="flex items-center justify-between gap-4 border-b border-white/6 py-3 last:border-0"
                >
                  <Link
                    href={`/admin/veiculos/${vehicle.id}`}
                    className="min-w-0 flex-1 truncate text-sm text-cream hover:accent-text"
                  >
                    {vehicleTitle(vehicle)}
                    <span className="ml-2 text-[12px] text-graphite-500">
                      {formatVehiclePrice(vehicle.price)}
                    </span>
                  </Link>
                  <span className="flex shrink-0 items-center gap-1.5 text-[13px] text-mute">
                    <EyeIcon className="h-4 w-4" />
                    {vehicle.views}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Atividades recentes"
          action={
            permissions.leads ? (
              <Link href="/admin/leads" className="accent-text text-[13px] font-semibold hover:underline">
                Ver todos
              </Link>
            ) : null
          }
        >
          {!permissions.leads ? (
            <p className="py-6 text-center text-[13.5px] text-mute">
              Você não tem permissão para ver leads nesta loja.
            </p>
          ) : recentLeads.length === 0 ? (
            <EmptyState title="Nenhum lead ainda" description="Os contatos do catálogo aparecem aqui." />
          ) : (
            <ul className="flex flex-col">
              {recentLeads.map((lead) => (
                <li key={lead.id} className="flex items-start justify-between gap-3 border-b border-white/6 py-3 last:border-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-cream">{lead.name || "Sem nome"}</p>
                    <p className="truncate text-[12px] text-mute">
                      {lead.vehicleLabel || "Contato geral"} · {formatDateTime(lead.createdAt)}
                    </p>
                  </div>
                  <Badge tone={lead.status === "novo" ? "accent" : "neutral"}>
                    {LEAD_STATUS_LABELS[lead.status]}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="mt-4">
        <Panel title="Estoque por status">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(STATUS_LABELS) as (keyof typeof STATUS_LABELS)[]).map((status) => {
              const total = vehicles.filter((v) => v.status === status).length;
              return (
                <Link
                  key={status}
                  href={`/admin/veiculos?status=${status}`}
                  className="surface-raised rounded-xl px-4 py-2.5 text-sm text-mute transition-colors hover:accent-border hover:text-cream"
                >
                  {STATUS_LABELS[status]}
                  <span className="ml-2 font-semibold text-cream">{total}</span>
                </Link>
              );
            })}
          </div>
        </Panel>
      </div>
    </>
  );
}
