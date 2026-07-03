# Catálogo Digital Universal

Plataforma multiusuário em **Next.js**: qualquer pessoa cria uma conta, monta seu próprio catálogo digital (produtos, serviços, categorias, marca) e recebe um link público para compartilhar no WhatsApp, Instagram etc. Funciona para qualquer nicho — lojas de roupas, restaurantes, delivery, cosméticos, eletrônicos, serviços, papelarias, conveniências, salões, clínicas, profissionais autônomos, escritórios, entre outros.

## Como funciona

- **Visitante**: abre `/catalogo/{slug}` de um negócio e só vê a vitrine pública (produtos/serviços ativos, categorias, busca, botão de WhatsApp). Nunca vê nada do painel administrativo.
- **Dono do negócio (admin)**: cria conta em `/register`, faz login em `/login` e gerencia o próprio catálogo em `/admin` — protegido, só acessível autenticado. RLS no banco garante que cada usuário só lê/edita os próprios dados.

## Tecnologias

- [Next.js](https://nextjs.org/) (App Router) + React + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) (Auth + banco de dados via Postgres/RLS) — **obrigatório**, a autenticação depende dele
- Pronto para deploy na [Vercel](https://vercel.com/)

## Estrutura de pastas

```
app/
  page.tsx                    # landing page do sistema (não é um catálogo)
  login/, register/           # autenticação
  catalogo/[slug]/             # vitrine pública de cada negócio (SSR)
  admin/                       # painel administrativo (protegido)
components/                   # componentes React (site, admin, ui/)
lib/                           # auth, contexts, Supabase, utils
types/                         # tipos TypeScript compartilhados
supabase/                      # setup.sql (schema + RLS + dados de exemplo)
proxy.ts                       # protege /admin, /login, /register (ver nota abaixo)
```

> **Nota sobre `proxy.ts`**: o Next.js 16 renomeou o arquivo `middleware.ts` para `proxy.ts` (mesma função, nome novo). É ele quem redireciona visitantes sem sessão para `/login` ao tentar acessar `/admin`, e quem redireciona quem já está logado para longe de `/login`/`/register`.

## Como rodar localmente

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`.

```bash
npm run build   # build de produção
npm run start   # roda o build de produção localmente
npm run lint    # checagem de lint
```

## Configurar o Supabase (obrigatório)

A autenticação e todos os dados do catálogo dependem do Supabase — não há modo 100% mockado nesta versão multiusuário.

1. Crie um projeto em [supabase.com](https://supabase.com/).
2. Em **Authentication → Providers → Email**, **desative "Confirm email"**. Isso é essencial: sem isso, o cadastro em `/register` não faz login automático (fica esperando confirmação por e-mail).
3. Em **Project Settings → API**, copie a **Project URL** e a **Publishable key** (ou `anon key`, em projetos mais antigos).
4. Copie `.env.example` para `.env.local` e preencha:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxx
   ```

5. Abra o **SQL Editor** do projeto, cole o conteúdo de `supabase/setup.sql` e rode. Cria as tabelas `cd_catalogs`, `cd_categories`, `cd_products`, `cd_leads` (prefixo `cd_` para não colidir com outras tabelas que já existirem no projeto), as policies de RLS e o bucket de storage `catalog-images` (upload de fotos dos produtos). Nesse primeiro momento a parte de "dados de exemplo" no fim do arquivo não insere nada — o catálogo de teste ainda não existe.
6. Rode `npm run dev`, acesse `/register` e crie uma conta informando o nome do negócio, e-mail e senha. Isso já cria seu catálogo automaticamente (login automático, direto no painel).
7. (Opcional) Para carregar os 12 itens de exemplo cobrindo vários nichos: cadastre-se com o nome do negócio **"RR Repuxação"**, depois rode `supabase/setup.sql` **de novo** no SQL Editor — dessa vez ele encontra o catálogo pelo slug `rr-repuxacao` e carrega os itens de exemplo + a logo (`public/logo-rr.png`). Se usou outro nome, troque o slug `rr-repuxacao` no bloco final do arquivo. É seguro rodar o arquivo quantas vezes precisar.

## Segurança

- Cada linha de `cd_catalogs`, `cd_categories`, `cd_products` e `cd_leads` só é editável pelo próprio dono (`auth.uid() = cd_catalogs.user_id`, verificado via RLS no Postgres) — a proteção real não depende do código do Next.js, é imposta pelo banco.
- Upload de imagens vai para o bucket `catalog-images` (Supabase Storage), dentro de uma pasta por catálogo (`{catalog_id}/arquivo.jpg`). RLS de storage garante que só o dono do catálogo envia/troca/apaga arquivos na própria pasta; leitura é pública (necessário para as imagens aparecerem no catálogo sem login).
- Visitantes anônimos só leem catálogos com `is_published = true` e itens/categorias com `active = true`.
- `leads` aceita inserção pública (para registrar quando alguém clica em "Comprar pelo WhatsApp"), mas só o dono do catálogo consegue listar (`/admin/pedidos`).
- Nunca exponha a `service_role key` do Supabase no navegador nem em variáveis `NEXT_PUBLIC_*` — ela ignora todo o RLS.

## Deploy na Vercel

1. Suba o projeto para o GitHub.
2. Importe o repositório em [vercel.com/new](https://vercel.com/new).
3. Configure as variáveis de ambiente do Supabase (mesmas do `.env.local`) em **Project Settings → Environment Variables**.
4. Clique em **Deploy**.

## Rotas

Públicas: `/`, `/login`, `/register`, `/catalogo/[slug]`, `/catalogo/[slug]/produto/[id]`, `/catalogo/[slug]/interesse`.

Privadas (exigem login): `/admin`, `/admin/produtos`, `/admin/categorias`, `/admin/configuracoes`, `/admin/link-publico`, `/admin/pedidos`.
