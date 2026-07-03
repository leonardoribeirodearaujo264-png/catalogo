"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAdminCatalog } from "@/lib/admin-catalog-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function PublicLinkPage() {
  const { catalog, updateCatalog, loading } = useAdminCatalog();
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);
  const [togglingPublish, setTogglingPublish] = useState(false);

  useEffect(() => {
    // window só existe no cliente; evita divergência entre o HTML do
    // servidor e a primeira renderização no navegador.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrigin(window.location.origin);
  }, []);

  if (loading || !catalog) {
    return <p className="text-sm text-gray-400">Carregando...</p>;
  }

  const path = `/catalogo/${catalog.slug}`;
  const fullUrl = `${origin}${path}`;

  async function handleCopy() {
    await navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleTogglePublish() {
    setTogglingPublish(true);
    try {
      await updateCatalog({ isPublished: !catalog!.isPublished });
    } finally {
      setTogglingPublish(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900">Link público</h1>
      <p className="mt-1 text-sm text-gray-500">
        Este é o endereço do seu catálogo. Compartilhe no WhatsApp, Instagram ou onde quiser.
      </p>

      <div className="mt-6 max-w-xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Badge tone={catalog.isPublished ? "green" : "gray"}>
            {catalog.isPublished ? "Publicado" : "Não publicado"}
          </Badge>
          {!catalog.isPublished && (
            <span className="text-xs text-gray-400">Visitantes não conseguem ver o catálogo enquanto ele estiver despublicado.</span>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-2 rounded-xl border border-gray-200 bg-gray-50 p-4 sm:flex-row sm:items-center">
          <code className="flex-1 truncate text-sm text-gray-700">{fullUrl || path}</code>
          <Button size="sm" variant="secondary" onClick={handleCopy}>
            {copied ? "Copiado ✓" : "Copiar link"}
          </Button>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <Link href={path} target="_blank">
            <Button variant="outline" size="sm">Abrir catálogo →</Button>
          </Link>
          <Button variant={catalog.isPublished ? "danger" : "primary"} size="sm" onClick={handleTogglePublish} disabled={togglingPublish}>
            {togglingPublish ? "Salvando..." : catalog.isPublished ? "Despublicar catálogo" : "Publicar catálogo"}
          </Button>
        </div>
      </div>
    </div>
  );
}
