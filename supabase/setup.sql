-- ============================================================
--  CAR SELECT — plataforma multiempresa de catálogos de veículos
--  SQL único: migração + schema + RLS + storage + planos
--
--  COMO USAR
--    1) Abra o SQL Editor do Supabase e cole este arquivo inteiro.
--    2) Rode. É idempotente: pode rodar quantas vezes quiser.
--    3) No final do arquivo há o bloco "SUPERADMIN" — troque o
--       e-mail pelo seu e rode de novo depois de criar sua conta
--       em /register. A partir daí todo o resto (aprovar lojas,
--       planos, promover outros superadmins) é feito pelo painel
--       /superadmin, sem mexer mais no banco.
--
--  MIGRAÇÃO DO PROJETO ANTERIOR (catálogo genérico)
--    As tabelas cd_catalogs e cd_financial_transactions são
--    RENOMEADAS (não recriadas) para cs_stores e
--    cs_financial_transactions — nenhum dado é perdido.
--    As tabelas do nicho antigo (cd_products, cd_categories,
--    cd_leads) continuam no banco, intactas, mas não são mais
--    usadas pelo app. Para removê-las depois de conferir que não
--    precisa mais dos dados, rode supabase/legacy-cleanup.sql.
--
--  PREFIXO "cs_"
--    Mantido de propósito (como o "cd_" anterior): este projeto
--    Supabase tem outras tabelas de outros testes, e nomes sem
--    prefixo (stores, vehicles, leads) colidiriam com elas.
-- ============================================================

create extension if not exists "pgcrypto";

-- ============================================================
--  0. Utilitários
-- ============================================================

create or replace function cs_touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ============================================================
--  1. Migração das tabelas antigas
-- ============================================================

do $$
begin
  -- cd_catalogs -> cs_stores
  if to_regclass('public.cd_catalogs') is not null and to_regclass('public.cs_stores') is null then
    execute 'alter table public.cd_catalogs rename to cs_stores';
  end if;

  -- cd_financial_transactions -> cs_financial_transactions
  if to_regclass('public.cd_financial_transactions') is not null
     and to_regclass('public.cs_financial_transactions') is null then
    execute 'alter table public.cd_financial_transactions rename to cs_financial_transactions';
  end if;
end $$;

do $$
begin
  if to_regclass('public.cs_stores') is not null then
    -- user_id -> owner_id
    if exists (select 1 from information_schema.columns
               where table_schema = 'public' and table_name = 'cs_stores' and column_name = 'user_id')
       and not exists (select 1 from information_schema.columns
               where table_schema = 'public' and table_name = 'cs_stores' and column_name = 'owner_id') then
      execute 'alter table public.cs_stores rename column user_id to owner_id';
    end if;

    -- business_name -> name
    if exists (select 1 from information_schema.columns
               where table_schema = 'public' and table_name = 'cs_stores' and column_name = 'business_name')
       and not exists (select 1 from information_schema.columns
               where table_schema = 'public' and table_name = 'cs_stores' and column_name = 'name') then
      execute 'alter table public.cs_stores rename column business_name to name';
    end if;

    -- banner_url -> cover_url (imagem de capa / banner principal)
    if exists (select 1 from information_schema.columns
               where table_schema = 'public' and table_name = 'cs_stores' and column_name = 'banner_url')
       and not exists (select 1 from information_schema.columns
               where table_schema = 'public' and table_name = 'cs_stores' and column_name = 'cover_url') then
      execute 'alter table public.cs_stores rename column banner_url to cover_url';
    end if;

    -- tagline -> slogan
    if exists (select 1 from information_schema.columns
               where table_schema = 'public' and table_name = 'cs_stores' and column_name = 'tagline')
       and not exists (select 1 from information_schema.columns
               where table_schema = 'public' and table_name = 'cs_stores' and column_name = 'slogan') then
      execute 'alter table public.cs_stores rename column tagline to slogan';
    end if;

    -- accent_color -> secondary_color
    if exists (select 1 from information_schema.columns
               where table_schema = 'public' and table_name = 'cs_stores' and column_name = 'accent_color')
       and not exists (select 1 from information_schema.columns
               where table_schema = 'public' and table_name = 'cs_stores' and column_name = 'secondary_color') then
      execute 'alter table public.cs_stores rename column accent_color to secondary_color';
    end if;
  end if;

  if to_regclass('public.cs_financial_transactions') is not null then
    if exists (select 1 from information_schema.columns
               where table_schema = 'public' and table_name = 'cs_financial_transactions' and column_name = 'catalog_id')
       and not exists (select 1 from information_schema.columns
               where table_schema = 'public' and table_name = 'cs_financial_transactions' and column_name = 'store_id') then
      execute 'alter table public.cs_financial_transactions rename column catalog_id to store_id';
    end if;
  end if;
end $$;

-- A tabela antiga cd_catalogs tinha unique(user_id): uma loja por dono.
-- A plataforma continua com um dono por loja, mas a equipe agora vem de
-- cs_store_members, então a constraint permanece válida e é mantida.

-- ============================================================
--  2. Lojas (tenants)
-- ============================================================

