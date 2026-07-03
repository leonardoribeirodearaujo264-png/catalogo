-- ============================================================
--  Catálogo Digital — SQL único (schema + seed)
--
--  As tabelas usam o prefixo "cd_" (cd_catalogs, cd_categories,
--  cd_products, cd_leads, cd_financial_transactions) de propósito:
--  este projeto Supabase já tem outras tabelas de outros testes
--  (ex.: "products", "categories" genéricos), então nomes sem
--  prefixo davam erro de coluna inexistente (a tabela antiga era
--  reaproveitada pelo "create table if not exists" e não tinha as
--  colunas certas).
--
--  Este arquivo é seguro de rodar de novo a qualquer momento —
--  além de "create table if not exists", usa "add column if not
--  exists" para novas colunas em tabelas já existentes (ex.: o
--  campo de layout do catálogo).
--
--  Como usar:
--    1) Cole este arquivo inteiro no SQL Editor do Supabase e
--       rode agora. Ele cria as tabelas, o RLS e o bucket de
--       storage "catalog-images" (upload de fotos dos itens). A
--       parte de "dados de exemplo" não vai inserir nada ainda,
--       porque o catálogo de teste não existe até alguém se
--       cadastrar.
--    2) Vá em /register no app e crie uma conta com o nome do
--       negócio "RR Repuxação" (gera o slug 'rr-repuxacao').
--    3) Cole e rode este MESMO arquivo de novo. Dessa vez ele
--       encontra o catálogo e carrega os 12 itens de exemplo +
--       a logo. É seguro rodar quantas vezes quiser (idempotente).
--
--  Se você registrou com outro nome de negócio, troque o slug
--  'rr-repuxacao' no bloco de dados de exemplo (final do arquivo)
--  pelo slug real do seu catálogo (você encontra em
--  /admin/link-publico).
-- ============================================================

create extension if not exists "pgcrypto";

