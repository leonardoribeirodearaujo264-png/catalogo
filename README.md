# Catálogo Digital Universal (RR Repuxação)

Aplicação em **Next.js** para criação de catálogos digitais adaptáveis a **qualquer nicho de negócio**: lojas de roupas, restaurantes, delivery, cosméticos, eletrônicos, serviços, papelarias, conveniências, salões, clínicas, profissionais autônomos, escritórios e muito mais.

Cadastre produtos, serviços, categorias, preços, imagens, descrições e variações, e finalize as vendas direto pelo **WhatsApp**.

> Este projeto nasceu como a modernização do antigo catálogo em PHP "Podz Express", reescrito do zero em Next.js com arquitetura limpa e escalável. A marca padrão configurada é **RR Repuxação**, mas nada no código está preso a esse nicho — troque tudo em `/admin/configuracoes`.

## Tecnologias

- [Next.js](https://nextjs.org/) (App Router) + React + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) como banco de dados (opcional — veja abaixo)
- Pronto para deploy na [Vercel](https://vercel.com/)

## Estrutura de pastas

```
app/                    # Rotas (App Router)
  (site)/               # Site público: home, catálogo, produto, lista de interesse
  admin/                 # Painel administrativo
components/            # Componentes React (site, admin, ui/)
lib/                    # Contextos (catálogo, configurações, interesse), Supabase, utils
data/                   # Dados mockados (categorias, itens, configurações padrão)
types/                  # Tipos TypeScript compartilhados
supabase/               # schema.sql e seed.sql para o banco de dados
public/                 # Arquivos estáticos
```

## Funcionalidades

- Página inicial com banner, categorias e itens em destaque
- Catálogo completo com busca e filtro por categoria
- Página de detalhe de produto/serviço com variações (tamanho, sabor, pacote de serviço etc.)
- Botão de compra pelo WhatsApp com mensagem automática (produto + variação + preço)
- Lista de interesse (carrinho simples) que gera uma mensagem consolidada para o WhatsApp
- Painel `/admin` para cadastrar, editar e excluir produtos/serviços e categorias
- `/admin/configuracoes` para personalizar marca, logo, cores, banner, nicho, WhatsApp, endereço e redes sociais
- Totalmente responsivo (celular, tablet, desktop)

## Como rodar localmente

```bash
npm install
npm run dev
```

Acesse:

```
http://localhost:3000
```

Sem nenhuma configuração adicional, o app já funciona com **dados mockados** (arquivos em `/data`), guardando as edições feitas no `/admin` no `localStorage` do navegador.

Outros comandos úteis:

```bash
npm run build   # build de produção
npm run start   # roda o build de produção localmente
npm run lint    # checagem de lint
```

## Conectar ao Supabase (opcional, recomendado)

O projeto já vem com o cliente do Supabase integrado. Quando as variáveis de ambiente abaixo estão presentes, o catálogo e o painel admin passam a ler e escrever direto no banco; sem elas, tudo continua funcionando com os dados mockados.

1. Crie um projeto em [supabase.com](https://supabase.com/).
2. Em **Project Settings > API**, copie a **Project URL** e a **Publishable key** (ou a `anon key`, em projetos mais antigos).
3. Copie `.env.example` para `.env.local` e preencha:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxx
   ```

4. Abra o **SQL Editor** do seu projeto Supabase e rode, nessa ordem:
   - `supabase/schema.sql` — cria as tabelas `categories`, `items` e `store_settings` com as policies de RLS.
   - `supabase/seed.sql` — carrega os mesmos dados de exemplo que já existem em `/data` (opcional).
5. Reinicie `npm run dev`.

> ⚠️ **Segurança**: o painel `/admin` ainda não tem tela de login. As policies de RLS em `schema.sql` liberam leitura e escrita para a chave pública só para o catálogo funcionar de ponta a ponta sem backend próprio. Antes de usar em produção com dados reais, adicione autenticação (ex.: Supabase Auth) e restrinja as policies de escrita a usuários autenticados.
>
> Nunca exponha a `service_role key` do Supabase no navegador nem em variáveis `NEXT_PUBLIC_*` — ela ignora todo o RLS.

## Deploy na Vercel

1. Suba o projeto para o GitHub (veja abaixo).
2. Importe o repositório em [vercel.com/new](https://vercel.com/new).
3. Se estiver usando Supabase, configure as variáveis de ambiente do passo anterior em **Project Settings > Environment Variables** na Vercel.
4. Clique em **Deploy**.

## Preparar para o GitHub

```bash
git init
git add .
git commit -m "Catálogo digital universal em Next.js"
git branch -M main
git remote add origin <url-do-seu-repositorio>
git push -u origin main
```

O `.gitignore` já exclui `node_modules`, `.next`, arquivos `.env*` (exceto `.env.example`) e outros artefatos de build.

## Personalização

Tudo que identifica visualmente a marca fica em `/admin/configuracoes`: nome, nicho, logo, banner, cores, textos da página inicial, número de WhatsApp, endereço e redes sociais — sem precisar mexer em código. Para trocar os dados de exemplo, edite `/data/categories.ts` e `/data/products.ts` (ou as tabelas do Supabase, se estiver conectado).
