import type { ReactNode } from "react";

/**
 * Cabeçalho das páginas internas. O header da vitrine é fixo, então é aqui
 * que fica o respiro do topo — assim nenhuma página precisa lembrar disso.
 */
export function PageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <section className="band glow-accent">
      <div className="container-app pb-10 pt-[104px] md:pb-14 md:pt-[136px]">
        <p className="eyebrow mb-3">{eyebrow}</p>
        <h1 className="font-display text-h1 max-w-3xl text-cream">{title}</h1>
        {description && (
          <p className="mt-4 max-w-2xl text-[15.5px] leading-relaxed text-mute md:text-[17px]">{description}</p>
        )}
        {children}
      </div>
    </section>
  );
}
