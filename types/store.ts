// Tipos da loja (tenant). Toda operação da plataforma acontece dentro de
// uma loja: veículos, leads, equipe e financeiro sempre carregam storeId.

export type StoreStatus = "pendente" | "ativa" | "bloqueada" | "desativada";
export type DocumentType = "cnpj" | "cpf";

export interface StoreAddress {
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zip?: string;
  mapUrl?: string;
}

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  youtube?: string;
  site?: string;
}

/** Um dia (ou faixa de dias) do horário de atendimento. */
export interface BusinessHour {
  label: string;
  hours: string;
}

/** Selo de confiança exibido na vitrine. `icon` é uma chave de components/icons. */
export interface TrustBadge {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export type StoreSection = "hero" | "busca" | "confianca" | "destaques" | "sobre" | "contato";

export interface Store {
  id: string;
  ownerId: string;
  slug: string;
  name: string;
  slogan: string;
  description: string;
  document: string;
  documentType: DocumentType;
  email: string;
  phone: string;
  whatsappNumber: string;
  whatsappDefaultMessage: string;
  logoUrl?: string;
  coverUrl?: string;
  faviconUrl?: string;
  aboutImageUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  address: StoreAddress;
  social: SocialLinks;
  businessHours: BusinessHour[];
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl?: string;
  trustBadges: TrustBadge[];
  sectionOrder: StoreSection[];
  /** null = a loja ainda não informou. A vitrine esconde o indicador. */
  statVehiclesSold: number | null;
  statSatisfaction: number | null;
  statYearsMarket: number | null;
  isPublished: boolean;
  status: StoreStatus;
  onboardingStep: number;
  blockedReason?: string;
  createdAt: string;
}

// ── Equipe ────────────────────────────────────────────────────

export type MemberRole = "owner" | "admin" | "collaborator";
export type MemberStatus = "active" | "suspended";

/** Espelha as chaves aceitas por cs_can() no banco. */
export interface MemberPermissions {
  vehicles_create: boolean;
  vehicles_edit: boolean;
  vehicles_publish: boolean;
  leads: boolean;
  reports: boolean;
  finance: boolean;
}

export const DEFAULT_PERMISSIONS: MemberPermissions = {
  vehicles_create: true,
  vehicles_edit: true,
  vehicles_publish: false,
  leads: true,
  reports: false,
  finance: false,
};

export const PERMISSION_LABELS: Record<keyof MemberPermissions, string> = {
  vehicles_create: "Cadastrar veículos",
  vehicles_edit: "Editar veículos",
  vehicles_publish: "Publicar e arquivar anúncios",
  leads: "Atender leads",
  reports: "Visualizar relatórios",
  finance: "Acessar o financeiro",
};

export interface StoreMember {
  id: string;
  storeId: string;
  userId: string;
  role: MemberRole;
  permissions: MemberPermissions;
  status: MemberStatus;
  displayName: string;
  createdAt: string;
}

export const ROLE_LABELS: Record<MemberRole, string> = {
  owner: "Proprietário",
  admin: "Administrador",
  collaborator: "Colaborador",
};

/** Permissões efetivas do usuário logado na loja atual. */
export function effectivePermissions(role: MemberRole, permissions: MemberPermissions): MemberPermissions {
  if (role === "owner" || role === "admin") {
    return {
      vehicles_create: true,
      vehicles_edit: true,
      vehicles_publish: true,
      leads: true,
      reports: true,
      finance: true,
    };
  }
  return permissions;
}

// ── Planos e assinaturas ─────────────────────────────────────

export interface Plan {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceMonthly: number;
  /** null = ilimitado. */
  vehicleLimit: number | null;
  memberLimit: number | null;
  features: string[];
  active: boolean;
  sortOrder: number;
}

export type SubscriptionStatus = "trial" | "active" | "past_due" | "canceled";

export interface Subscription {
  id: string;
  storeId: string;
  planId?: string;
  status: SubscriptionStatus;
  startedAt: string;
  currentPeriodEnd?: string;
}

export interface AuditLog {
  id: string;
  storeId?: string;
  userId?: string;
  action: string;
  entity: string;
  entityId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}
