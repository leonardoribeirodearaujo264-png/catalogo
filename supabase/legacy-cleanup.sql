-- ============================================================
--  CAR SELECT — remoção das tabelas do nicho anterior
--
--  OPCIONAL e DESTRUTIVO. Rode só depois de conferir que não
--  precisa mais dos dados do catálogo genérico antigo
--  (produtos, categorias e pedidos).
--
--  O setup.sql NÃO chama este arquivo. As tabelas abaixo ficam
--  no banco, protegidas por RLS, até você decidir apagá-las.
--
--  Sugestão: antes de rodar, exporte o que quiser guardar:
--    select * from cd_products;
--    select * from cd_categories;
--    select * from cd_leads;
-- ============================================================

-- Colunas do financeiro que apontavam para as tabelas antigas.
alter table if exists cs_financial_transactions drop column if exists product_id;
alter table if exists cs_financial_transactions drop column if exists order_id;

drop trigger if exists trg_cd_leads_set_user_id on cd_leads;
drop function if exists cd_set_lead_user_id();

drop table if exists cd_products   cascade;
drop table if exists cd_categories cascade;
drop table if exists cd_leads      cascade;

-- Bucket de imagens do catálogo antigo. Os arquivos precisam ser
-- apagados antes (Storage > catalog-images > selecionar tudo > delete),
-- senão o Postgres recusa remover o bucket.
-- delete from storage.buckets where id = 'catalog-images';
