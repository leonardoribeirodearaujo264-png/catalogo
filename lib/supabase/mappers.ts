import { DEFAULT_PERMISSIONS, type AuditLog, type Plan, type Store, type StoreMember, type Subscription } from "@/types/store";
import type { Lead, LeadHistoryEntry } from "@/types/lead";
import type { Vehicle, VehicleImage } from "@/types/vehicle";
import type { FinancialTransaction } from "@/types/financial";
import { DEFAULT_TRUST_BADGES } from "@/lib/vehicle-options";
import type {
  AuditLogRow,
  FinancialTransactionRow,
  LeadHistoryRow,
  LeadRow,
  PlanRow,
  StoreMemberRow,
  StoreRow,
  SubscriptionRow,
  VehicleImageRow,
  VehicleRow,
} from "./types";

// ── Loja ──────────────────────────────────────────────────────

export function rowToStore(row: StoreRow): Store {
  return {
    id: row.id,
    ownerId: row.owner_id,
    slug: row.slug,
    name: row.name,
    slogan: row.slogan ?? "",
    description: row.description ?? "",
    document: row.document ?? "",
    documentType: row.document_type ?? "cnpj",
    email: row.email ?? "",
    phone: row.phone ?? "",
    whatsappNumber: row.whatsapp_number ?? "",
    whatsappDefaultMessage: row.whatsapp_default_message ?? "",
    logoUrl: row.logo_url ?? undefined,
    coverUrl: row.cover_url ?? undefined,
    faviconUrl: row.favicon_url ?? undefined,
    aboutImageUrl: row.about_image_url ?? undefined,
    primaryColor: row.primary_color ?? "#0B0B0C",
    secondaryColor: row.secondary_color ?? "#C9A227",
    address: row.address ?? {},
    social: row.social ?? {},
    businessHours: row.business_hours ?? [],
    heroEyebrow: row.hero_eyebrow ?? "",
    heroTitle: row.hero_title ?? "",
    heroSubtitle: row.hero_subtitle ?? "",
    heroImageUrl: row.hero_image_url ?? undefined,
    trustBadges: row.trust_badges?.length ? row.trust_badges : DEFAULT_TRUST_BADGES,
    sectionOrder: row.section_order ?? ["hero", "busca", "confianca", "destaques", "sobre", "contato"],
    statVehiclesSold: row.stat_vehicles_sold,
    statSatisfaction: row.stat_satisfaction,
    statYearsMarket: row.stat_years_market,
    isPublished: row.is_published,
    status: row.status ?? "ativa",
    onboardingStep: row.onboarding_step ?? 0,
    blockedReason: row.blocked_reason ?? undefined,
    createdAt: row.created_at,
  };
}

export function storeToRow(store: Partial<Store>): Partial<StoreRow> {
  const row: Partial<StoreRow> = {};
  if (store.slug !== undefined) row.slug = store.slug;
  if (store.name !== undefined) row.name = store.name;
  if (store.slogan !== undefined) row.slogan = store.slogan;
  if (store.description !== undefined) row.description = store.description;
  if (store.document !== undefined) row.document = store.document;
  if (store.documentType !== undefined) row.document_type = store.documentType;
  if (store.email !== undefined) row.email = store.email;
  if (store.phone !== undefined) row.phone = store.phone;
  if (store.whatsappNumber !== undefined) row.whatsapp_number = store.whatsappNumber;
  if (store.whatsappDefaultMessage !== undefined) row.whatsapp_default_message = store.whatsappDefaultMessage;
  if (store.logoUrl !== undefined) row.logo_url = store.logoUrl ?? null;
  if (store.coverUrl !== undefined) row.cover_url = store.coverUrl ?? null;
  if (store.faviconUrl !== undefined) row.favicon_url = store.faviconUrl ?? null;
  if (store.aboutImageUrl !== undefined) row.about_image_url = store.aboutImageUrl ?? null;
  if (store.primaryColor !== undefined) row.primary_color = store.primaryColor;
  if (store.secondaryColor !== undefined) row.secondary_color = store.secondaryColor;
  if (store.address !== undefined) row.address = store.address;
  if (store.social !== undefined) row.social = store.social;
  if (store.businessHours !== undefined) row.business_hours = store.businessHours;
  if (store.heroEyebrow !== undefined) row.hero_eyebrow = store.heroEyebrow;
  if (store.heroTitle !== undefined) row.hero_title = store.heroTitle;
  if (store.heroSubtitle !== undefined) row.hero_subtitle = store.heroSubtitle;
  if (store.heroImageUrl !== undefined) row.hero_image_url = store.heroImageUrl ?? null;
  if (store.trustBadges !== undefined) row.trust_badges = store.trustBadges;
  if (store.sectionOrder !== undefined) row.section_order = store.sectionOrder;
  if (store.statVehiclesSold !== undefined) row.stat_vehicles_sold = store.statVehiclesSold;
  if (store.statSatisfaction !== undefined) row.stat_satisfaction = store.statSatisfaction;
  if (store.statYearsMarket !== undefined) row.stat_years_market = store.statYearsMarket;
  if (store.isPublished !== undefined) row.is_published = store.isPublished;
  if (store.status !== undefined) row.status = store.status;
  if (store.onboardingStep !== undefined) row.onboarding_step = store.onboardingStep;
  if (store.blockedReason !== undefined) row.blocked_reason = store.blockedReason ?? null;
  return row;
}

