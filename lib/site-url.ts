/**
 * Endereço público do site, usado nos metadados de compartilhamento e no
 * sitemap.
 *
 * A ordem importa: NEXT_PUBLIC_SITE_URL manda (é o domínio próprio, quando
 * existe); sem ela, a Vercel injeta o domínio do projeto automaticamente,
 * então um deploy funciona sem ninguém configurar variável nenhuma. O
 * localhost fica só como último recurso, para o ambiente de desenvolvimento.
 *
 * As VERCEL_* só existem no servidor — e é lá que o metadataBase, o sitemap
 * e o robots são avaliados.
 */
export function getSiteUrl(): string {
  const explicito = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicito) return explicito.replace(/\/$/, "");

  const producao = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (producao) return `https://${producao}`;

  const preview = process.env.VERCEL_URL?.trim();
  if (preview) return `https://${preview}`;

  return "http://localhost:3000";
}
