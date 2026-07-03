"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSettings } from "@/lib/settings-context";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Dashboard", icon: "📊", exact: true },
  { href: "/admin/produtos", label: "Produtos & Serviços", icon: "🗂️" },
  { href: "/admin/categorias", label: "Categorias", icon: "🏷️" },
  { href: "/admin/configuracoes", label: "Configurações", icon: "⚙️" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { settings } = useSettings();

  return (
    <aside className="flex w-full shrink-0 flex-col border-gray-200 bg-gray-950 text-gray-300 md:h-screen md:w-64 md:border-r">
      <div className="flex items-center gap-2 border-b border-white/10 px-5 py-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-sm font-bold text-white">
          {settings.brandName.slice(0, 2).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-white">{settings.brandName}</p>
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
      </div>
    </aside>
  );
}
