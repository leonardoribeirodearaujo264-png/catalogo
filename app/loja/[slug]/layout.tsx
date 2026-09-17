import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { getPublicClient } from "@/lib/supabase/public-client";
import { fetchPublicStoreBySlug, fetchPublicVehicles } from "@/lib/supabase/queries";
import { StoreViewProvider } from "@/lib/store-view-context";
import { FavoritesProvider } from "@/lib/favorites-context";
import { StoreHeader } from "@/components/site/store-header";
import { MobileActionBar, StoreFooter, WhatsAppFab } from "@/components/site/store-sections";
import { StoreViewTracker } from "@/components/site/view-tracker";
import { hexToRgba } from "@/lib/color";

// A vitrine é renderizada no servidor e revalidada periodicamente: bom para
// SEO e para o tempo de carregamento, sem deixar o catálogo desatualizado.
export const revalidate = 60;

async function loadStore(slug: string) {
  const client = getPublicClient();
  if (!client) return null;
  try {
    return await fetchPublicStoreBySlug(client, slug);
  } catch (error) {
    console.error("Erro ao buscar loja (o supabase/setup.sql já foi executado?):", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const store = await loadStore(slug);
  if (!store) return { title: "Loja não encontrada" };

  const title = `${store.name}${store.slogan ? ` — ${store.slogan}` : " — Veículos seminovos e novos"}`;
  const description =
    store.description?.slice(0, 160) ||
    `Confira os veículos disponíveis na ${store.name}. Procedência, revisão e atendimento personalizado.`;
  const image = store.coverUrl ?? store.heroImageUrl ?? store.logoUrl;

  return {
    title: { default: title, template: `%s | ${store.name}` },
    description,
    icons: store.faviconUrl ? { icon: store.faviconUrl } : undefined,
    alternates: { canonical: `/loja/${store.slug}` },
    openGraph: {
      type: "website",
      siteName: store.name,
      title,
      description,
      url: `/loja/${store.slug}`,
      locale: "pt_BR",
      images: image ? [{ url: image, width: 1200, height: 630, alt: store.name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function StoreLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const store = await loadStore(slug);
  if (!store) notFound();

  const client = getPublicClient();
  const vehicles = client ? await fetchPublicVehicles(client, store.id).catch(() => []) : [];

  // As cores escolhidas pela loja entram como CSS vars; todo o resto da
  // identidade (preto/grafite/tipografia) continua fixo para o layout não
  // quebrar com uma cor mal escolhida.
  const themeVars = {
    "--store-primary": store.primaryColor,
    "--store-accent": store.secondaryColor,
    "--store-accent-soft": hexToRgba(store.secondaryColor, 0.14),
    "--store-accent-border": hexToRgba(store.secondaryColor, 0.35),
  } as React.CSSProperties;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    name: store.name,
    description: store.description || undefined,
    image: store.coverUrl ?? store.logoUrl ?? undefined,
    telephone: store.phone || undefined,
    email: store.email || undefined,
    address: store.address?.city
      ? {
          "@type": "PostalAddress",
          streetAddress: [store.address.street, store.address.number].filter(Boolean).join(", "),
          addressLocality: store.address.city,
          addressRegion: store.address.state,
          postalCode: store.address.zip,
          addressCountry: "BR",
        }
      : undefined,
  };

  return (
    <StoreViewProvider store={store} vehicles={vehicles}>
      <FavoritesProvider storeId={store.id}>
        {/* O padding de baixo reserva a altura da barra fixa do celular mais
            a safe-area do aparelho (notch/gesture bar do iPhone), então ela
            nunca cobre preço, texto ou botão de card algum. */}
        <div
          style={themeVars}
          className="flex min-h-screen flex-col bg-ink pb-[calc(80px+env(safe-area-inset-bottom))] lg:pb-0"
        >
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
          <StoreViewTracker />
          <StoreHeader />
          <main className="flex-1">{children}</main>
          <StoreFooter />
          <MobileActionBar />
          <WhatsAppFab />
        </div>
      </FavoritesProvider>
    </StoreViewProvider>
  );
}
