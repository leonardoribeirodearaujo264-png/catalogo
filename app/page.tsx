import Link from "next/link";
import { getPublicClient } from "@/lib/supabase/public-client";
import { fetchPlans } from "@/lib/supabase/queries";
import { formatPrice } from "@/lib/utils";
import {
  ArrowRightIcon,
  CarIcon,
  ChartIcon,
  CheckIcon,
  ImageIcon,
  LockIcon,
  UsersIcon,
  WhatsAppIcon,
} from "@/components/icons";

export const revalidate = 300;

const FEATURES = [
  {
    icon: CarIcon,
    title: "Estoque completo",
    description: "Cadastro com marca, versão, câmbio, opcionais, fotos e status de cada veículo.",
  },
  {
    icon: ImageIcon,
    title: "Vitrine premium",
    description: "Catálogo público com a sua marca, filtros de verdade e página para cada carro.",
  },
  {
    icon: WhatsAppIcon,
    title: "Leads no WhatsApp",
    description: "Mensagem pronta com o veículo e o contato registrado no painel automaticamente.",
  },
  {
    icon: UsersIcon,
    title: "Equipe com permissões",
    description: "Convide vendedores e defina quem cadastra, publica e atende os leads.",
  },
  {
    icon: ChartIcon,
    title: "Indicadores",
    description: "Visualizações do catálogo, veículos mais vistos e funil de atendimento.",
  },
  {
    icon: LockIcon,
    title: "Dados isolados",
    description: "Cada loja enxerga só os próprios dados, com regras aplicadas no banco.",
  },
];

export default async function LandingPage() {
  const client = getPublicClient();
  const plans = client ? await fetchPlans(client).catch(() => []) : [];

  return (
    <div className="flex min-h-screen flex-col bg-ink">
      <header className="border-b border-white/8">
        <div className="container-app flex h-[72px] items-center justify-between">
          <span className="flex items-center gap-2.5">
            <CarIcon className="h-6 w-6 accent-text" />
            <span className="brand-wordmark text-[15px] uppercase text-cream sm:text-[17px]">Car Select</span>
          </span>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="inline-flex h-10 items-center rounded-xl px-4 text-sm text-mute transition-colors hover:text-cream"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="accent-bg inline-flex h-10 items-center rounded-xl px-5 text-sm font-semibold text-ink transition-all hover:brightness-110"
            >
              Criar catálogo
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-white/8">
          <div className="absolute inset-0 bg-linear-to-br from-graphite-900 via-ink to-graphite-950" />
          <div className="container-app relative py-20 text-center md:py-28">
            <p className="eyebrow mb-6">Plataforma para lojas de veículos</p>
            <h1 className="font-display mx-auto max-w-3xl text-[clamp(2.25rem,6vw,4rem)] leading-[1.05] text-cream">
              O catálogo digital da sua loja, com cara de concessionária premium
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-mute sm:text-base">
              Cadastre seu estoque, personalize as cores e a marca, e compartilhe um link exclusivo com
              seus clientes. Cada loja tem painel, dados e leads separados.
            </p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="accent-bg inline-flex h-12 items-center justify-center gap-2.5 rounded-xl px-7 text-[15px] font-semibold text-ink transition-all hover:brightness-110"
              >
                Criar minha loja
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-white/20 px-7 text-[15px] text-cream transition-colors hover:border-white/45 hover:bg-white/5"
              >
                Já tenho conta
              </Link>
            </div>
            <p className="mt-6 text-[13px] text-graphite-500">
              Seu link fica assim: <span className="accent-text">carselect.com.br/loja/sua-loja</span>
            </p>
          </div>
        </section>

        <section className="container-app py-16 md:py-24">
          <h2 className="font-display mb-12 text-center text-[clamp(1.75rem,4vw,2.5rem)] text-cream">
            Tudo que a loja precisa em um lugar
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="surface rounded-2xl p-6">
                <span className="accent-border accent-text mb-4 flex h-11 w-11 items-center justify-center rounded-full border">
                  <feature.icon className="h-5 w-5" />
                </span>
                <h3 className="text-[15px] font-semibold text-cream">{feature.title}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-mute">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {plans.length > 0 && (
          <section className="border-t border-white/8 bg-graphite-950 py-16 md:py-24">
            <div className="container-app">
              <h2 className="font-display mb-12 text-center text-[clamp(1.75rem,4vw,2.5rem)] text-cream">
                Planos
              </h2>
              <div className="grid gap-5 md:grid-cols-3">
                {plans.map((plan, index) => (
                  <div
                    key={plan.id}
                    className={`surface flex flex-col rounded-2xl p-7 ${index === 1 ? "accent-border" : ""}`}
                  >
                    <h3 className="font-display text-xl text-cream">{plan.name}</h3>
                    <p className="mt-1 text-[13px] text-mute">{plan.description}</p>
                    <p className="font-display mt-5 text-3xl text-cream">
                      {plan.priceMonthly > 0 ? formatPrice(plan.priceMonthly) : "Grátis"}
                      {plan.priceMonthly > 0 && (
                        <span className="text-sm font-normal text-mute">/mês</span>
                      )}
                    </p>
                    <ul className="mt-6 flex flex-1 flex-col gap-2.5">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2.5 text-[13.5px] text-mute">
                          <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 accent-text" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href="/register"
                      className="mt-7 inline-flex h-11 items-center justify-center rounded-xl border border-white/15 text-sm text-cream transition-colors hover:accent-border hover:accent-text"
                    >
                      Começar
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-white/8">
        <div className="container-app flex flex-col items-center justify-between gap-2 py-6 text-[12px] text-graphite-500 sm:flex-row">
          <span className="brand-wordmark uppercase text-mute">Car Select</span>
          <p>© {new Date().getFullYear()} Car Select. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