create table if not exists cs_stores (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null unique references auth.users(id) on delete cascade,
  slug       text not null unique,
  name       text not null,
  created_at timestamptz not null default now()
);

-- Colunas (todas com "if not exists" para cobrir tanto banco novo
-- quanto banco migrado do catálogo antigo).
alter table cs_stores add column if not exists slogan          text   not null default '';
alter table cs_stores add column if not exists description     text   not null default '';
alter table cs_stores add column if not exists niche           text   not null default 'veiculos';
alter table cs_stores add column if not exists document        text   not null default '';
alter table cs_stores add column if not exists document_type   text   not null default 'cnpj';
alter table cs_stores add column if not exists email           text   not null default '';
alter table cs_stores add column if not exists phone           text   not null default '';
alter table cs_stores add column if not exists whatsapp_number text   not null default '';
alter table cs_stores add column if not exists whatsapp_default_message text not null default 'Olá! Vi o veículo {veiculo} no catálogo da {loja} e gostaria de mais informações.';
alter table cs_stores add column if not exists logo_url        text;
alter table cs_stores add column if not exists cover_url       text;
alter table cs_stores add column if not exists favicon_url     text;
alter table cs_stores add column if not exists about_image_url text;
alter table cs_stores add column if not exists primary_color   text   not null default '#0B0B0C';
alter table cs_stores add column if not exists secondary_color text   not null default '#C9A227';
alter table cs_stores add column if not exists address         jsonb  not null default '{}'::jsonb;
alter table cs_stores add column if not exists social          jsonb  not null default '{}'::jsonb;
alter table cs_stores add column if not exists business_hours  jsonb  not null default '[]'::jsonb;
alter table cs_stores add column if not exists hero_eyebrow    text   not null default 'MAIS QUE CARROS, GRANDES HISTÓRIAS';
alter table cs_stores add column if not exists hero_title      text   not null default 'Encontre o carro ideal para você';
alter table cs_stores add column if not exists hero_subtitle   text   not null default 'Veículos selecionados, procedência e confiança em cada escolha.';
alter table cs_stores add column if not exists hero_image_url  text;
alter table cs_stores add column if not exists trust_badges    jsonb  not null default '[]'::jsonb;
alter table cs_stores add column if not exists highlights      jsonb  not null default '[]'::jsonb;
alter table cs_stores add column if not exists section_order   jsonb  not null default '["hero","busca","confianca","destaques","sobre","contato"]'::jsonb;
-- Indicadores da seção "sobre". null = ainda não informado: o app esconde.
alter table cs_stores add column if not exists stat_vehicles_sold  integer;
alter table cs_stores add column if not exists stat_satisfaction   integer;
alter table cs_stores add column if not exists stat_years_market   integer;
alter table cs_stores add column if not exists is_published    boolean not null default false;
alter table cs_stores add column if not exists status          text   not null default 'ativa';
alter table cs_stores add column if not exists onboarding_step integer not null default 0;
alter table cs_stores add column if not exists blocked_reason  text;
alter table cs_stores add column if not exists updated_at      timestamptz not null default now();

-- Campos herdados do catálogo antigo que não fazem mais sentido:
alter table cs_stores drop column if exists layout;

