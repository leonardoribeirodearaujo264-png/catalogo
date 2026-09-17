-- ============================================================
--  CAR SELECT — correção 01
--
--  Rode este trecho no SQL Editor do Supabase se você já executou o
--  setup.sql antes desta correção. (Quem rodar o setup.sql atualizado
--  do zero não precisa: a policy já está lá.)
--
--  O QUE ERA
--  Criar uma loja falhava com "new row violates row-level security
--  policy for table cs_stores". O INSERT em si era permitido; o que
--  falhava era devolver a linha criada (INSERT ... RETURNING): a loja
--  nasce despublicada (a policy pública não vê) e o vínculo de dono em
--  cs_store_members só é gravado por um trigger AFTER INSERT, que ainda
--  não rodou quando o Postgres testa a visibilidade da linha nova.
--
--  A CORREÇÃO
--  Uma policy de leitura pelo próprio owner_id, que não depende de
--  trigger nenhum. Continua valendo o mesmo princípio: a identidade vem
--  de auth.uid(), nunca de um id enviado pelo frontend.
-- ============================================================

drop policy if exists "stores owner read" on cs_stores;

create policy "stores owner read" on cs_stores for select
  using (auth.uid() = owner_id);
