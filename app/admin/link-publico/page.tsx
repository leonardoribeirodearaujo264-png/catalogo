"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAdminCatalog } from "@/lib/admin-catalog-context";
import { isSlugTaken } from "@/lib/supabase/queries";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Field, Input } from "@/components/ui/input";
import { slugify } from "@/lib/utils";

export default function PublicLinkPage() {
  const { catalog, updateCatalog, loading } = useAdminCatalog();
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);
  const [togglingPublish, setTogglingPublish] = useState(false);
  const [slugDraft, setSlugDraft] = useState("");
  const [slugSynced, setSlugSynced] = useState<string | null>(null);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [savingSlug, setSavingSlug] = useState(false);
  const [slugSaved, setSlugSaved] = useState(false);

  useEffect(() => {
    // window só existe no cliente; evita divergência entre o HTML do
    // servidor e a primeira renderização no navegador.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrigin(window.location.origin);
  }, []);

  if (catalog && catalog.slug !== slugSynced) {
    setSlugSynced(catalog.slug);
    setSlugDraft(catalog.slug);
  }

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

  async function handleSaveSlug() {
    setSlugError(null);
    const clean = slugify(slugDraft);
    if (!clean) {
      setSlugError("Informe um link válido.");
      return;
    }
    if (clean === catalog!.slug) return;

    setSavingSlug(true);
    try {
      const taken = await isSlugTaken(clean);
      if (taken) {
        setSlugError("Esse link já está em uso. Escolha outro.");
        return;
      }
      await updateCatalog({ slug: clean });
      setSlugDraft(clean);
      setSlugSaved(true);
      setTimeout(() => setSlugSaved(false), 2500);
    } catch (err) {
      console.error(err);
      setSlugError("Não foi possível salvar. Tente novamente.");
    } finally {
      setSavingSlug(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">Link público</h1>
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

      <div className="mt-6 max-w-xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-bold text-gray-900">Personalizar o link</h2>
        <p className="mt-1 text-xs text-gray-500">
          Mudar o link faz com que links já compartilhados antes parem de funcionar.
        </p>

        <div className="mt-4">
          <Field label="Link do catálogo" hint={`${origin}/catalogo/`}>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input value={slugDraft} onChange={(e) => setSlugDraft(e.target.value)} className="flex-1" />
              <Button size="sm" onClick={handleSaveSlug} disabled={savingSlug || slugify(slugDraft) === catalog.slug}>
                {savingSlug ? "Salvando..." : "Salvar link"}
              </Button>
            </div>
          </Field>
          {slugError && <p className="mt-1.5 text-xs font-semibold text-red-500">{slugError}</p>}
          {slugSaved && <p className="mt-1.5 text-xs font-semibold text-green-600">✓ Link atualizado.</p>}
        </div>
      </div>
    </div>
  );
}
