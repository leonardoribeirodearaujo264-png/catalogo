import type { MetadataRoute } from "next";
import { getPublicClient } from "@/lib/supabase/public-client";
import { fetchPublicStoreSlugs, fetchPublicVehicles, fetchPublicStoreBySlug } from "@/lib/supabase/queries";
import { getSiteUrl } from "@/lib/site-url";

const BASE = getSiteUrl();

export const revalidate = 3600;

/**
 * Indexa a landing, cada loja publicada e cada veículo publicado. Lojas
 * bloqueadas ou despublicadas não entram — o RLS já não as devolve.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    { url: BASE, changeFrequency: "weekly", priority: 1 },
  ];

  const client = getPublicClient();
  if (!client) return entries;

  try {
    const stores = await fetchPublicStoreSlugs(client);

    for (const { slug } of stores) {
      entries.push(
        { url: `${BASE}/loja/${slug}`, changeFrequency: "daily", priority: 0.9 },
        { url: `${BASE}/loja/${slug}/veiculos`, changeFrequency: "daily", priority: 0.8 },
        { url: `${BASE}/loja/${slug}/sobre`, changeFrequency: "monthly", priority: 0.5 },
        { url: `${BASE}/loja/${slug}/contato`, changeFrequency: "monthly", priority: 0.5 },
      );

      const store = await fetchPublicStoreBySlug(client, slug);
      if (!store) continue;

      const vehicles = await fetchPublicVehicles(client, store.id).catch(() => []);
      for (const vehicle of vehicles) {
        entries.push({
          url: `${BASE}/loja/${slug}/veiculos/${vehicle.slug}`,
          lastModified: new Date(vehicle.updatedAt),
          changeFrequency: "weekly",
          priority: 0.7,
        });
      }
    }
  } catch (error) {
    console.error("Não foi possível montar o sitemap:", error);
  }

  return entries;
}
