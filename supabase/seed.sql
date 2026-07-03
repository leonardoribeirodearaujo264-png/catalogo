-- ============================================================
--  Dados de exemplo para a conta de teste "RR Repuxação".
--
--  IMPORTANTE: rode este arquivo DEPOIS de:
--    1) rodar supabase/schema.sql
--    2) criar a conta em /register com o nome do negócio
--       "RR Repuxação" (isso gera o catálogo com slug
--       'rr-repuxacao' automaticamente e é o que esse seed
--       procura abaixo)
--
--  Se você registrou com outro nome de negócio, troque o slug
--  'rr-repuxacao' abaixo pelo slug real do seu catálogo (você
--  encontra em /admin/link-publico).
-- ============================================================

-- Logo do negócio de teste (arquivo em /public/logo-rr.png no projeto).
update catalogs set logo_url = '/logo-rr.png' where slug = 'rr-repuxacao';

insert into categories (catalog_id, slug, name, description, icon, "order")
select id, v.slug, v.name, v.description, v.icon, v.ord
from catalogs, (values
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
where catalogs.slug = 'rr-repuxacao'
on conflict (catalog_id, slug) do nothing;

insert into products (catalog_id, category_id, slug, name, kind, description, price, price_compare, stock, variations, active, featured, promotional)
select
  c.id,
  (select id from categories where catalog_id = c.id and slug = v.category_slug),
  v.slug, v.name, v.kind, v.description, v.price, v.price_compare, v.stock, v.variations::jsonb, true, v.featured, v.promotional
from catalogs c, (values
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