-- ── Catálogos (um por usuário) ────────────────────────────────
create table if not exists cd_catalogs (
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

-- Migração: coluna de layout do catálogo público (adicionada depois
-- da primeira versão da tabela — "add column if not exists" garante
-- que rodar de novo em bancos já criados não quebra nada).
alter table cd_catalogs add column if not exists layout text not null default 'grade' check (layout in ('lista', 'grade'));

-- ── Categorias ────────────────────────────────────────────────
create table if not exists cd_categories (
  id          uuid primary key default gen_random_uuid(),
  catalog_id  uuid not null references cd_catalogs(id) on delete cascade,
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
create table if not exists cd_products (
  id            uuid primary key default gen_random_uuid(),
  catalog_id    uuid not null references cd_catalogs(id) on delete cascade,
  category_id   uuid references cd_categories(id) on delete set null,
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

create index if not exists idx_cd_categories_catalog on cd_categories(catalog_id);
create index if not exists idx_cd_products_catalog   on cd_products(catalog_id);
create index if not exists idx_cd_products_category  on cd_products(category_id);

-- ── Pedidos/Leads (interesse enviado pelo visitante) ─────────
create table if not exists cd_leads (
  id             uuid primary key default gen_random_uuid(),
  catalog_id     uuid not null references cd_catalogs(id) on delete cascade,
  customer_name  text,
  customer_phone text,
  items          jsonb not null default '[]'::jsonb,
  message        text,
  created_at     timestamptz not null default now()
);

create index if not exists idx_cd_leads_catalog on cd_leads(catalog_id);

-- ============================================================
--  Row Level Security
--
--  Cada usuário só lê/edita o PRÓPRIO catálogo (auth.uid() =
--  cd_catalogs.user_id). Visitantes anônimos só leem catálogos
--  com is_published = true e itens/categorias com active = true.
-- ============================================================

alter table cd_catalogs   enable row level security;
alter table cd_categories enable row level security;
alter table cd_products   enable row level security;
alter table cd_leads      enable row level security;

drop policy if exists "public read published catalogs" on cd_catalogs;
drop policy if exists "owner read own catalog"          on cd_catalogs;
drop policy if exists "owner insert own catalog"        on cd_catalogs;
drop policy if exists "owner update own catalog"        on cd_catalogs;
drop policy if exists "owner delete own catalog"        on cd_catalogs;

create policy "public read published catalogs" on cd_catalogs for select using (is_published = true);
create policy "owner read own catalog"   on cd_catalogs for select using (auth.uid() = user_id);
create policy "owner insert own catalog" on cd_catalogs for insert with check (auth.uid() = user_id);
create policy "owner update own catalog" on cd_catalogs for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner delete own catalog" on cd_catalogs for delete using (auth.uid() = user_id);

drop policy if exists "public read categories" on cd_categories;
drop policy if exists "owner read categories"   on cd_categories;
drop policy if exists "owner write categories"  on cd_categories;
drop policy if exists "owner update categories" on cd_categories;
drop policy if exists "owner delete categories" on cd_categories;

create policy "public read categories" on cd_categories for select using (
  active = true and exists (select 1 from cd_catalogs c where c.id = cd_categories.catalog_id and c.is_published = true)
);
create policy "owner read categories" on cd_categories for select using (
  exists (select 1 from cd_catalogs c where c.id = cd_categories.catalog_id and c.user_id = auth.uid())
);
create policy "owner write categories" on cd_categories for insert with check (
  exists (select 1 from cd_catalogs c where c.id = cd_categories.catalog_id and c.user_id = auth.uid())
);
create policy "owner update categories" on cd_categories for update using (
  exists (select 1 from cd_catalogs c where c.id = cd_categories.catalog_id and c.user_id = auth.uid())
) with check (
  exists (select 1 from cd_catalogs c where c.id = cd_categories.catalog_id and c.user_id = auth.uid())
);
create policy "owner delete categories" on cd_categories for delete using (
  exists (select 1 from cd_catalogs c where c.id = cd_categories.catalog_id and c.user_id = auth.uid())
);

drop policy if exists "public read products" on cd_products;
drop policy if exists "owner read products"   on cd_products;
drop policy if exists "owner write products"  on cd_products;
drop policy if exists "owner update products" on cd_products;
drop policy if exists "owner delete products" on cd_products;

create policy "public read products" on cd_products for select using (
  active = true and exists (select 1 from cd_catalogs c where c.id = cd_products.catalog_id and c.is_published = true)
);
create policy "owner read products" on cd_products for select using (
  exists (select 1 from cd_catalogs c where c.id = cd_products.catalog_id and c.user_id = auth.uid())
);
create policy "owner write products" on cd_products for insert with check (
  exists (select 1 from cd_catalogs c where c.id = cd_products.catalog_id and c.user_id = auth.uid())
);
create policy "owner update products" on cd_products for update using (
  exists (select 1 from cd_catalogs c where c.id = cd_products.catalog_id and c.user_id = auth.uid())
) with check (
  exists (select 1 from cd_catalogs c where c.id = cd_products.catalog_id and c.user_id = auth.uid())
);
create policy "owner delete products" on cd_products for delete using (
  exists (select 1 from cd_catalogs c where c.id = cd_products.catalog_id and c.user_id = auth.uid())
);

drop policy if exists "public insert leads" on cd_leads;
drop policy if exists "owner read leads"    on cd_leads;
drop policy if exists "owner delete leads"  on cd_leads;

create policy "public insert leads" on cd_leads for insert with check (
  exists (select 1 from cd_catalogs c where c.id = cd_leads.catalog_id and c.is_published = true)
);
create policy "owner read leads" on cd_leads for select using (
  exists (select 1 from cd_catalogs c where c.id = cd_leads.catalog_id and c.user_id = auth.uid())
);
create policy "owner delete leads" on cd_leads for delete using (
  exists (select 1 from cd_catalogs c where c.id = cd_leads.catalog_id and c.user_id = auth.uid())
);

-- ============================================================
--  Financeiro (lançamentos de receitas/despesas do dono do
--  catálogo). 100% privado — sem leitura pública em nenhuma
--  hipótese.
-- ============================================================

create table if not exists cd_financial_transactions (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  catalog_id     uuid not null references cd_catalogs(id) on delete cascade,
  type           text not null check (type in ('receita', 'despesa')),
  description    text not null,
  customer_name  text,
  product_id     uuid references cd_products(id) on delete set null,
  amount         numeric(10,2) not null default 0,
  due_date       date,
  paid_date      date,
  status         text not null default 'pendente' check (status in ('pendente', 'pago', 'atrasado', 'cancelado')),
  payment_method text check (payment_method in ('pix', 'dinheiro', 'cartao', 'boleto', 'transferencia', 'outro')),
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists idx_cd_fin_user     on cd_financial_transactions(user_id);
create index if not exists idx_cd_fin_catalog  on cd_financial_transactions(catalog_id);
create index if not exists idx_cd_fin_due_date on cd_financial_transactions(due_date);

alter table cd_financial_transactions enable row level security;

drop policy if exists "owner all financial_transactions" on cd_financial_transactions;
create policy "owner all financial_transactions" on cd_financial_transactions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
--  Storage — bucket para upload de imagens de produtos/serviços
--
--  Caminho dos arquivos: {catalog_id}/{arquivo}. As policies
--  abaixo garantem que só o dono do catálogo consegue enviar,
--  trocar ou apagar arquivos dentro da própria pasta; leitura é
--  pública (o bucket é público, necessário para o <img> no
--  catálogo funcionar sem autenticação).
-- ============================================================

insert into storage.buckets (id, name, public)
values ('catalog-images', 'catalog-images', true)
on conflict (id) do nothing;

drop policy if exists "public read catalog images"   on storage.objects;
drop policy if exists "owner upload catalog images"  on storage.objects;
drop policy if exists "owner update catalog images"  on storage.objects;
drop policy if exists "owner delete catalog images"  on storage.objects;

create policy "public read catalog images" on storage.objects for select using (
  bucket_id = 'catalog-images'
);

create policy "owner upload catalog images" on storage.objects for insert with check (
  bucket_id = 'catalog-images'
  and (storage.foldername(name))[1] in (select id::text from cd_catalogs where user_id = auth.uid())
);

create policy "owner update catalog images" on storage.objects for update using (
  bucket_id = 'catalog-images'
  and (storage.foldername(name))[1] in (select id::text from cd_catalogs where user_id = auth.uid())
);

create policy "owner delete catalog images" on storage.objects for delete using (
  bucket_id = 'catalog-images'
  and (storage.foldername(name))[1] in (select id::text from cd_catalogs where user_id = auth.uid())
);

-- ============================================================
--  Dados de exemplo para a conta de teste "RR Repuxação"
--
--  Só insere alguma coisa se já existir um catálogo com slug
--  'rr-repuxacao' (criado via /register). Antes disso, roda sem
--  erro e sem efeito — é seguro rodar o arquivo todo agora e de
--  novo depois de criar a conta.
-- ============================================================

update cd_catalogs set logo_url = '/logo-rr.png' where slug = 'rr-repuxacao';

insert into cd_categories (catalog_id, slug, name, description, icon, "order")
select id, v.slug, v.name, v.description, v.icon, v.ord
from cd_catalogs, (values
  ('moda-vestuario',          'Moda & Vestuário',           'Roupas, calçados e acessórios.',                         '👕', 1),
  ('alimentacao-delivery',    'Alimentação & Delivery',     'Pratos, marmitas e delivery.',                            '🍔', 2),
  ('beleza-cosmeticos',       'Beleza & Cosméticos',        'Skincare, maquiagem e perfumaria.',                       '💄', 3),
  ('eletronicos-tecnologia',  'Eletrônicos & Tecnologia',   'Acessórios, gadgets e eletrônicos.',                      '🎧', 4),
  ('servicos-profissionais',  'Serviços Profissionais',     'Consultorias, projetos e serviços sob demanda.',          '💼', 5),
  ('papelaria-escritorio',    'Papelaria & Escritório',     'Materiais para escritório e escola.',                     '🖊️', 6),
  ('conveniencia-mercado',    'Conveniência & Mercado',     'Itens do dia a dia e mercearia.',                         '🛒', 7),
  ('salao-estetica',          'Salão & Estética',           'Cortes, tratamentos e procedimentos estéticos.',          '💇', 8),
  ('saude-clinicas',          'Saúde & Clínicas',           'Consultas, exames e procedimentos.',                      '🩺', 9),
  ('autonomos-freelancers',   'Autônomos & Freelancers',    'Trabalho sob demanda de profissionais independentes.',    '🧑‍💻', 10)
) as v(slug, name, description, icon, ord)
where cd_catalogs.slug = 'rr-repuxacao'
on conflict (catalog_id, slug) do nothing;

insert into cd_products (catalog_id, category_id, slug, name, kind, description, price, price_compare, stock, variations, active, featured, promotional)
select
  c.id,
  (select id from cd_categories where catalog_id = c.id and slug = v.category_slug),
  v.slug, v.name, v.kind, v.description, v.price, v.price_compare, v.stock, v.variations::jsonb, true, v.featured, v.promotional
from cd_catalogs c, (values
  ('moda-vestuario', 'camisa-polo-piquet', 'Camisa Polo Piquet', 'produto',
   'Camisa polo em malha piquet 100% algodão, corte tradicional e caimento confortável. Disponível em vários tamanhos.',
   89.90, null, 42,
   '[{"id":"v1","name":"P","available":true},{"id":"v2","name":"M","available":true},{"id":"v3","name":"G","available":true},{"id":"v4","name":"GG","available":false}]',
   true, false),

  ('alimentacao-delivery', 'combo-marmita-fit', 'Combo Marmita Fit (5 unidades)', 'produto',
   'Combo com 5 marmitas fit balanceadas, montadas por nutricionista. Congeladas, prontas para aquecer. Opções de proteína à escolha.',
   99.90, 129.90, 15,
   '[{"id":"v1","name":"Frango","available":true},{"id":"v2","name":"Carne","available":true},{"id":"v3","name":"Vegetariano","available":true}]',
   true, true),

  ('beleza-cosmeticos', 'serum-facial-vitamina-c', 'Sérum Facial Vitamina C', 'produto',
   'Sérum antioxidante com vitamina C estabilizada, ácido hialurônico e niacinamida. Uniformiza o tom da pele e ilumina o rosto.',
   74.90, null, 0,
   '[{"id":"v1","name":"15ml","available":false},{"id":"v2","name":"30ml","available":false}]',
   false, false),

  ('eletronicos-tecnologia', 'fone-de-ouvido-bluetooth-tws', 'Fone de Ouvido Bluetooth TWS', 'produto',
   'Fone intra-auricular sem fio, Bluetooth 5.3, cancelamento de ruído ambiente, até 24h de bateria com o case de carregamento.',
   129.90, 189.90, 27,
   '[]', false, true),

  ('servicos-profissionais', 'consultoria-de-marketing-digital', 'Consultoria de Marketing Digital', 'servico',
   'Diagnóstico completo das redes sociais e anúncios do seu negócio, com plano de ação personalizado para os próximos 90 dias.',
   350.00, null, null,
   '[{"id":"v1","name":"Diagnóstico avulso","available":true},{"id":"v2","name":"Acompanhamento mensal","available":true,"price":890}]',
   true, false),

  ('papelaria-escritorio', 'kit-canetas-coloridas', 'Kit Canetas Coloridas (12 cores)', 'produto',
   'Kit com 12 canetas coloridas ponta fina, ideal para estudos, planner e cadernos de anotação.',
   34.90, null, 60,
   '[]', false, false),

  ('salao-estetica', 'corte-de-cabelo-masculino', 'Corte de Cabelo Masculino', 'servico',
   'Corte na tesoura e máquina, com acabamento na navalha. Ambiente climatizado e agendamento por WhatsApp.',
   45.00, null, null,
   '[{"id":"v1","name":"Corte simples","available":true},{"id":"v2","name":"Corte + barba","available":true,"price":70},{"id":"v3","name":"Corte + barba + sobrancelha","available":true,"price":90}]',
   false, false),

  ('saude-clinicas', 'limpeza-de-pele-profunda', 'Limpeza de Pele Profunda', 'servico',
   'Procedimento estético com higienização, esfoliação, extração e máscara calmante. Indicado a cada 30-45 dias.',
   180.00, null, null,
   '[]', true, false),

  ('conveniencia-mercado', 'cesta-basica-premium', 'Cesta Básica Premium', 'produto',
   'Cesta com 25 itens essenciais selecionados, incluindo arroz, feijão, óleo, café e produtos de limpeza.',
   149.90, null, 8,
   '[]', false, false),

  ('autonomos-freelancers', 'design-de-logotipo', 'Design de Logotipo', 'servico',
   'Criação de identidade visual com 3 propostas de logotipo, arquivos em alta resolução e manual de uso das cores.',
   250.00, null, null,
   '[{"id":"v1","name":"Pacote básico (1 proposta)","available":true},{"id":"v2","name":"Pacote completo (3 propostas + manual)","available":true,"price":450}]',
   false, false),

  ('moda-vestuario', 'tenis-esportivo-runner', 'Tênis Esportivo Runner', 'produto',
   'Tênis leve para corrida e caminhada, solado em EVA com amortecimento e cabedal respirável.',
   199.90, null, 0,
   '[{"id":"v1","name":"38","available":false},{"id":"v2","name":"40","available":false},{"id":"v3","name":"42","available":false}]',
   false, false),

  ('eletronicos-tecnologia', 'smartwatch-fit-pro', 'Smartwatch Fit Pro', 'produto',
   'Monitor de atividades com medição de batimentos, oxigenação, notificações do celular e resistência à água.',
   249.90, null, 19,
   '[]', true, false)
) as v(category_slug, slug, name, kind, description, price, price_compare, stock, variations, featured, promotional)
where c.slug = 'rr-repuxacao'
on conflict (catalog_id, slug) do nothing;
