"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { AdminCatalogProvider } from "@/lib/admin-catalog-context";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-sm text-gray-400">
        Carregando...
      </div>
    );
  }

  return (
    <AdminCatalogProvider>
      <div className="flex min-h-screen flex-col bg-gray-50 md:flex-row">
        <AdminSidebar />
        <main className="flex-1 overflow-x-hidden p-5 md:p-10">{children}</main>
      </div>
    </AdminCatalogProvider>
  );
}
