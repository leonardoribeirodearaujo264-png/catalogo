"use client";

import { useEffect, useMemo, useState } from "react";
import { useAdminStore } from "@/lib/admin-store-context";
import { useToast } from "@/lib/toast-context";
import { fetchLeadHistory, insertLeadNote } from "@/lib/supabase/queries";
import { cn, formatDateTime, formatPhone, formatVehiclePrice } from "@/lib/utils";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import {
  LEAD_ORIGIN_LABELS,
  LEAD_STATUS_LABELS,
  LEAD_STATUS_ORDER,
  type Lead,
  type LeadHistoryEntry,
  type LeadStatus,
} from "@/types/lead";
import { PageHeader } from "@/components/admin/admin-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, TextArea } from "@/components/ui/field";
import { EmptyState, Modal } from "@/components/ui/feedback";
import { ChatIcon, GridIcon, ListIcon, MailIcon, PhoneIcon, SearchIcon, WhatsAppIcon } from "@/components/icons";

const STATUS_TONES: Record<LeadStatus, "accent" | "info" | "warning" | "success" | "danger" | "neutral"> = {
  novo: "accent",
  em_atendimento: "info",
  visita_agendada: "warning",
  negociacao: "warning",
  venda_concluida: "success",
  perdido: "danger",
};

