import Link from "next/link";
import { HeroBanner } from "@/components/hero-banner";
import { CategoryGrid } from "@/components/category-grid";
import { FeaturedItems } from "@/components/featured-items";
import { WhatsAppIcon, ArrowRightIcon } from "@/components/icons";

export default function HomePage() {
  return (
    <>
      <HeroBanner />

      <div className="bg-gray-950 pb-4">
        <div className="container-app">
          <div className="flex items-center gap-4 rounded-2xl bg-white/5 p-5 text-white">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#16a34a]">
              <WhatsAppIcon className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-sm font-bold">Compra 100% pelo WhatsApp</h3>
              <p className="text-xs text-white/60">Escolha o item, selecione a variação e finalize direto na conversa.</p>
            </div>
          </div>
        </div>
      </div>

      <CategoryGrid />
      <FeaturedItems />

      <section className="container-app py-16">
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-gray-200 bg-white px-6 py-12 text-center">
          <h2 className="text-2xl font-extrabold text-gray-900">Quer ver tudo o que temos?</h2>
          <p className="max-w-md text-sm text-gray-500">
            Navegue pelo catálogo completo, filtre por categoria e encontre exatamente o que precisa.
          </p>
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-3.5 text-sm font-bold text-white transition-transform hover:scale-[1.02]"
          >
            Ir para o catálogo
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
