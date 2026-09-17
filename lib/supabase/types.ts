// Formato das linhas como ficam no Postgres (snake_case), espelhando
// supabase/setup.sql. Os componentes usam os tipos de /types (camelCase)
// — a conversão fica em ./mappers.ts.

import type {
  BusinessHour,
  DocumentType,
  MemberPermissions,
  MemberRole,
  MemberStatus,
  SocialLinks,
  StoreAddress,
  StoreSection,
  StoreStatus,
  SubscriptionStatus,
  TrustBadge,
} from "@/types/store";
import type { LeadOrigin, LeadStatus } from "@/types/lead";
import type { BodyType, Fuel, Transmission, VehicleCondition, VehicleStatus } from "@/types/vehicle";
import type { PaymentMethod, TransactionStatus, TransactionType } from "@/types/financial";

export interface StoreRow {
  id: string;
  owner_id: string;
  slug: string;
  name: string;
  slogan: string;
  description: string;
  document: string;
  document_type: DocumentType;
  email: string;
  phone: string;
  whatsapp_number: string;
  whatsapp_default_message: string;
  logo_url: string | null;
  cover_url: string | null;
  favicon_url: string | null;
  about_image_url: string | null;
  primary_color: string;
  secondary_color: string;
  address: StoreAddress | null;
  social: SocialLinks | null;
  business_hours: BusinessHour[] | null;
  hero_eyebrow: string;
  hero_title: string;
  hero_subtitle: string;
  hero_image_url: string | null;
  trust_badges: TrustBadge[] | null;
  section_order: StoreSection[] | null;
  stat_vehicles_sold: number | null;
  stat_satisfaction: number | null;
  stat_years_market: number | null;
  is_published: boolean;
  status: StoreStatus;
  onboarding_step: number;
  blocked_reason: string | null;
  created_at: string;
}

export interface StoreMemberRow {
  id: string;
  store_id: string;
  user_id: string;
  role: MemberRole;
  permissions: MemberPermissions;
  status: MemberStatus;
  display_name: string;
  created_at: string;
}

export interface VehicleRow {
  id: string;
  store_id: string;
  slug: string;
  brand: string;
  model: string;
  version: string;
  year_manufacture: number | null;
  year_model: number | null;
  price: number;
  price_promo: number | null;
  price_previous: number | null;
  mileage: number;
  transmission: Transmission | null;
  fuel: Fuel | null;
  color: string;
  doors: number | null;
  body_type: BodyType | null;
  plate_end: string;
  internal_code: string;
  condition: VehicleCondition;
  conservation: string;
  accepts_trade: boolean;
  financing: boolean;
  featured: boolean;
  status: VehicleStatus;
  published: boolean;
  description: string;
  documentation: string;
  location: string;
  features: string[] | null;
  cover_url: string | null;
  views: number;
  created_at: string;
  updated_at: string;
  cs_vehicle_images?: VehicleImageRow[];
}

export interface VehicleImageRow {
  id: string;
  store_id: string;
  vehicle_id: string;
  url: string;
  path: string | null;
  position: number;
  is_cover: boolean;
}

export interface LeadRow {
  id: string;
  store_id: string;
  vehicle_id: string | null;
  vehicle_label: string;
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  message: string;
  origin: LeadOrigin;
  offer_amount: number | null;
  status: LeadStatus;
  assigned_to: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface LeadHistoryRow {
  id: string;
  lead_id: string;
  store_id: string;
  user_id: string | null;
  action: string;
  from_status: string | null;
  to_status: string | null;
  note: string;
  created_at: string;
}

export interface PlanRow {
  id: string;
  slug: string;
  name: string;
  description: string;
  price_monthly: number;
  vehicle_limit: number | null;
  member_limit: number | null;
  features: string[] | null;
  active: boolean;
  sort_order: number;
}

export interface SubscriptionRow {
  id: string;
  store_id: string;
  plan_id: string | null;
  status: SubscriptionStatus;
  started_at: string;
  current_period_end: string | null;
}

export interface AuditLogRow {
  id: string;
  store_id: string | null;
  user_id: string | null;
  action: string;
  entity: string;
  entity_id: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface FinancialTransactionRow {
  id: string;
  user_id: string;
  store_id: string;
  vehicle_id: string | null;
  lead_id: string | null;
  type: TransactionType;
  description: string;
  customer_name: string | null;
  amount: number;
  due_date: string | null;
  paid_date: string | null;
  status: TransactionStatus;
  payment_method: PaymentMethod | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
