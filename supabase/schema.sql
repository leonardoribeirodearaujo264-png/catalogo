-- ============================================================
--  Catálogo Digital Universal — Schema multiusuário (Supabase)
--
--  Como usar: abra o SQL Editor do seu projeto Supabase, cole
--  este arquivo inteiro e clique em "Run". Cada usuário que se
--  cadastra em /register ganha seu próprio catálogo (linha em
--  `catalogs`), com suas próprias categorias e produtos.
-- ============================================================

create extension if not exists "pgcrypto";

-- ── Catálogos (um por usuário) ────────────────────────────────
create table if not exists catalogs (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid not null unique references auth.users(id) on delete cascade,
  slug                     text not null unique,
  business_name            text not null,
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
  is_published             boolean not null default true,
  created_at               timestamptz not null default now()
);

-- ── Categorias ────────────────────────────────────────────────
create table if not exists categories (
  id          uuid primary key default gen_random_uuid(),
  catalog_id  uuid not null references catalogs(id) on delete cascade,
  slug        text not null,
  name        text not null,
  description text,
  icon        text not null default '🏷️',
  "order"     integer not null default 0,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  unique (catalog_id, slug)
);

-- ── Produtos e serviços ──────────────────────────────────────
create table if not exists products (
  id            uuid primary key default gen_random_uuid(),
  catalog_id    uuid not null references catalogs(id) on delete cascade,
  category_id   uuid references categories(id) on delete set null,
  slug          text not null,
  name          text not null,
  kind          text not null default 'produto' check (kind in ('produto', 'servico')),
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
  created_at    timestamptz not null default now(),
  unique (catalog_id, slug)
);

create index if not exists idx_categories_catalog on categories(catalog_id);
create index if not exists idx_products_catalog   on products(catalog_id);
create index if not exists idx_products_category  on products(category_id);

-- ── Pedidos/Leads (interesse enviado pelo visitante) ─────────
create table if not exists leads (
  id            uuid primary key default gen_random_uuid(),
  catalog_id    uuid not null references catalogs(id) on delete cascade,
  customer_name  text,
  customer_phone text,
  items         jsonb not null default '[]'::jsonb,
  message       text,
  created_at    timestamptz not null default now()
);

create index if not exists idx_leads_catalog on leads(catalog_id);

-- ============================================================
--  Row Level Security
--
--  Cada usuário só lê/edita o PRÓPRIO catálogo (auth.uid() =
--  catalogs.user_id). Visitantes anônimos só leem catálogos com
--  is_published = true e itens/categorias com active = true.
-- ============================================================

alter table catalogs   enable row level security;
alter table categories enable row level security;
alter table products   enable row level security;
alter table leads      enable row level security;

drop policy if exists "public read published catalogs" on catalogs;
drop policy if exists "owner read own catalog"          on catalogs;
drop policy if exists "owner insert own catalog"        on catalogs;
drop policy if exists "owner update own catalog"        on catalogs;
drop policy if exists "owner delete own catalog"        on catalogs;

create policy "public read published catalogs" on catalogs for select using (is_published = true);
create policy "owner read own catalog"   on catalogs for select using (auth.uid() = user_id);
create policy "owner insert own catalog" on catalogs for insert with check (auth.uid() = user_id);
create policy "owner update own catalog" on catalogs for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner delete own catalog" on catalogs for delete using (auth.uid() = user_id);

drop policy if exists "public read categories" on categories;
drop policy if exists "owner read categories"   on categories;
drop policy if exists "owner write categories"  on categories;
drop policy if exists "owner update categories" on categories;
drop policy if exists "owner delete categories" on categories;

create policy "public read categories" on categories for select using (
  active = true and exists (select 1 from catalogs c where c.id = categories.catalog_id and c.is_published = true)
);
create policy "owner read categories" on categories for select using (
  exists (select 1 from catalogs c where c.id = categories.catalog_id and c.user_id = auth.uid())
);
create policy "owner write categories" on categories for insert with check (
  exists (select 1 from catalogs c where c.id = categories.catalog_id and c.user_id = auth.uid())
);
create policy "owner update categories" on categories for update using (
  exists (select 1 from catalogs c where c.id = categories.catalog_id and c.user_id = auth.uid())
) with check (
  exists (select 1 from catalogs c where c.id = categories.catalog_id and c.user_id = auth.uid())
);
create policy "owner delete categories" on categories for delete using (
  exists (select 1 from catalogs c where c.id = categories.catalog_id and c.user_id = auth.uid())
);

drop policy if exists "public read products" on products;
drop policy if exists "owner read products"   on products;
drop policy if exists "owner write products"  on products;
drop policy if exists "owner update products" on products;
drop policy if exists "owner delete products" on products;

create policy "public read products" on products for select using (
  active = true and exists (select 1 from catalogs c where c.id = products.catalog_id and c.is_published = true)
);
create policy "owner read products" on products for select using (
  exists (select 1 from catalogs c where c.id = products.catalog_id and c.user_id = auth.uid())
);
create policy "owner write products" on products for insert with check (
  exists (select 1 from catalogs c where c.id = products.catalog_id and c.user_id = auth.uid())
);
create policy "owner update products" on products for update using (
  exists (select 1 from catalogs c where c.id = products.catalog_id and c.user_id = auth.uid())
) with check (
  exists (select 1 from catalogs c where c.id = products.catalog_id and c.user_id = auth.uid())
);
create policy "owner delete products" on products for delete using (
  exists (select 1 from catalogs c where c.id = products.catalog_id and c.user_id = auth.uid())
);

drop policy if exists "public insert leads" on leads;
drop policy if exists "owner read leads"    on leads;
drop policy if exists "owner delete leads"  on leads;

create policy "public insert leads" on leads for insert with check (
  exists (select 1 from catalogs c where c.id = leads.catalog_id and c.is_published = true)
);
create policy "owner read leads" on leads for select using (
  exists (select 1 from catalogs c where c.id = leads.catalog_id and c.user_id = auth.uid())
);
create policy "owner delete leads" on leads for delete using (
  exists (select 1 from catalogs c where c.id = leads.catalog_id and c.user_id = auth.uid())
);
