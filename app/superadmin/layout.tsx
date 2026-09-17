"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";
import { isPlatformAdmin } from "@/lib/supabase/queries";
import { cn } from "@/lib/utils";
import { EmptyState, Skeleton } from "@/components/ui/feedback";
import { ButtonLink } from "@/components/ui/button";
import { CarIcon, ShieldIcon } from "@/components/icons";

const LINKS = [
  { href: "/superadmin", label: "Lojas", exact: true },
  { href: "/superadmin/planos", label: "Planos" },
  { href: "/superadmin/auditoria", label: "Auditoria" },
];

export default function SuperadminLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login?redirect=/superadmin");
      return;
    }
    // A checagem aqui é só para a interface: quem não é superadmin não
    // consegue ler nem escrever nada mesmo se forçar a rota, porque o RLS
    // usa cs_is_platform_admin() no banco.
    isPlatformAdmin(user.id).then(setAllowed);
  }, [loading, user, router]);

  if (loading || allowed === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink">
        <Skeleton className="h-10 w-48" />
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink px-4">
        <EmptyState
          icon={<ShieldIcon className="h-12 w-12" />}
          title="Área restrita"
          description="Esta área é exclusiva dos superadministradores da plataforma."
          action={
            <ButtonLink href="/admin" variant="outline">
              Ir para o painel da minha loja
            </ButtonLink>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-ink">
      <header className="border-b border-white/8">
        <div className="container-app flex h-[72px] items-center justify-between gap-4">
          <Link href="/superadmin" className="flex items-center gap-2.5">
            <CarIcon className="h-6 w-6 accent-text" />
            <span className="brand-wordmark text-[15px] uppercase text-cream">Car Select</span>
            <span className="accent-soft accent-text ml-1 rounded-md px-2 py-0.5 text-[11px] font-semibold">
              Superadmin
            </span>
          </Link>
          <Link href="/admin" className="text-sm text-mute transition-colors hover:text-cream">
            Minha loja
          </Link>
        </div>
      </header>

      <nav className="border-b border-white/8">
        <div className="container-app flex gap-6">
          {LINKS.map((link) => {
            const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative py-3.5 text-sm transition-colors",
                  active ? "text-cream" : "text-mute hover:text-cream",
                )}
              >
                {link.label}
                {active && <span className="accent-bg absolute bottom-0 left-0 h-0.5 w-full" />}
              </Link>
            );
          })}
        </div>
      </nav>

      <main className="container-app flex-1 py-8">{children}</main>
    </div>
  );
}
