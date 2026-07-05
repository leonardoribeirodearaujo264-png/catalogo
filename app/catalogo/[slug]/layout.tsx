import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { getPublicClient } from "@/lib/supabase/public-client";
import { fetchPublicCategories, fetchPublicProducts, fetchPublishedCatalogBySlug } from "@/lib/supabase/queries";
import { CatalogViewProvider } from "@/lib/catalog-view-context";
import { TopUtilityBar } from "@/components/top-utility-bar";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CartDrawer } from "@/components/cart-drawer";
import { CartCheckoutBar } from "@/components/cart-checkout-bar";
import { AddToCartToast } from "@/components/add-to-cart-toast";
import { AddressSavedToast } from "@/components/address-saved-toast";

export default async function CatalogLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const client = getPublicClient();
  if (!client) notFound();

  let catalog;
  try {
    catalog = await fetchPublishedCatalogBySlug(client, slug);
  } catch (err) {
    console.error("Erro ao buscar catálogo (o supabase/setup.sql já foi rodado no Supabase?):", err);
    notFound();
  }
  if (!catalog) notFound();

  const [categories, items] = await Promise.all([
    fetchPublicCategories(client, catalog.id).catch(() => []),
    fetchPublicProducts(client, catalog.id).catch(() => []),
  ]);

  return (
    <CatalogViewProvider catalog={catalog} categories={categories} items={items}>
      <TopUtilityBar />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <CartDrawer />
      <CartCheckoutBar />
      <AddToCartToast />
      <AddressSavedToast />
    </CatalogViewProvider>
  );
}
