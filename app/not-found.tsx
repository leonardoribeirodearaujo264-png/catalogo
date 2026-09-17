import Link from "next/link";
import { CarIcon } from "@/components/icons";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-ink px-4 text-center">
      <CarIcon className="h-14 w-14 accent-text opacity-70" />
      <h1 className="font-display text-[clamp(1.75rem,5vw,2.5rem)] text-cream">Página não encontrada</h1>
      <p className="max-w-md text-[15px] leading-relaxed text-mute">
        O endereço não existe, o catálogo foi despublicado ou o veículo não está mais disponível.
      </p>
      <Link
        href="/"
        className="accent-bg inline-flex h-12 items-center rounded-xl px-6 text-[15px] font-semibold text-ink transition-all hover:brightness-110"
      >
        Voltar ao início
      </Link>
    </div>
  );
}
