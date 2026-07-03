-- ============================================================
--  Catálogo Digital Universal — Schema Supabase
--
--  Como usar: abra o SQL Editor do seu projeto Supabase, cole
--  este arquivo inteiro e clique em "Run". Depois rode o
--  supabase/seed.sql (opcional) para carregar os dados de
--  exemplo que já existem em /data.
-- ============================================================

create extension if not exists "pgcrypto";

-- ── Categorias ────────────────────────────────────────────────
create table if not exists categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  description text,
  icon        text not null default '🏷️',
  "order"     integer not null default 0,
  created_at  timestamptz not null default now()
);

-- ── Produtos e serviços ──────────────────────────────────────
create table if not exists items (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null,
  name          text not null,
  kind          text not null default 'produto' check (kind in ('produto', 'servico')),
  category_id   uuid references categories(id) on delete set null,
  description   text,
  price         numeric(10,2) not null default 0,
  price_compare numeric(10,2),
  image         text,
  gallery       jsonb not null default '[]'::jsonb,
  stock         integer,
  variations    jsonb not null default '[]'::jsonb,
  active        boolean not null default true,
  featured      boolean not null default false,
  promotional   boolean not null default false,
  created_at    timestamptz not null default now()
);

create index if not exists idx_items_category on items(category_id);
create index if not exists idx_items_active   on items(active);

-- ── Configurações da loja (linha única) ──────────────────────
create table if not exists store_settings (
  id                       text primary key default 'default',
  brand_name               text not null default 'Minha Loja',
  niche                    text not null default '',
  tagline                  text not null default '',
  hero_title               text not null default '',
  hero_subtitle            text not null default '',
  logo_url                 text,
  banner_url               text,
  whatsapp_number          text not null default '',
  whatsapp_default_message text not null default 'Olá! Vim pelo catálogo digital e tenho interesse em:',
  primary_color            text not null default '#111827',
  accent_color             text not null default '#16a34a',
  address                  jsonb not null default '{}'::jsonb,
  social                   jsonb not null default '{}'::jsonb,
  updated_at               timestamptz not null default now()
);

-- ============================================================
--  Row Level Security
--
--  ⚠️ O painel /admin ainda não tem login. As policies abaixo
--  liberam leitura E escrita para a chave pública (anon/
--  publishable) só para o catálogo funcionar de ponta a ponta
--  sem backend próprio. Antes de colocar em produção de verdade,
--  adicione Supabase Auth e troque as policies de escrita para
--  `using (auth.uid() is not null)`.
-- ============================================================

alter table categories     enable row level security;
alter table items          enable row level security;
alter table store_settings enable row level security;

create policy "public read categories" on categories for select using (true);
create policy "public write categories" on categories for all using (true) with check (true);

create policy "public read items" on items for select using (true);
create policy "public write items" on items for all using (true) with check (true);

create policy "public read store_settings" on store_settings for select using (true);
create policy "public write store_settings" on store_settings for all using (true) with check (true);
