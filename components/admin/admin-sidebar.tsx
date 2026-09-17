"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAdminStore } from "@/lib/admin-store-context";
import { signOut } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { ROLE_LABELS } from "@/types/store";
import {
  CarIcon,
  ChartIcon,
  ChatIcon,
  CloseIcon,
  LinkIcon,
  MenuIcon,
  SettingsIcon,
  ShieldIcon,
  UsersIcon,
  WalletIcon,
} from "@/components/icons";

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { store, role, permissions, isPlatformAdmin } = useAdminStore();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/admin", label: "Dashboard", Icon: ChartIcon, exact: true, allowed: true },
    { href: "/admin/veiculos", label: "Veículos", Icon: CarIcon, allowed: true },
    { href: "/admin/leads", label: "Leads", Icon: ChatIcon, allowed: permissions.leads },
    { href: "/admin/financeiro", label: "Financeiro", Icon: WalletIcon, allowed: permissions.finance },
    { href: "/admin/equipe", label: "Equipe", Icon: UsersIcon, allowed: role !== "collaborator" },
    { href: "/admin/loja", label: "Minha loja", Icon: SettingsIcon, allowed: role !== "collaborator" },
    { href: "/admin/link-publico", label: "Link público", Icon: LinkIcon, allowed: true },
  ].filter((link) => link.allowed);

  async function handleLogout() {
    await signOut();
    router.push("/login");
  }

  const storeName = store?.name ?? "Minha loja";

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {links.map(({ href, label, Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-colors",
              active ? "accent-soft accent-text font-semibold" : "text-mute hover:bg-white/5 hover:text-cream",
            )}
          >
            <Icon className="h-4.5 w-4.5" />
            {label}
          </Link>
        );
      })}

      {isPlatformAdmin && (
        <Link
          href="/superadmin"
          className={cn(
            "mt-2 flex items-center gap-3 rounded-xl border border-white/10 px-3.5 py-2.5 text-sm transition-colors",
            pathname.startsWith("/superadmin") ? "accent-soft accent-text" : "text-mute hover:text-cream",
          )}
        >
          <ShieldIcon className="h-4.5 w-4.5" />
          Superadmin
        </Link>
      )}
    </nav>
  );

  const footer = (
    <div className="border-t border-white/8 p-3">
      {store && (
        <Link
          href={`/loja/${store.slug}`}
          target="_blank"
          className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-mute transition-colors hover:bg-white/5 hover:text-cream"
        >
          <LinkIcon className="h-4.5 w-4.5" />
          Ver catálogo público
        </Link>
      )}
      <button
        onClick={handleLogout}
        className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm text-red-400 transition-colors hover:bg-red-500/10"
      >
        <CloseIcon className="h-4.5 w-4.5" />
        Sair
      </button>
    </div>
  );

  const brand = (
    <div className="flex min-w-0 items-center gap-3">
      {store?.logoUrl ? (
        <Image
          src={store.logoUrl}
          alt={storeName}
          width={40}
          height={40}
          className="h-10 w-10 rounded-lg object-contain"
        />
      ) : (
        <span className="accent-soft accent-text flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold">
          {storeName.slice(0, 2).toUpperCase()}
        </span>
      )}
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-cream">{storeName}</p>
        <p className="text-[11px] text-graphite-500">{ROLE_LABELS[role]}</p>
      </div>
    </div>
  );

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/8 bg-graphite-950 px-4 py-3 md:hidden">
        {brand}
        <button
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/12 text-cream"
        >
          {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
        </button>
      </header>

      {open && (
        <div className="animate-fade-in border-b border-white/8 bg-graphite-950 md:hidden">
          {nav}
          {footer}
        </div>
      )}

      <aside className="hidden w-[248px] shrink-0 flex-col border-r border-white/8 bg-graphite-950 md:sticky md:top-0 md:flex md:h-screen">
        <div className="border-b border-white/8 px-4 py-5">{brand}</div>
        {nav}
        {footer}
      </aside>
    </>
  );
}
