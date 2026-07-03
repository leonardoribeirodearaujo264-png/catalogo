"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAdminCatalog } from "@/lib/admin-catalog-context";
import { signOut } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { CloseIcon, MenuIcon } from "@/components/icons";

const links = [
  { href: "/admin", label: "Dashboard", icon: "📊", exact: true },
  { href: "/admin/produtos", label: "Produtos & Serviços", icon: "🗂️" },
  { href: "/admin/categorias", label: "Categorias", icon: "🏷️" },
  { href: "/admin/financeiro", label: "Financeiro", icon: "💰" },
  { href: "/admin/pedidos", label: "Pedidos", icon: "📬" },
  { href: "/admin/link-publico", label: "Link público", icon: "🔗" },
  { href: "/admin/configuracoes", label: "Configurações", icon: "⚙️" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { catalog } = useAdminCatalog();
  const [mobileOpen, setMobileOpen] = useState(false);
  const brandName = catalog?.businessName ?? "Meu catálogo";

  async function handleLogout() {
    await signOut();
    router.push("/login");
  }

  return (
    <>
      {/* Mobile: barra superior compacta */}
      <header className="flex items-center justify-between border-b border-gray-200 bg-gray-950 px-4 py-3 text-white md:hidden">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-xs font-bold">
            {brandName.slice(0, 2).toUpperCase()}
          </span>
          <span className="truncate text-sm font-bold">{brandName}</span>
        </div>
        <button
          className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white/10"
          aria-label="Menu"
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
        </button>
      </header>

      {mobileOpen && (
        <nav className="border-b border-gray-200 bg-gray-950 p-3 text-gray-300 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((link) => {
              const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold",
                    active ? "bg-white/10 text-white" : "text-gray-400",
                  )}
                >
                  <span>{link.icon}</span>
                  {link.label}
                </Link>
              );
            })}
            <Link href="/" className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-400">
              ← Voltar ao site
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-red-400"
            >
              Sair
            </button>
          </div>
        </nav>
      )}

      {/* Desktop: sidebar vertical */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-gray-200 bg-gray-950 text-gray-300 md:flex md:h-screen">
        <div className="flex items-center gap-2 border-b border-white/10 px-5 py-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-sm font-bold text-white">
            {brandName.slice(0, 2).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white">{brandName}</p>
            <p className="text-[11px] text-gray-500">Painel administrativo</p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-3">
          {links.map((link) => {
            const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors",
                  active ? "bg-white/10 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white",
                )}
              >
                <span>{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          <Link href="/" className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-400 hover:bg-white/5 hover:text-white">
            ← Voltar ao site
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-red-400 hover:bg-white/5"
          >
            Sair
          </button>
        </div>
      </aside>
    </>
  );
}
