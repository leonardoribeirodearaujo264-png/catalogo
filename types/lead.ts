// Leads: toda solicitação vinda da vitrine (formulário, proposta,
// simulação de financiamento ou clique no WhatsApp) vira um lead da loja.

export type LeadStatus =
  | "novo"
  | "em_atendimento"
  | "visita_agendada"
  | "negociacao"
  | "venda_concluida"
  | "perdido";

export type LeadOrigin =
  | "catalogo"
  | "whatsapp"
  | "formulario"
  | "proposta"
  | "financiamento"
  | "contato"
  | "manual";

export const LEAD_STATUS_ORDER: LeadStatus[] = [
  "novo",
  "em_atendimento",
  "visita_agendada",
  "negociacao",
  "venda_concluida",
  "perdido",
];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  novo: "Novo",
  em_atendimento: "Em atendimento",
  visita_agendada: "Visita agendada",
  negociacao: "Negociação",
  venda_concluida: "Venda concluída",
  perdido: "Perdido",
};

export const LEAD_ORIGIN_LABELS: Record<LeadOrigin, string> = {
  catalogo: "Catálogo",
  whatsapp: "WhatsApp",
  formulario: "Formulário",
  proposta: "Proposta",
  financiamento: "Financiamento",
  contato: "Página de contato",
  manual: "Cadastro manual",
};

export interface Lead {
  id: string;
  storeId: string;
  vehicleId?: string;
  /** Nome do veículo congelado no momento do contato. */
  vehicleLabel: string;
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  message: string;
  origin: LeadOrigin;
  offerAmount: number | null;
  status: LeadStatus;
  assignedTo?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadHistoryEntry {
  id: string;
  leadId: string;
  storeId: string;
  userId?: string;
  action: string;
  fromStatus?: string;
  toStatus?: string;
  note: string;
  createdAt: string;
}