export function rowToMember(row: StoreMemberRow): StoreMember {
  return {
    id: row.id,
    storeId: row.store_id,
    userId: row.user_id,
    role: row.role,
    permissions: { ...DEFAULT_PERMISSIONS, ...(row.permissions ?? {}) },
    status: row.status,
    displayName: row.display_name ?? "",
    createdAt: row.created_at,
  };
}

// ── Veículo ───────────────────────────────────────────────────

export function rowToVehicleImage(row: VehicleImageRow): VehicleImage {
  return {
    id: row.id,
    storeId: row.store_id,
    vehicleId: row.vehicle_id,
    url: row.url,
    path: row.path ?? undefined,
    position: row.position,
    isCover: row.is_cover,
  };
}

export function rowToVehicle(row: VehicleRow): Vehicle {
  const images = (row.cs_vehicle_images ?? [])
    .map(rowToVehicleImage)
    .sort((a, b) => a.position - b.position);

  return {
    id: row.id,
    storeId: row.store_id,
    slug: row.slug,
    brand: row.brand,
    model: row.model,
    version: row.version ?? "",
    yearManufacture: row.year_manufacture,
    yearModel: row.year_model,
    price: Number(row.price),
    pricePromo: row.price_promo !== null ? Number(row.price_promo) : null,
    pricePrevious: row.price_previous !== null ? Number(row.price_previous) : null,
    mileage: row.mileage ?? 0,
    transmission: row.transmission,
    fuel: row.fuel,
    color: row.color ?? "",
    doors: row.doors,
    bodyType: row.body_type,
    plateEnd: row.plate_end ?? "",
    internalCode: row.internal_code ?? "",
    condition: row.condition ?? "seminovo",
    conservation: row.conservation ?? "",
    acceptsTrade: row.accepts_trade,
    financing: row.financing,
    featured: row.featured,
    status: row.status,
    published: row.published,
    description: row.description ?? "",
    documentation: row.documentation ?? "",
    location: row.location ?? "",
    features: row.features ?? [],
    coverUrl: row.cover_url ?? images.find((i) => i.isCover)?.url ?? images[0]?.url,
    views: row.views ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    images,
  };
}

export function vehicleToRow(vehicle: Partial<Vehicle>): Partial<VehicleRow> {
  const row: Partial<VehicleRow> = {};
  if (vehicle.storeId !== undefined) row.store_id = vehicle.storeId;
  if (vehicle.slug !== undefined) row.slug = vehicle.slug;
  if (vehicle.brand !== undefined) row.brand = vehicle.brand;
  if (vehicle.model !== undefined) row.model = vehicle.model;
  if (vehicle.version !== undefined) row.version = vehicle.version;
  if (vehicle.yearManufacture !== undefined) row.year_manufacture = vehicle.yearManufacture;
  if (vehicle.yearModel !== undefined) row.year_model = vehicle.yearModel;
  if (vehicle.price !== undefined) row.price = vehicle.price;
  if (vehicle.pricePromo !== undefined) row.price_promo = vehicle.pricePromo;
  if (vehicle.pricePrevious !== undefined) row.price_previous = vehicle.pricePrevious;
  if (vehicle.mileage !== undefined) row.mileage = vehicle.mileage;
  if (vehicle.transmission !== undefined) row.transmission = vehicle.transmission;
  if (vehicle.fuel !== undefined) row.fuel = vehicle.fuel;
  if (vehicle.color !== undefined) row.color = vehicle.color;
  if (vehicle.doors !== undefined) row.doors = vehicle.doors;
  if (vehicle.bodyType !== undefined) row.body_type = vehicle.bodyType;
  if (vehicle.plateEnd !== undefined) row.plate_end = vehicle.plateEnd;
  if (vehicle.internalCode !== undefined) row.internal_code = vehicle.internalCode;
  if (vehicle.condition !== undefined) row.condition = vehicle.condition;
  if (vehicle.conservation !== undefined) row.conservation = vehicle.conservation;
  if (vehicle.acceptsTrade !== undefined) row.accepts_trade = vehicle.acceptsTrade;
  if (vehicle.financing !== undefined) row.financing = vehicle.financing;
  if (vehicle.featured !== undefined) row.featured = vehicle.featured;
  if (vehicle.status !== undefined) row.status = vehicle.status;
  if (vehicle.published !== undefined) row.published = vehicle.published;
  if (vehicle.description !== undefined) row.description = vehicle.description;
  if (vehicle.documentation !== undefined) row.documentation = vehicle.documentation;
  if (vehicle.location !== undefined) row.location = vehicle.location;
  if (vehicle.features !== undefined) row.features = vehicle.features;
  if (vehicle.coverUrl !== undefined) row.cover_url = vehicle.coverUrl ?? null;
  return row;
}

