import Link from "next/link";
import { ArrowRightIcon, WhatsAppIcon } from "@/components/icons";

const FEATURES = [
  {
    icon: "🗂️",
    title: "Qualquer tipo de negócio",
    description: "Roupas, comida, beleza, eletrônicos, serviços, salões, clínicas... o catálogo se adapta ao seu nicho.",
  },
  {
    icon: "💬",
    title: "Venda pelo WhatsApp",
    description: "Cada produto ou serviço tem um botão de compra que já monta a mensagem pronta no WhatsApp.",
  },
  {
    icon: "🔗",
    title: "Um link só para compartilhar",
    description: "Seu catálogo ganha um endereço próprio para postar no Instagram, WhatsApp ou onde quiser.",
  },
  {
    icon: "⚙️",
    title: "Painel simples",
    description: "Cadastre produtos, categorias e configure sua marca sem precisar mexer em código.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="border-b border-gray-100">
        <div className="container-app flex h-16 items-center justify-between">
          <span className="text-base font-extrabold text-gray-900 sm:text-lg">Catálogo Digital Universal</span>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 sm:px-4"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-800 sm:px-4"
            >
              Criar conta
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="container-app flex flex-col items-center gap-6 py-16 text-center sm:py-24">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-gray-600">
            Catálogo digital para qualquer negócio
          </span>
          <h1 className="max-w-2xl text-3xl font-extrabold leading-tight text-gray-900 sm:text-5xl">
            Crie seu catálogo digital e compartilhe um link com seus clientes
          </h1>
          <p className="max-w-xl text-base text-gray-500 sm:text-lg">
            Cadastre produtos e serviços, personalize sua marca e receba pedidos direto pelo WhatsApp — sem precisar
            programar nada.
          </p>
          <div className="flex w-full max-w-sm flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              href="/register"
              className="flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-6 py-3.5 text-sm font-bold text-white transition-transform hover:scale-[1.02]"
            >
              Criar minha conta grátis
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-6 py-3.5 text-sm font-bold text-gray-700 hover:bg-gray-50"
            >
              Já tenho conta
            </Link>
          </div>
        </section>

        <section className="border-t border-gray-100 bg-gray-50 py-14 sm:py-20">
          <div className="container-app grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="rounded-2xl border border-gray-200 bg-white p-5">
                <span className="text-2xl">{feature.icon}</span>
                <h3 className="mt-3 text-sm font-bold text-gray-900">{feature.title}</h3>
                <p className="mt-1.5 text-sm text-gray-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container-app py-14 text-center sm:py-20">
          <div className="mx-auto flex max-w-xl flex-col items-center gap-4 rounded-3xl bg-gray-950 px-6 py-12 text-white">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#16a34a]">
              <WhatsAppIcon className="h-5 w-5" />
            </span>
            <h2 className="text-xl font-extrabold sm:text-2xl">Pronto para vender pelo seu link?</h2>
            <p className="text-sm text-white/70">Crie sua conta agora e monte seu catálogo em poucos minutos.</p>
            <Link
              href="/register"
              className="mt-2 inline-flex items-center gap-2 rounded-xl bg-[#16a34a] px-6 py-3.5 text-sm font-bold text-white transition-transform hover:scale-[1.02]"
            >
              Criar minha conta grátis
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-100 py-6">
        <p className="container-app text-center text-xs text-gray-400">
          Catálogo Digital Universal — crie catálogos para qualquer nicho de negócio.
        </p>
      </footer>
    </div>
  );
}