-- "add column if not exists" não mexe no default de uma coluna que já
-- existia. Numa base migrada, as colunas abaixo vieram do catálogo antigo
-- e ainda carregavam os defaults dele (verde/azul, mensagem genérica,
-- catálogo já publicado). Aqui elas passam a nascer no padrão Car Select.
alter table cs_stores alter column niche           set default 'veiculos';
alter table cs_stores alter column primary_color   set default '#0B0B0C';
alter table cs_stores alter column secondary_color set default '#C9A227';
alter table cs_stores alter column is_published    set default false;
alter table cs_stores alter column hero_title      set default 'Encontre o carro ideal para você';
alter table cs_stores alter column hero_subtitle   set default 'Veículos selecionados, procedência e confiança em cada escolha.';
alter table cs_stores alter column whatsapp_default_message
  set default 'Olá! Vi o veículo {veiculo} no catálogo da {loja} e gostaria de mais informações.';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'cs_stores_status_check') then
    alter table cs_stores add constraint cs_stores_status_check
      check (status in ('pendente', 'ativa', 'bloqueada', 'desativada'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'cs_stores_document_type_check') then
    alter table cs_stores add constraint cs_stores_document_type_check
      check (document_type in ('cnpj', 'cpf'));
  end if;
end $$;

-- Lojas que vêm do catálogo antigo já estavam publicadas; normaliza o nicho.
update cs_stores set niche = 'veiculos' where niche is distinct from 'veiculos';

create index if not exists idx_cs_stores_status on cs_stores(status);

drop trigger if exists trg_cs_stores_touch on cs_stores;
create trigger trg_cs_stores_touch before update on cs_stores
  for each row execute function cs_touch_updated_at();

-- ============================================================
--  3. Equipe da loja e superadministradores
-- ============================================================

create table if not exists cs_store_members (
  id          uuid primary key default gen_random_uuid(),
  store_id    uuid not null references cs_stores(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        text not null default 'collaborator' check (role in ('owner', 'admin', 'collaborator')),
  -- Permissões do colaborador. Admin e owner ignoram este campo (podem tudo).
  permissions jsonb not null default '{"vehicles_create":true,"vehicles_edit":true,"vehicles_publish":false,"leads":true,"reports":false,"finance":false}'::jsonb,
  status      text not null default 'active' check (status in ('active', 'suspended')),
  display_name text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (store_id, user_id)
);

create index if not exists idx_cs_members_user  on cs_store_members(user_id);
create index if not exists idx_cs_members_store on cs_store_members(store_id);

drop trigger if exists trg_cs_members_touch on cs_store_members;
create trigger trg_cs_members_touch before update on cs_store_members
  for each row execute function cs_touch_updated_at();

create table if not exists cs_platform_admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Toda loja criada ganha automaticamente o vínculo de dono. Isso
-- acontece no banco (trigger), não no frontend — o app nunca precisa
-- (nem consegue) forjar quem é dono de quê.
create or replace function cs_add_owner_membership() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into cs_store_members (store_id, user_id, role, permissions)
  values (new.id, new.owner_id, 'owner', '{}'::jsonb)
  on conflict (store_id, user_id) do update set role = 'owner', status = 'active';
  return new;
end;
$$;

drop trigger if exists trg_cs_stores_owner_membership on cs_stores;
create trigger trg_cs_stores_owner_membership after insert on cs_stores
  for each row execute function cs_add_owner_membership();

-- Backfill: lojas que já existiam (migradas do catálogo antigo).
insert into cs_store_members (store_id, user_id, role)
select id, owner_id, 'owner' from cs_stores
on conflict (store_id, user_id) do nothing;

-- ============================================================
--  4. Funções de autorização
--
--  São SECURITY DEFINER de propósito: as policies de RLS precisam
--  consultar cs_store_members, e se essa consulta passasse pelo
--  próprio RLS da tabela haveria recursão infinita.
--  Nenhuma delas aceita "quem eu sou" como parâmetro — a identidade
--  vem sempre de auth.uid(), nunca do frontend.
-- ============================================================

create or replace function cs_is_platform_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from cs_platform_admins where user_id = auth.uid());
$$;

create or replace function cs_member_role(p_store uuid) returns text
language sql stable security definer set search_path = public as $$
  select role from cs_store_members
  where store_id = p_store and user_id = auth.uid() and status = 'active'
  limit 1;
$$;

create or replace function cs_is_store_member(p_store uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select cs_member_role(p_store) is not null or cs_is_platform_admin();
$$;

create or replace function cs_is_store_admin(p_store uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select cs_member_role(p_store) in ('owner', 'admin') or cs_is_platform_admin();
$$;

/* Permissão granular do colaborador. owner/admin/superadmin => sempre true. */
create or replace function cs_can(p_store uuid, p_permission text) returns boolean
language sql stable security definer set search_path = public as $$
  select case
    when cs_is_store_admin(p_store) then true
    else coalesce(
      (select (permissions ->> p_permission)::boolean
         from cs_store_members
        where store_id = p_store and user_id = auth.uid() and status = 'active'),
      false)
  end;
$$;

/* Uma loja só aparece publicamente se estiver publicada E ativa. */
create or replace function cs_store_is_public(p_store uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from cs_stores
    where id = p_store and is_published = true and status = 'ativa'
  );
$$;

-- ============================================================
--  5. Veículos
-- ============================================================

create table if not exists cs_vehicles (
  id                uuid primary key default gen_random_uuid(),
  store_id          uuid not null references cs_stores(id) on delete cascade,
  slug              text not null,
  brand             text not null,
  model             text not null,
  version           text not null default '',
  year_manufacture  integer,
  year_model        integer,
  price             numeric(12,2) not null default 0,
  price_promo       numeric(12,2),
  price_previous    numeric(12,2),
  mileage           integer not null default 0,
  transmission      text,
  fuel              text,
  color             text not null default '',
  doors             integer,
  body_type         text,
  plate_end         text not null default '',
  internal_code     text not null default '',
  condition         text not null default 'seminovo',
  conservation      text not null default '',
  accepts_trade     boolean not null default false,
  financing         boolean not null default true,
  featured          boolean not null default false,
  status            text not null default 'disponivel',
  published         boolean not null default true,
  description       text not null default '',
  documentation     text not null default '',
  location          text not null default '',
  features          jsonb not null default '[]'::jsonb,
  cover_url         text,
  views             integer not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (store_id, slug)
);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'cs_vehicles_status_check') then
    alter table cs_vehicles add constraint cs_vehicles_status_check
      check (status in ('disponivel', 'reservado', 'vendido', 'arquivado'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'cs_vehicles_condition_check') then
    alter table cs_vehicles add constraint cs_vehicles_condition_check
      check (condition in ('novo', 'seminovo', 'usado'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'cs_vehicles_transmission_check') then
    alter table cs_vehicles add constraint cs_vehicles_transmission_check
      check (transmission is null or transmission in ('manual', 'automatico', 'automatizado', 'cvt'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'cs_vehicles_fuel_check') then
    alter table cs_vehicles add constraint cs_vehicles_fuel_check
      check (fuel is null or fuel in ('flex', 'gasolina', 'etanol', 'diesel', 'gnv', 'hibrido', 'eletrico'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'cs_vehicles_body_check') then
    alter table cs_vehicles add constraint cs_vehicles_body_check
      check (body_type is null or body_type in ('hatch', 'sedan', 'suv', 'picape', 'crossover', 'minivan', 'coupe', 'conversivel', 'van', 'utilitario', 'outro'));
  end if;
end $$;

create index if not exists idx_cs_vehicles_store    on cs_vehicles(store_id);
create index if not exists idx_cs_vehicles_status   on cs_vehicles(store_id, status);
create index if not exists idx_cs_vehicles_brand    on cs_vehicles(store_id, brand);
create index if not exists idx_cs_vehicles_price    on cs_vehicles(store_id, price);
create index if not exists idx_cs_vehicles_featured on cs_vehicles(store_id, featured);

drop trigger if exists trg_cs_vehicles_touch on cs_vehicles;
create trigger trg_cs_vehicles_touch before update on cs_vehicles
  for each row execute function cs_touch_updated_at();

create table if not exists cs_vehicle_images (
  id         uuid primary key default gen_random_uuid(),
  store_id   uuid not null references cs_stores(id) on delete cascade,
  vehicle_id uuid not null references cs_vehicles(id) on delete cascade,
  url        text not null,
  path       text,
  position   integer not null default 0,
  is_cover   boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_cs_vehicle_images_vehicle on cs_vehicle_images(vehicle_id, position);
create index if not exists idx_cs_vehicle_images_store   on cs_vehicle_images(store_id);

-- ============================================================
--  6. Leads (CRM da loja)
-- ============================================================

create table if not exists cs_leads (
  id            uuid primary key default gen_random_uuid(),
  store_id      uuid not null references cs_stores(id) on delete cascade,
  vehicle_id    uuid references cs_vehicles(id) on delete set null,
  vehicle_label text not null default '',
  name          text not null default '',
  phone         text not null default '',
  whatsapp      text not null default '',
  email         text not null default '',
  message       text not null default '',
  origin        text not null default 'catalogo',
  offer_amount  numeric(12,2),
  status        text not null default 'novo',
  assigned_to   uuid references auth.users(id) on delete set null,
  notes         text not null default '',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'cs_leads_status_check') then
    alter table cs_leads add constraint cs_leads_status_check
      check (status in ('novo', 'em_atendimento', 'visita_agendada', 'negociacao', 'venda_concluida', 'perdido'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'cs_leads_origin_check') then
    alter table cs_leads add constraint cs_leads_origin_check
      check (origin in ('catalogo', 'whatsapp', 'formulario', 'proposta', 'financiamento', 'contato', 'manual'));
  end if;
end $$;

create index if not exists idx_cs_leads_store  on cs_leads(store_id, created_at desc);
create index if not exists idx_cs_leads_status on cs_leads(store_id, status);

drop trigger if exists trg_cs_leads_touch on cs_leads;
create trigger trg_cs_leads_touch before update on cs_leads
  for each row execute function cs_touch_updated_at();

create table if not exists cs_lead_history (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid not null references cs_leads(id) on delete cascade,
  store_id    uuid not null references cs_stores(id) on delete cascade,
  user_id     uuid references auth.users(id) on delete set null,
  action      text not null,
  from_status text,
  to_status   text,
  note        text not null default '',
  created_at  timestamptz not null default now()
);

create index if not exists idx_cs_lead_history_lead on cs_lead_history(lead_id, created_at desc);

-- store_id do histórico vem sempre do lead, nunca do frontend.
create or replace function cs_lead_history_store_id() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.store_id := (select store_id from cs_leads where id = new.lead_id);
  new.user_id  := auth.uid();
  return new;
end;
$$;

drop trigger if exists trg_cs_lead_history_store on cs_lead_history;
create trigger trg_cs_lead_history_store before insert on cs_lead_history
  for each row execute function cs_lead_history_store_id();

-- Registra automaticamente a mudança de status do lead.
create or replace function cs_log_lead_status() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status is distinct from old.status then
    insert into cs_lead_history (lead_id, store_id, user_id, action, from_status, to_status)
    values (new.id, new.store_id, auth.uid(), 'status', old.status, new.status);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_cs_leads_log_status on cs_leads;
create trigger trg_cs_leads_log_status after update on cs_leads
  for each row execute function cs_log_lead_status();

-- ============================================================
--  7. Eventos do catálogo (visualizações e contatos)
-- ============================================================

create table if not exists cs_store_events (
  id         uuid primary key default gen_random_uuid(),
  store_id   uuid not null references cs_stores(id) on delete cascade,
  vehicle_id uuid references cs_vehicles(id) on delete cascade,
  type       text not null check (type in ('view_store', 'view_vehicle', 'whatsapp_click', 'share')),
  created_at timestamptz not null default now()
);

create index if not exists idx_cs_events_store on cs_store_events(store_id, created_at desc);
create index if not exists idx_cs_events_type  on cs_store_events(store_id, type);

-- Contador rápido no veículo (evita agregação a cada listagem).
create or replace function cs_bump_vehicle_views() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.type = 'view_vehicle' and new.vehicle_id is not null then
    update cs_vehicles set views = views + 1 where id = new.vehicle_id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_cs_events_bump_views on cs_store_events;
create trigger trg_cs_events_bump_views after insert on cs_store_events
  for each row execute function cs_bump_vehicle_views();

-- ============================================================
--  8. Planos e assinaturas
-- ============================================================

create table if not exists cs_plans (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  name          text not null,
  description   text not null default '',
  price_monthly numeric(10,2) not null default 0,
  vehicle_limit integer,
  member_limit  integer,
  features      jsonb not null default '[]'::jsonb,
  active        boolean not null default true,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now()
);

insert into cs_plans (slug, name, description, price_monthly, vehicle_limit, member_limit, features, sort_order)
values
  ('starter',  'Starter',  'Para quem está começando a anunciar online.', 0,    15,  2,   '["Catálogo público","Até 15 veículos","2 usuários","Leads no painel"]'::jsonb, 1),
  ('pro',      'Pro',      'Para lojas com estoque ativo e equipe.',      149,  120, 10,  '["Tudo do Starter","Até 120 veículos","10 usuários","Relatórios e destaques"]'::jsonb, 2),
  ('premium',  'Premium',  'Estoque e equipe sem limite.',                299,  null, null, '["Tudo do Pro","Veículos ilimitados","Usuários ilimitados","Suporte prioritário"]'::jsonb, 3)
on conflict (slug) do nothing;

create table if not exists cs_subscriptions (
  id                 uuid primary key default gen_random_uuid(),
  store_id           uuid not null unique references cs_stores(id) on delete cascade,
  plan_id            uuid references cs_plans(id) on delete set null,
  status             text not null default 'trial' check (status in ('trial', 'active', 'past_due', 'canceled')),
  started_at         timestamptz not null default now(),
  current_period_end timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

drop trigger if exists trg_cs_subscriptions_touch on cs_subscriptions;
create trigger trg_cs_subscriptions_touch before update on cs_subscriptions
  for each row execute function cs_touch_updated_at();

-- Toda loja nova entra no plano Starter em trial.
create or replace function cs_add_default_subscription() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into cs_subscriptions (store_id, plan_id, status, current_period_end)
  values (new.id, (select id from cs_plans where slug = 'starter'), 'trial', now() + interval '30 days')
  on conflict (store_id) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_cs_stores_subscription on cs_stores;
create trigger trg_cs_stores_subscription after insert on cs_stores
  for each row execute function cs_add_default_subscription();

insert into cs_subscriptions (store_id, plan_id, status, current_period_end)
select s.id, (select id from cs_plans where slug = 'starter'), 'trial', now() + interval '30 days'
from cs_stores s
on conflict (store_id) do nothing;

-- ============================================================
--  9. Auditoria
-- ============================================================

create table if not exists cs_audit_logs (
  id         uuid primary key default gen_random_uuid(),
  store_id   uuid references cs_stores(id) on delete set null,
  user_id    uuid references auth.users(id) on delete set null,
  action     text not null,
  entity     text not null default '',
  entity_id  text not null default '',
  metadata   jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_cs_audit_store on cs_audit_logs(store_id, created_at desc);
create index if not exists idx_cs_audit_user  on cs_audit_logs(created_at desc);

-- user_id do log vem do servidor, nunca do frontend.
create or replace function cs_audit_set_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.user_id := auth.uid();
  return new;
end;
$$;

drop trigger if exists trg_cs_audit_user on cs_audit_logs;
create trigger trg_cs_audit_user before insert on cs_audit_logs
  for each row execute function cs_audit_set_user();

-- ============================================================
--  10. Financeiro (migrado do projeto anterior)
-- ============================================================

create table if not exists cs_financial_transactions (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  store_id       uuid not null references cs_stores(id) on delete cascade,
  type           text not null check (type in ('receita', 'despesa')),
  description    text not null,
  customer_name  text,
  amount         numeric(12,2) not null default 0,
  due_date       date,
  paid_date      date,
  status         text not null default 'pendente' check (status in ('pendente', 'pago', 'atrasado', 'cancelado')),
  payment_method text check (payment_method in ('pix', 'dinheiro', 'cartao', 'boleto', 'transferencia', 'financiamento', 'outro')),
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

alter table cs_financial_transactions add column if not exists vehicle_id uuid references cs_vehicles(id) on delete set null;
alter table cs_financial_transactions add column if not exists lead_id    uuid references cs_leads(id) on delete set null;

-- "financiamento" é uma forma de pagamento nova neste nicho.
do $$
declare
  conname_found text;
begin
  select conname into conname_found from pg_constraint
   where conrelid = 'cs_financial_transactions'::regclass
     and pg_get_constraintdef(oid) ilike '%payment_method%';
  if conname_found is not null then
    execute format('alter table cs_financial_transactions drop constraint %I', conname_found);
  end if;
  alter table cs_financial_transactions add constraint cs_financial_payment_method_check
    check (payment_method is null or payment_method in ('pix', 'dinheiro', 'cartao', 'boleto', 'transferencia', 'financiamento', 'outro'));
exception when others then
  null;
end $$;

create index if not exists idx_cs_fin_store   on cs_financial_transactions(store_id);
create index if not exists idx_cs_fin_due     on cs_financial_transactions(due_date);
create index if not exists idx_cs_fin_vehicle on cs_financial_transactions(vehicle_id);

drop trigger if exists trg_cs_fin_touch on cs_financial_transactions;
create trigger trg_cs_fin_touch before update on cs_financial_transactions
  for each row execute function cs_touch_updated_at();

-- ============================================================
--  11. ROW LEVEL SECURITY
--
--  Regra geral: nada é visível por padrão. O acesso vem de
--  cs_is_store_member / cs_is_store_admin / cs_can, que resolvem
--  a identidade por auth.uid(). O público só lê lojas publicadas
--  e ativas e veículos publicados dessas lojas.
-- ============================================================

alter table cs_stores                 enable row level security;
alter table cs_store_members          enable row level security;
alter table cs_platform_admins        enable row level security;
alter table cs_vehicles               enable row level security;
alter table cs_vehicle_images         enable row level security;
alter table cs_leads                  enable row level security;
alter table cs_lead_history           enable row level security;
alter table cs_store_events           enable row level security;
alter table cs_plans                  enable row level security;
alter table cs_subscriptions          enable row level security;
alter table cs_audit_logs             enable row level security;
alter table cs_financial_transactions enable row level security;

-- Remove qualquer policy anterior destas tabelas (inclusive as herdadas
-- do catálogo antigo, que ficaram na tabela renomeada).
do $$
declare
  r record;
begin
  for r in
    select schemaname, tablename, policyname from pg_policies
    where schemaname = 'public'
      and tablename in ('cs_stores','cs_store_members','cs_platform_admins','cs_vehicles',
                        'cs_vehicle_images','cs_leads','cs_lead_history','cs_store_events',
                        'cs_plans','cs_subscriptions','cs_audit_logs','cs_financial_transactions')
  loop
    execute format('drop policy %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;

-- ── Lojas ────────────────────────────────────────────────────
create policy "stores public read" on cs_stores for select
  using (is_published = true and status = 'ativa');
create policy "stores member read" on cs_stores for select
  using (cs_is_store_member(id));
-- O dono lê a própria loja direto por owner_id, sem passar por
-- cs_store_members. Isso é o que faz o INSERT ... RETURNING da criação da
-- loja funcionar: o vínculo de dono só é gravado por um trigger AFTER
-- INSERT, então na hora de devolver a linha recém-criada a policy de
-- membro ainda não enxergaria nada — e a loja nasce despublicada, então a
-- policy pública também não.
create policy "stores owner read" on cs_stores for select
  using (auth.uid() = owner_id);
create policy "stores owner insert" on cs_stores for insert
  with check (auth.uid() = owner_id);
create policy "stores admin update" on cs_stores for update
  using (cs_is_store_admin(id)) with check (cs_is_store_admin(id));
create policy "stores owner delete" on cs_stores for delete
  using (auth.uid() = owner_id or cs_is_platform_admin());

-- ── Equipe ───────────────────────────────────────────────────
create policy "members read own store" on cs_store_members for select
  using (user_id = auth.uid() or cs_is_store_member(store_id));
create policy "members admin insert" on cs_store_members for insert
  with check (cs_is_store_admin(store_id));
create policy "members admin update" on cs_store_members for update
  using (cs_is_store_admin(store_id)) with check (cs_is_store_admin(store_id));
create policy "members admin delete" on cs_store_members for delete
  using (cs_is_store_admin(store_id) and role <> 'owner');

-- ── Superadmins ──────────────────────────────────────────────
create policy "platform admins read" on cs_platform_admins for select
  using (user_id = auth.uid() or cs_is_platform_admin());
create policy "platform admins insert" on cs_platform_admins for insert
  with check (cs_is_platform_admin());
create policy "platform admins delete" on cs_platform_admins for delete
  using (cs_is_platform_admin() and user_id <> auth.uid());

-- ── Veículos ─────────────────────────────────────────────────
create policy "vehicles public read" on cs_vehicles for select
  using (published = true and status in ('disponivel', 'reservado') and cs_store_is_public(store_id));
create policy "vehicles member read" on cs_vehicles for select
  using (cs_is_store_member(store_id));
create policy "vehicles insert" on cs_vehicles for insert
  with check (cs_can(store_id, 'vehicles_create'));
create policy "vehicles update" on cs_vehicles for update
  using (cs_can(store_id, 'vehicles_edit')) with check (cs_can(store_id, 'vehicles_edit'));
create policy "vehicles delete" on cs_vehicles for delete
  using (cs_is_store_admin(store_id));

-- ── Fotos ────────────────────────────────────────────────────
create policy "vehicle images public read" on cs_vehicle_images for select
  using (exists (
    select 1 from cs_vehicles v
    where v.id = cs_vehicle_images.vehicle_id
      and v.published = true and v.status in ('disponivel', 'reservado')
      and cs_store_is_public(v.store_id)));
create policy "vehicle images member read" on cs_vehicle_images for select
  using (cs_is_store_member(store_id));
create policy "vehicle images insert" on cs_vehicle_images for insert
  with check (cs_can(store_id, 'vehicles_edit'));
create policy "vehicle images update" on cs_vehicle_images for update
  using (cs_can(store_id, 'vehicles_edit')) with check (cs_can(store_id, 'vehicles_edit'));
create policy "vehicle images delete" on cs_vehicle_images for delete
  using (cs_can(store_id, 'vehicles_edit'));

-- ── Leads ────────────────────────────────────────────────────
-- Visitante anônimo só pode INSERIR, e apenas em loja pública.
-- Nunca pode ler nada.
create policy "leads public insert" on cs_leads for insert
  with check (cs_store_is_public(store_id));
create policy "leads member read" on cs_leads for select
  using (cs_can(store_id, 'leads'));
create policy "leads member update" on cs_leads for update
  using (cs_can(store_id, 'leads')) with check (cs_can(store_id, 'leads'));
create policy "leads admin delete" on cs_leads for delete
  using (cs_is_store_admin(store_id));

create policy "lead history read" on cs_lead_history for select
  using (cs_can(store_id, 'leads'));
create policy "lead history insert" on cs_lead_history for insert
  with check (exists (select 1 from cs_leads l where l.id = lead_id and cs_can(l.store_id, 'leads')));

-- ── Eventos ──────────────────────────────────────────────────
create policy "events public insert" on cs_store_events for insert
  with check (cs_store_is_public(store_id));
create policy "events member read" on cs_store_events for select
  using (cs_is_store_member(store_id));

-- ── Planos e assinaturas ─────────────────────────────────────
create policy "plans public read" on cs_plans for select using (active = true or cs_is_platform_admin());
create policy "plans admin write" on cs_plans for insert with check (cs_is_platform_admin());
create policy "plans admin update" on cs_plans for update using (cs_is_platform_admin()) with check (cs_is_platform_admin());
create policy "plans admin delete" on cs_plans for delete using (cs_is_platform_admin());

create policy "subscriptions member read" on cs_subscriptions for select using (cs_is_store_member(store_id));
create policy "subscriptions admin write" on cs_subscriptions for insert with check (cs_is_platform_admin());
create policy "subscriptions admin update" on cs_subscriptions for update using (cs_is_platform_admin()) with check (cs_is_platform_admin());

-- ── Auditoria ────────────────────────────────────────────────
create policy "audit read" on cs_audit_logs for select
  using (cs_is_platform_admin() or (store_id is not null and cs_is_store_admin(store_id)));
create policy "audit insert" on cs_audit_logs for insert
  with check (store_id is null or cs_is_store_member(store_id));

-- ── Financeiro ───────────────────────────────────────────────
create policy "finance read" on cs_financial_transactions for select using (cs_can(store_id, 'finance'));
create policy "finance insert" on cs_financial_transactions for insert with check (cs_can(store_id, 'finance') and user_id = auth.uid());
create policy "finance update" on cs_financial_transactions for update using (cs_can(store_id, 'finance')) with check (cs_can(store_id, 'finance'));
create policy "finance delete" on cs_financial_transactions for delete using (cs_is_store_admin(store_id));

-- ============================================================
--  12. Storage
--
--  Bucket "store-media": {store_id}/logo|capa|veiculos/{vehicle_id}/...
--  A primeira pasta do caminho é sempre o store_id, e a policy exige
--  que quem escreve seja membro daquela loja — é isso que impede uma
--  loja de sobrescrever arquivos de outra.
-- ============================================================

insert into storage.buckets (id, name, public)
values ('store-media', 'store-media', true)
on conflict (id) do nothing;

drop policy if exists "store media public read"   on storage.objects;
drop policy if exists "store media member insert" on storage.objects;
drop policy if exists "store media member update" on storage.objects;
drop policy if exists "store media member delete" on storage.objects;

create policy "store media public read" on storage.objects for select
  using (bucket_id = 'store-media');

create policy "store media member insert" on storage.objects for insert
  with check (
    bucket_id = 'store-media'
    and cs_is_store_member(((storage.foldername(name))[1])::uuid)
  );

create policy "store media member update" on storage.objects for update
  using (
    bucket_id = 'store-media'
    and cs_is_store_member(((storage.foldername(name))[1])::uuid)
  );

create policy "store media member delete" on storage.objects for delete
  using (
    bucket_id = 'store-media'
    and cs_is_store_member(((storage.foldername(name))[1])::uuid)
  );

-- ============================================================
--  13. Compatibilidade com as tabelas do nicho antigo
--
--  cd_products/cd_categories/cd_leads continuam existindo e tinham
--  policies que apontavam para "cd_catalogs" (agora renomeada).
--  Sem isso elas quebram. Aqui as policies são reescritas para
--  cs_stores — os dados antigos seguem protegidos pelo dono até
--  você rodar o legacy-cleanup.sql.
-- ============================================================

do $$
declare
  r record;
  t text;
begin
  foreach t in array array['cd_products', 'cd_categories', 'cd_leads'] loop
    if to_regclass('public.' || t) is not null then
      for r in select policyname from pg_policies where schemaname = 'public' and tablename = t loop
        execute format('drop policy %I on public.%I', r.policyname, t);
      end loop;
      execute format(
        'create policy "legacy owner all" on public.%I for all using (exists (select 1 from cs_stores s where s.id = %I.catalog_id and s.owner_id = auth.uid())) with check (exists (select 1 from cs_stores s where s.id = %I.catalog_id and s.owner_id = auth.uid()))',
        t, t, t);
    end if;
  end loop;

  -- A trigger antiga de cd_leads referenciava cd_catalogs.
  if to_regclass('public.cd_leads') is not null then
    execute $fn$
      create or replace function cd_set_lead_user_id() returns trigger as $body$
      begin
        new.user_id := (select owner_id from cs_stores where id = new.catalog_id);
        return new;
      end;
      $body$ language plpgsql security definer set search_path = public;
    $fn$;
  end if;
end $$;

-- ============================================================
--  14. Convites de colaborador
--
--  Não é possível criar usuários pelo frontend sem expor a chave de
--  serviço — e expor essa chave seria um furo de segurança. Então o
--  fluxo é por código: o admin gera um convite, o colaborador cria a
--  própria conta em /register e resgata o código.
--
--  O resgate roda em cs_redeem_invite(), SECURITY DEFINER: é a única
--  forma de alguém virar membro de uma loja sem já ser admin dela, e
--  ainda assim quem entra é sempre auth.uid(), com o papel e as
--  permissões definidos por quem criou o convite.
-- ============================================================

create table if not exists cs_store_invites (
  id          uuid primary key default gen_random_uuid(),
  store_id    uuid not null references cs_stores(id) on delete cascade,
  code        text not null unique,
  email       text not null default '',
  display_name text not null default '',
  role        text not null default 'collaborator' check (role in ('admin', 'collaborator')),
  permissions jsonb not null default '{}'::jsonb,
  expires_at  timestamptz not null default now() + interval '14 days',
  used_by     uuid references auth.users(id) on delete set null,
  used_at     timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists idx_cs_invites_store on cs_store_invites(store_id);

alter table cs_store_invites enable row level security;

do $$
declare
  r record;
begin
  for r in select policyname from pg_policies where schemaname = 'public' and tablename = 'cs_store_invites' loop
    execute format('drop policy %I on public.cs_store_invites', r.policyname);
  end loop;
end $$;

create policy "invites admin read"   on cs_store_invites for select using (cs_is_store_admin(store_id));
create policy "invites admin insert" on cs_store_invites for insert with check (cs_is_store_admin(store_id));
create policy "invites admin delete" on cs_store_invites for delete using (cs_is_store_admin(store_id));

-- Devolve jsonb, não uma tabela com colunas nomeadas: um OUT chamado
-- store_id colidiria com a coluna store_id de cs_store_members dentro do
-- INSERT ("column reference is ambiguous").
create or replace function cs_redeem_invite(p_code text)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  invite cs_store_invites%rowtype;
  result jsonb;
begin
  if auth.uid() is null then
    raise exception 'Você precisa estar logado para usar um convite.';
  end if;

  select * into invite from cs_store_invites
   where code = upper(trim(p_code)) and used_by is null and expires_at > now();

  if not found then
    raise exception 'Convite inválido, já utilizado ou expirado.';
  end if;

  insert into cs_store_members (store_id, user_id, role, permissions, display_name)
  values (invite.store_id, auth.uid(), invite.role,
          case when invite.permissions = '{}'::jsonb
               then '{"vehicles_create":true,"vehicles_edit":true,"vehicles_publish":false,"leads":true,"reports":false,"finance":false}'::jsonb
               else invite.permissions end,
          invite.display_name)
  on conflict (store_id, user_id) do update
    set role = excluded.role, permissions = excluded.permissions, status = 'active';

  update cs_store_invites set used_by = auth.uid(), used_at = now() where id = invite.id;

  insert into cs_audit_logs (store_id, action, entity, entity_id)
  values (invite.store_id, 'member.join', 'store_member', auth.uid()::text);

  select jsonb_build_object('store_id', s.id, 'slug', s.slug, 'name', s.name)
    into result
    from cs_stores s
   where s.id = invite.store_id;

  return result;
end;
$$;

-- ============================================================
--  15. SUPERADMIN — ajuste este bloco
--
--  Troque o e-mail abaixo pelo seu, crie a conta em /register e
--  rode este arquivo de novo. Depois disso o painel /superadmin
--  permite promover/remover outros superadmins sem tocar no banco.
-- ============================================================

insert into cs_platform_admins (user_id)
select id from auth.users where lower(email) = lower('troque-por-seu-email@exemplo.com')
on conflict (user_id) do nothing;
