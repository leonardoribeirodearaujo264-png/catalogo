import { permanentRedirect } from "next/navigation";

// O catálogo antigo vivia em /catalogo/{slug}. Links já compartilhados
// continuam funcionando: redirecionamos de forma permanente para a nova
// vitrine em /loja/{slug}.
export default async function LegacyCatalogRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  permanentRedirect(`/loja/${slug}`);
}
