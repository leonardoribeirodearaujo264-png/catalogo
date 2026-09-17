# CAR SELECT

Plataforma multiempresa de catálogos de veículos em **Next.js**. Cada loja cria sua conta, monta o próprio catálogo (veículos, fotos, marca, cores) e recebe um link público exclusivo para compartilhar no WhatsApp, Instagram ou cartão de visita.

Uma instalação atende várias lojas: dados, usuários e leads de cada uma ficam isolados no banco.

## Como funciona

- **Visitante**: abre `/loja/{slug}` e vê só a vitrine — banner, filtros, cards de veículo, página de cada carro, formulário de contato e botão de WhatsApp.
- **Loja**: cria conta em `/register`, passa pelo onboarding em `/onboarding` e administra tudo em `/admin` (estoque, fotos, leads, equipe, financeiro, personalização).
- **Superadministrador da plataforma**: `/superadmin` — todas as lojas, status, planos e auditoria.

## Tecnologias

- [Next.js 16](https://nextjs.org/) (App Router) + React 19 + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) — Auth, Postgres com RLS e Storage. **Obrigatório**: não há modo mockado.
- Pronto para deploy na [Vercel](https://vercel.com/)

## Estrutura de pastas

```
app/
  page.tsx                              # landing da plataforma
  login/, register/, onboarding/        # conta e configuração inicial da loja
  convite/                              # resgate de convite de colaborador
  loja/[slug]/                          # vitrine pública (SSR)
    veiculos/                           #   listagem com filtros
    veiculos/[vehicleSlug]/             #   página do veículo
    sobre/, contato/
  admin/                                # painel da loja (protegido)
  superadmin/                           # painel da plataforma (protegido)
components/site/                        # vitrine pública
components/admin/                       # painel
components/ui/                          # botões, campos, sheet, modal, toasts
lib/                                    # auth, contexts, Supabase, filtros, utils
types/                                  # store, vehicle, lead, financial
supabase/                               # setup.sql + patches + limpeza do schema antigo
proxy.ts                                # protege /admin, /superadmin e /onboarding
```

> **Sobre `proxy.ts`**: o Next.js 16 renomeou `middleware.ts` para `proxy.ts` (mesmo papel, nome novo). Ele é a primeira barreira das rotas autenticadas — quem é dono do quê continua sendo decidido pelo RLS no banco, a partir de `auth.uid()`.

## Rodar localmente

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`.

```bash
npm run build   # build de produção
npm run start   # roda o build localmente
npm run lint    # checagem de lint
```

## Configurar o Supabase (obrigatório)

1. Crie um projeto em [supabase.com](https://supabase.com/).
2. Em **Authentication → Providers → Email**, desative **"Confirm email"**. Sem isso o cadastro em `/register` não gera sessão e o onboarding não abre.
3. Em **Project Settings → API**, copie a **Project URL** e a **Publishable key** (ou `anon key`, em projetos antigos).
4. Copie `.env.example` para `.env.local` e preencha:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxx
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

5. Abra o **SQL Editor** e rode `supabase/setup.sql` inteiro. Ele é idempotente — pode rodar de novo a qualquer momento.
6. No fim do `setup.sql`, no bloco **SUPERADMIN**, troque o e-mail pelo seu, crie a conta em `/register` e rode o arquivo de novo. A partir daí `/superadmin` gerencia o resto sem tocar no banco.

Se você já tinha rodado uma versão anterior do `setup.sql`, rode também os `supabase/patch-0*.sql` na ordem.

### Migração do catálogo genérico

Quem vem da versão anterior (catálogo de produtos/serviços): o `setup.sql` **renomeia** `cd_catalogs` → `cs_stores` e `cd_financial_transactions` → `cs_financial_transactions`, sem perder dados. As tabelas do nicho antigo (`cd_products`, `cd_categories`, `cd_leads`) continuam no banco, protegidas por RLS, até você rodar `supabase/legacy-cleanup.sql` — que é opcional e destrutivo.

## Isolamento entre lojas

- Toda tabela de operação tem `store_id` e RLS baseado em `cs_store_members`.
- As funções `cs_is_store_member`, `cs_is_store_admin` e `cs_can` resolvem a identidade por `auth.uid()` — nunca por um id enviado pelo frontend.
- O Storage separa arquivos por `{store_id}/...`, e a policy do bucket exige que quem escreve seja membro daquela loja.
- Visitante anônimo só lê lojas publicadas e ativas, e só pode **inserir** leads — nunca lê.
- A `service_role key` do Supabase nunca entra no navegador nem em variável `NEXT_PUBLIC_*`: ela ignora todo o RLS.

## Perfis de acesso

| Perfil | Pode |
|---|---|
| Superadministrador | Ver todas as lojas, aprovar/bloquear, gerenciar planos e ver auditoria |
| Proprietário / Administrador da loja | Tudo dentro da própria loja, incluindo equipe e financeiro |
| Colaborador | Só o que o administrador liberar (cadastrar, editar, publicar, leads, relatórios, financeiro) |

Colaboradores entram por **convite com código**: o administrador gera o link em `/admin/equipe`, a pessoa cria a própria conta e resgata em `/convite`. O resgate roda numa função `SECURITY DEFINER` no banco — é a única forma de virar membro sem já ser administrador, e o papel vem sempre de quem convidou.
