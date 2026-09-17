"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { AdminStoreProvider, useAdminStore } from "@/lib/admin-store-context";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { ErrorNote, Skeleton } from "@/components/ui/feedback";
import { ButtonLink } from "@/components/ui/button";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink">
        <Skeleton className="h-10 w-40" />
      </div>
    );
  }

  return (
    <AdminStoreProvider>
      <AdminShell>{children}</AdminShell>
    </AdminStoreProvider>
  );
}

function AdminShell({ children }: { children: ReactNode }) {
  const { loading, error, store } = useAdminStore();
  const router = useRouter();

  // Loja recém-criada ainda sem dados: manda completar o cadastro antes.
  useEffect(() => {
    if (!loading && store && store.onboardingStep > 0 && store.onboardingStep < 6) {
      router.replace("/onboarding");
    }
  }, [loading, store, router]);

  return (
    <div className="flex min-h-screen flex-col bg-ink md:flex-row">
      <AdminSidebar />
      <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-10">
        {error ? (
          <div className="mx-auto max-w-2xl">
            <ErrorNote>{error}</ErrorNote>
            <div className="mt-4">
              <ButtonLink href="/admin" variant="outline">
                Tentar de novo
              </ButtonLink>
            </div>
          </div>
        ) : loading ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-9 w-56" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-28 rounded-2xl" />
              ))}
            </div>
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