export default function AdminLeadsPage() {
  const { leads, updateLead, permissions } = useAdminStore();
  const [view, setView] = useState<"lista" | "funil">("lista");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<LeadStatus | "">("");
  const [selected, setSelected] = useState<Lead | null>(null);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return leads.filter((lead) => {
      if (status && lead.status !== status) return false;
      if (!term) return true;
      return [lead.name, lead.phone, lead.email, lead.vehicleLabel].join(" ").toLowerCase().includes(term);
    });
  }, [leads, query, status]);

  if (!permissions.leads) {
    return (
      <EmptyState
        title="Sem permissão"
        description="Seu perfil não tem acesso aos leads desta loja. Fale com o administrador."
      />
    );
  }

  return (
    <>
      <PageHeader
        title="Leads"
        description="Todo contato feito pelo catálogo chega aqui. Atualize o status conforme o atendimento avança."
        action={
          <div className="flex gap-1 rounded-xl border border-white/12 p-1">
            <button
              onClick={() => setView("lista")}
              aria-pressed={view === "lista"}
              className={cn(
                "flex h-9 items-center gap-2 rounded-lg px-3 text-[13px]",
                view === "lista" ? "accent-soft accent-text" : "text-mute hover:text-cream",
              )}
            >
              <ListIcon className="h-4 w-4" />
              Lista
            </button>
            <button
              onClick={() => setView("funil")}
              aria-pressed={view === "funil"}
              className={cn(
                "flex h-9 items-center gap-2 rounded-lg px-3 text-[13px]",
                view === "funil" ? "accent-soft accent-text" : "text-mute hover:text-cream",
              )}
            >
              <GridIcon className="h-4 w-4" />
              Funil
            </button>
          </div>
        }
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite-500" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nome, telefone ou veículo"
            aria-label="Buscar leads"
            className="h-11 w-full rounded-xl border border-white/12 bg-graphite-900 pl-10 pr-3.5 text-sm text-cream placeholder:text-graphite-500 focus:border-[var(--store-accent)] focus:outline-none"
          />
        </div>
        <Select
          aria-label="Filtrar por status"
          value={status}
          onChange={(event) => setStatus(event.target.value as LeadStatus | "")}
          className="sm:w-56"
        >
          <option value="">Todos os status</option>
          {LEAD_STATUS_ORDER.map((value) => (
            <option key={value} value={value}>
              {LEAD_STATUS_LABELS[value]}
            </option>
          ))}
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<ChatIcon className="h-12 w-12" />}
          title={leads.length === 0 ? "Nenhum lead ainda" : "Nada encontrado"}
          description={
            leads.length === 0
              ? "Quando alguém enviar contato pelo catálogo, o lead aparece aqui automaticamente."
              : "Tente outro termo ou limpe o filtro de status."
          }
        />
      ) : view === "lista" ? (
        <ul className="flex flex-col gap-3">
          {filtered.map((lead) => (
            <li key={lead.id}>
              <button
                onClick={() => setSelected(lead)}
                className="surface flex w-full flex-col gap-3 rounded-2xl p-4 text-left transition-colors hover:border-[var(--store-accent-border)] sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[15px] font-semibold text-cream">{lead.name || "Sem nome"}</span>
                    <Badge tone={STATUS_TONES[lead.status]}>{LEAD_STATUS_LABELS[lead.status]}</Badge>
                    <Badge tone="neutral">{LEAD_ORIGIN_LABELS[lead.origin]}</Badge>
                  </div>
                  <p className="mt-1 truncate text-[13px] text-mute">
                    {lead.vehicleLabel || "Contato geral"}
                    {lead.offerAmount ? ` · proposta de ${formatVehiclePrice(lead.offerAmount)}` : ""}
                  </p>
                  <p className="mt-0.5 text-[12px] text-graphite-500">{formatDateTime(lead.createdAt)}</p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2 text-[13px] text-mute">
                  {lead.phone && (
                    <span className="flex items-center gap-1.5">
                      <PhoneIcon className="h-4 w-4" />
                      {formatPhone(lead.phone)}
                    </span>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="no-scrollbar grid grid-flow-col gap-4 overflow-x-auto pb-2 [grid-auto-columns:minmax(260px,1fr)]">
          {LEAD_STATUS_ORDER.map((column) => {
            const items = filtered.filter((lead) => lead.status === column);
            return (
              <section key={column} className="surface rounded-2xl p-3">
                <header className="mb-3 flex items-center justify-between px-1">
                  <h2 className="text-[13px] font-semibold text-cream">{LEAD_STATUS_LABELS[column]}</h2>
                  <span className="text-[12px] text-graphite-500">{items.length}</span>
                </header>
                <div className="flex flex-col gap-2">
                  {items.map((lead) => (
                    <button
                      key={lead.id}
                      onClick={() => setSelected(lead)}
                      className="surface-raised rounded-xl p-3 text-left transition-colors hover:border-[var(--store-accent-border)]"
                    >
                      <p className="truncate text-[13.5px] text-cream">{lead.name || "Sem nome"}</p>
                      <p className="mt-0.5 truncate text-[12px] text-mute">
                        {lead.vehicleLabel || "Contato geral"}
                      </p>
                    </button>
                  ))}
                  {items.length === 0 && (
                    <p className="px-1 py-4 text-center text-[12px] text-graphite-600">Vazio</p>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {selected && (
        <LeadDetail
          lead={selected}
          onClose={() => setSelected(null)}
          onUpdate={async (patch) => {
            await updateLead(selected.id, patch);
            setSelected((prev) => (prev ? { ...prev, ...patch } : prev));
          }}
        />
      )}
    </>
  );
}

function LeadDetail({
  lead,
  onClose,
  onUpdate,
}: {
  lead: Lead;
  onClose: () => void;
  onUpdate: (patch: Partial<Lead>) => Promise<void>;
}) {
  const toast = useToast();
  const [history, setHistory] = useState<LeadHistoryEntry[]>([]);
  const [note, setNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [notes, setNotes] = useState(lead.notes);

  useEffect(() => {
    fetchLeadHistory(lead.id)
      .then(setHistory)
      .catch(() => setHistory([]));
  }, [lead.id]);

  async function handleStatus(status: LeadStatus) {
    try {
      await onUpdate({ status });
      toast.success("Status atualizado.");
      setHistory(await fetchLeadHistory(lead.id).catch(() => history));
    } catch {
      toast.error("Não foi possível atualizar o status.");
    }
  }

  async function handleAddNote() {
    if (!note.trim()) return;
    setSavingNote(true);
    try {
      await insertLeadNote(lead.id, note.trim());
      setNote("");
      setHistory(await fetchLeadHistory(lead.id));
      toast.success("Observação registrada.");
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível salvar a observação.");
    } finally {
      setSavingNote(false);
    }
  }

  return (
    <Modal open onClose={onClose} title={lead.name || "Lead"} size="lg">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div className="surface-raised rounded-xl p-4">
            <h3 className="mb-3 text-[12px] font-semibold tracking-wide text-mute">CONTATO</h3>
            <div className="flex flex-col gap-2.5 text-[14px] text-cream">
              {lead.phone && (
                <p className="flex items-center gap-2.5">
                  <PhoneIcon className="h-4 w-4 text-mute" />
                  {formatPhone(lead.phone)}
                </p>
              )}
              {lead.email && (
                <p className="flex items-center gap-2.5 break-all">
                  <MailIcon className="h-4 w-4 shrink-0 text-mute" />
                  {lead.email}
                </p>
              )}
              <p className="text-[12px] text-graphite-500">
                Recebido em {formatDateTime(lead.createdAt)} · origem {LEAD_ORIGIN_LABELS[lead.origin]}
              </p>
            </div>

            {(lead.whatsapp || lead.phone) && (
              <a
                href={buildWhatsAppUrl(
                  lead.whatsapp || lead.phone,
                  `Olá ${lead.name}! Aqui é da loja, sobre o ${lead.vehicleLabel || "veículo"} que você consultou.`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] text-sm font-semibold text-white"
              >
                <WhatsAppIcon className="h-4 w-4" />
                Responder no WhatsApp
              </a>
            )}
          </div>

          {(lead.vehicleLabel || lead.offerAmount) && (
            <div className="surface-raised rounded-xl p-4">
              <h3 className="mb-2 text-[12px] font-semibold tracking-wide text-mute">INTERESSE</h3>
              <p className="text-[14px] text-cream">{lead.vehicleLabel || "Contato geral"}</p>
              {lead.offerAmount && (
                <p className="accent-text mt-1 text-[14px] font-semibold">
                  Proposta: {formatVehiclePrice(lead.offerAmount)}
                </p>
              )}
            </div>
          )}

          {lead.message && (
            <div className="surface-raised rounded-xl p-4">
              <h3 className="mb-2 text-[12px] font-semibold tracking-wide text-mute">MENSAGEM</h3>
              <p className="whitespace-pre-line text-[14px] leading-relaxed text-mute">{lead.message}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <Select
            label="Status do atendimento"
            value={lead.status}
            onChange={(event) => handleStatus(event.target.value as LeadStatus)}
          >
            {LEAD_STATUS_ORDER.map((value) => (
              <option key={value} value={value}>
                {LEAD_STATUS_LABELS[value]}
              </option>
            ))}
          </Select>

          <TextArea
            label="Observações internas"
            value={notes}
            rows={3}
            onChange={(event) => setNotes(event.target.value)}
            onBlur={() => notes !== lead.notes && onUpdate({ notes })}
            hint="Salvo automaticamente ao sair do campo."
          />

          <div>
            <TextArea
              label="Adicionar ao histórico"
              value={note}
              rows={2}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Cliente pediu para retornar na quinta."
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              loading={savingNote}
              onClick={handleAddNote}
            >
              Registrar
            </Button>
          </div>

          <div>
            <h3 className="mb-3 text-[12px] font-semibold tracking-wide text-mute">HISTÓRICO</h3>
            {history.length === 0 ? (
              <p className="text-[13px] text-graphite-500">Nenhum registro ainda.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {history.map((entry) => (
                  <li key={entry.id} className="border-l-2 border-white/10 pl-3">
                    <p className="text-[13px] text-cream">
                      {entry.action === "status"
                        ? `Status: ${LEAD_STATUS_LABELS[entry.fromStatus as LeadStatus] ?? entry.fromStatus} → ${
                            LEAD_STATUS_LABELS[entry.toStatus as LeadStatus] ?? entry.toStatus
                          }`
                        : entry.note}
                    </p>
                    <p className="text-[11.5px] text-graphite-500">{formatDateTime(entry.createdAt)}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