// ── Lead ──────────────────────────────────────────────────────

export function rowToLead(row: LeadRow): Lead {
  return {
    id: row.id,
    storeId: row.store_id,
    vehicleId: row.vehicle_id ?? undefined,
    vehicleLabel: row.vehicle_label ?? "",
    name: row.name ?? "",
    phone: row.phone ?? "",
    whatsapp: row.whatsapp ?? "",
    email: row.email ?? "",
    message: row.message ?? "",
    origin: row.origin ?? "catalogo",
    offerAmount: row.offer_amount !== null ? Number(row.offer_amount) : null,
    status: row.status ?? "novo",
    assignedTo: row.assigned_to ?? undefined,
    notes: row.notes ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function leadToRow(lead: Partial<Lead>): Partial<LeadRow> {
  const row: Partial<LeadRow> = {};
  if (lead.storeId !== undefined) row.store_id = lead.storeId;
  if (lead.vehicleId !== undefined) row.vehicle_id = lead.vehicleId ?? null;
  if (lead.vehicleLabel !== undefined) row.vehicle_label = lead.vehicleLabel;
  if (lead.name !== undefined) row.name = lead.name;
  if (lead.phone !== undefined) row.phone = lead.phone;
  if (lead.whatsapp !== undefined) row.whatsapp = lead.whatsapp;
  if (lead.email !== undefined) row.email = lead.email;
  if (lead.message !== undefined) row.message = lead.message;
  if (lead.origin !== undefined) row.origin = lead.origin;
  if (lead.offerAmount !== undefined) row.offer_amount = lead.offerAmount;
  if (lead.status !== undefined) row.status = lead.status;
  if (lead.assignedTo !== undefined) row.assigned_to = lead.assignedTo ?? null;
  if (lead.notes !== undefined) row.notes = lead.notes;
  return row;
}

export function rowToLeadHistory(row: LeadHistoryRow): LeadHistoryEntry {
  return {
    id: row.id,
    leadId: row.lead_id,
    storeId: row.store_id,
    userId: row.user_id ?? undefined,
    action: row.action,
    fromStatus: row.from_status ?? undefined,
    toStatus: row.to_status ?? undefined,
    note: row.note ?? "",
    createdAt: row.created_at,
  };
}

// ── Planos, assinaturas e auditoria ──────────────────────────

export function rowToPlan(row: PlanRow): Plan {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? "",
    priceMonthly: Number(row.price_monthly),
    vehicleLimit: row.vehicle_limit,
    memberLimit: row.member_limit,
    features: row.features ?? [],
    active: row.active,
    sortOrder: row.sort_order,
  };
}

export function rowToSubscription(row: SubscriptionRow): Subscription {
  return {
    id: row.id,
    storeId: row.store_id,
    planId: row.plan_id ?? undefined,
    status: row.status,
    startedAt: row.started_at,
    currentPeriodEnd: row.current_period_end ?? undefined,
  };
}

export function rowToAuditLog(row: AuditLogRow): AuditLog {
  return {
    id: row.id,
    storeId: row.store_id ?? undefined,
    userId: row.user_id ?? undefined,
    action: row.action,
    entity: row.entity ?? "",
    entityId: row.entity_id ?? "",
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
  };
}

// ── Financeiro ───────────────────────────────────────────────

export function rowToTransaction(row: FinancialTransactionRow): FinancialTransaction {
  return {
    id: row.id,
    userId: row.user_id,
    storeId: row.store_id,
    vehicleId: row.vehicle_id ?? undefined,
    leadId: row.lead_id ?? undefined,
    type: row.type,
    description: row.description,
    customerName: row.customer_name ?? undefined,
    amount: Number(row.amount),
    dueDate: row.due_date ?? undefined,
    paidDate: row.paid_date ?? undefined,
    status: row.status,
    paymentMethod: row.payment_method ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function transactionToRow(tx: Partial<FinancialTransaction>): Partial<FinancialTransactionRow> {
  const row: Partial<FinancialTransactionRow> = {};
  if (tx.userId !== undefined) row.user_id = tx.userId;
  if (tx.storeId !== undefined) row.store_id = tx.storeId;
  if (tx.vehicleId !== undefined) row.vehicle_id = tx.vehicleId || null;
  if (tx.leadId !== undefined) row.lead_id = tx.leadId || null;
  if (tx.type !== undefined) row.type = tx.type;
  if (tx.description !== undefined) row.description = tx.description;
  if (tx.customerName !== undefined) row.customer_name = tx.customerName || null;
  if (tx.amount !== undefined) row.amount = tx.amount;
  if (tx.dueDate !== undefined) row.due_date = tx.dueDate || null;
  if (tx.paidDate !== undefined) row.paid_date = tx.paidDate || null;
  if (tx.status !== undefined) row.status = tx.status;
  if (tx.paymentMethod !== undefined) row.payment_method = tx.paymentMethod || null;
  if (tx.notes !== undefined) row.notes = tx.notes || null;
  return row;
}
