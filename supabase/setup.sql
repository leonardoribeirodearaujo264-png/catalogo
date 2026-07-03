-- ============================================================
--  Catálogo Digital Universal — Setup completo do Supabase
--
--  Arquivo único: cria as tabelas, ativa o RLS e já carrega os
--  dados de exemplo. Cole tudo no SQL Editor do seu projeto
--  Supabase e clique em "Run".
--
--  (Este arquivo é só a junção de schema.sql + seed.sql — use
--  os dois separados se preferir rodar cada parte por vez.)
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

drop policy if exists "public read categories"  on categories;
drop policy if exists "public write categories" on categories;
drop policy if exists "public read items"       on items;
drop policy if exists "public write items"      on items;
drop policy if exists "public read store_settings"  on store_settings;
drop policy if exists "public write store_settings" on store_settings;

create policy "public read categories" on categories for select using (true);
create policy "public write categories" on categories for all using (true) with check (true);

create policy "public read items" on items for select using (true);
create policy "public write items" on items for all using (true) with check (true);

create policy "public read store_settings" on store_settings for select using (true);
create policy "public write store_settings" on store_settings for all using (true) with check (true);

-- ============================================================
--  Dados de exemplo (mesmo conteúdo de /data/*.ts)
-- ============================================================

insert into categories (slug, name, description, icon, "order") values
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
on conflict (slug) do nothing;

insert into items (slug, name, kind, category_id, description, price, price_compare, stock, variations, active, featured, promotional) values
  ('camisa-polo-piquet', 'Camisa Polo Piquet', 'produto',
   (select id from categories where slug = 'moda-vestuario'),
   'Camisa polo em malha piquet 100% algodão, corte tradicional e caimento confortável. Disponível em vários tamanhos.',
   89.90, null, 42,
   '[{"id":"v1","name":"P","available":true},{"id":"v2","name":"M","available":true},{"id":"v3","name":"G","available":true},{"id":"v4","name":"GG","available":false}]',
   true, true, false),

  ('combo-marmita-fit', 'Combo Marmita Fit (5 unidades)', 'produto',
   (select id from categories where slug = 'alimentacao-delivery'),
   'Combo com 5 marmitas fit balanceadas, montadas por nutricionista. Congeladas, prontas para aquecer. Opções de proteína à escolha.',
   99.90, 129.90, 15,
   '[{"id":"v1","name":"Frango","available":true},{"id":"v2","name":"Carne","available":true},{"id":"v3","name":"Vegetariano","available":true}]',
   true, true, true),

  ('serum-facial-vitamina-c', 'Sérum Facial Vitamina C', 'produto',
   (select id from categories where slug = 'beleza-cosmeticos'),
   'Sérum antioxidante com vitamina C estabilizada, ácido hialurônico e niacinamida. Uniformiza o tom da pele e ilumina o rosto.',
   74.90, null, 0,
   '[{"id":"v1","name":"15ml","available":false},{"id":"v2","name":"30ml","available":false}]',
   true, false, false),

  ('fone-de-ouvido-bluetooth-tws', 'Fone de Ouvido Bluetooth TWS', 'produto',
   (select id from categories where slug = 'eletronicos-tecnologia'),
   'Fone intra-auricular sem fio, Bluetooth 5.3, cancelamento de ruído ambiente, até 24h de bateria com o case de carregamento.',
   129.90, 189.90, 27,
   '[]', true, false, true),

  ('consultoria-de-marketing-digital', 'Consultoria de Marketing Digital', 'servico',
   (select id from categories where slug = 'servicos-profissionais'),
   'Diagnóstico completo das redes sociais e anúncios do seu negócio, com plano de ação personalizado para os próximos 90 dias.',
   350.00, null, null,
   '[{"id":"v1","name":"Diagnóstico avulso","available":true},{"id":"v2","name":"Acompanhamento mensal","available":true,"price":890}]',
   true, true, false),

  ('kit-canetas-coloridas', 'Kit Canetas Coloridas (12 cores)', 'produto',
   (select id from categories where slug = 'papelaria-escritorio'),
   'Kit com 12 canetas coloridas ponta fina, ideal para estudos, planner e cadernos de anotação.',
   34.90, null, 60,
   '[]', true, false, false),

  ('corte-de-cabelo-masculino', 'Corte de Cabelo Masculino', 'servico',
   (select id from categories where slug = 'salao-estetica'),
   'Corte na tesoura e máquina, com acabamento na navalha. Ambiente climatizado e agendamento por WhatsApp.',
   45.00, null, null,
   '[{"id":"v1","name":"Corte simples","available":true},{"id":"v2","name":"Corte + barba","available":true,"price":70},{"id":"v3","name":"Corte + barba + sobrancelha","available":true,"price":90}]',
   true, false, false),

  ('limpeza-de-pele-profunda', 'Limpeza de Pele Profunda', 'servico',
   (select id from categories where slug = 'saude-clinicas'),
   'Procedimento estético com higienização, esfoliação, extração e máscara calmante. Indicado a cada 30-45 dias.',
   180.00, null, null,
   '[]', true, true, false),

  ('cesta-basica-premium', 'Cesta Básica Premium', 'produto',
   (select id from categories where slug = 'conveniencia-mercado'),
   'Cesta com 25 itens essenciais selecionados, incluindo arroz, feijão, óleo, café e produtos de limpeza.',
   149.90, null, 8,
   '[]', true, false, false),

  ('design-de-logotipo', 'Design de Logotipo', 'servico',
   (select id from categories where slug = 'autonomos-freelancers'),
   'Criação de identidade visual com 3 propostas de logotipo, arquivos em alta resolução e manual de uso das cores.',
   250.00, null, null,
   '[{"id":"v1","name":"Pacote básico (1 proposta)","available":true},{"id":"v2","name":"Pacote completo (3 propostas + manual)","available":true,"price":450}]',
   true, false, false),

  ('tenis-esportivo-runner', 'Tênis Esportivo Runner', 'produto',
   (select id from categories where slug = 'moda-vestuario'),
   'Tênis leve para corrida e caminhada, solado em EVA com amortecimento e cabedal respirável.',
   199.90, null, 0,
   '[{"id":"v1","name":"38","available":false},{"id":"v2","name":"40","available":false},{"id":"v3","name":"42","available":false}]',
   true, false, false),

  ('smartwatch-fit-pro', 'Smartwatch Fit Pro', 'produto',
   (select id from categories where slug = 'eletronicos-tecnologia'),
   'Monitor de atividades com medição de batimentos, oxigenação, notificações do celular e resistência à água.',
   249.90, null, 19,
   '[]', true, true, false)
on conflict do nothing;

insert into store_settings (
  id, brand_name, niche, tagline, hero_title, hero_subtitle,
  whatsapp_number, whatsapp_default_message, primary_color, accent_color, address, social
) values (
  'default',
  'RR Repuxação',
  'Metalurgia & Repuxação de Metais',
  'Catálogo digital de produtos e serviços',
  'RR Repuxação',
  'Conheça nossos produtos e serviços e finalize seu pedido direto pelo WhatsApp.',
  '5598999999999',
  'Olá! Vim pelo catálogo digital e tenho interesse em:',
  '#111827',
  '#16a34a',
  '{"street":"Rua Exemplo, 123 - Centro","city":"São Luís","state":"MA","zip":"65000-000"}',
  '{"instagram":"https://instagram.com/","facebook":"https://facebook.com/"}'
)
on conflict (id) do nothing;
