"use client";

import { useState, type FormEvent } from "react";
import { useAdminCatalog } from "@/lib/admin-catalog-context";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/admin/image-upload";
import { cn } from "@/lib/utils";
import type { Catalog, CatalogLayout } from "@/types/catalog";

const LAYOUT_OPTIONS: { value: CatalogLayout; label: string; description: string; icon: string }[] = [
  { value: "grade", label: "Blocos", description: "Cards quadrados lado a lado — bom para produtos visuais.", icon: "▦" },
  { value: "lista", label: "Lista", description: "Itens em linha, com mais espaço para descrição.", icon: "☰" },
];

export default function AdminSettingsPage() {
  const { catalog, updateCatalog, loading } = useAdminCatalog();
  const [draft, setDraft] = useState<Catalog | null>(catalog);
  const [synced, setSynced] = useState(catalog);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Re-sincroniza o rascunho quando `catalog` muda por fora (primeiro
  // carregamento), sem sobrescrever o que o usuário está digitando.
  if (catalog !== synced) {
    setSynced(catalog);
    setDraft(catalog);
  }

  if (loading || !draft) {
    return <p className="text-sm text-gray-400">Carregando...</p>;
  }

  function patch(fields: Partial<Catalog>) {
    setDraft((prev) => (prev ? { ...prev, ...fields } : prev));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!draft) return;
    setSaving(true);
    try {
      await updateCatalog(draft);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">Configurações</h1>
      <p className="mt-1 text-sm text-gray-500">
        Personalize a marca, o WhatsApp e os textos da página inicial — vale para qualquer nicho de negócio.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 max-w-3xl space-y-6">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-900">
            <span className="text-base">🏷️</span> Identidade da marca
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Nome do negócio">
              <Input value={draft.businessName} onChange={(e) => patch({ businessName: e.target.value })} />
            </Field>
            <Field label="Nicho / segmento" hint="Aparece como selo no banner principal.">
              <Input value={draft.niche} onChange={(e) => patch({ niche: e.target.value })} placeholder="Ex: Moda feminina, Clínica odontológica..." />
            </Field>
            <Field label="Cor primária">
              <Input type="color" value={draft.primaryColor} onChange={(e) => patch({ primaryColor: e.target.value })} className="h-11 p-1" />
            </Field>
            <Field label="Cor de destaque (CTAs)">
              <Input type="color" value={draft.accentColor} onChange={(e) => patch({ accentColor: e.target.value })} className="h-11 p-1" />
            </Field>
          </div>

          <div className="mt-5 grid gap-6 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">Logo</label>
              <ImageUpload
                value={draft.logoUrl ?? ""}
                onChange={(url) => patch({ logoUrl: url })}
                catalogId={draft.id}
                folder="branding"
                aspect="square"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                Banner principal
              </label>
              <ImageUpload
                value={draft.bannerUrl ?? ""}
                onChange={(url) => patch({ bannerUrl: url })}
                catalogId={draft.id}
                folder="branding"
                aspect="wide"
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-900">
            <span className="text-base">🖼️</span> Layout do catálogo
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {LAYOUT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => patch({ layout: opt.value })}
                className={cn(
                  "flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-all",
                  draft.layout === opt.value
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-200 text-gray-700 hover:border-gray-300",
                )}
              >
                <span className="text-xl">{opt.icon}</span>
                <span className="text-sm font-bold">{opt.label}</span>
                <span className={cn("text-xs", draft.layout === opt.value ? "text-white/70" : "text-gray-400")}>
                  {opt.description}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-900">
            <span className="text-base">📝</span> Textos da página inicial
          </h2>
          <div className="space-y-4">
            <Field label="Tagline" hint="Frase curta usada no rodapé.">
              <Input value={draft.tagline} onChange={(e) => patch({ tagline: e.target.value })} />
            </Field>
            <Field label="Título do banner">
              <Input value={draft.heroTitle} onChange={(e) => patch({ heroTitle: e.target.value })} />
            </Field>
            <Field label="Subtítulo do banner">
              <Textarea rows={2} value={draft.heroSubtitle} onChange={(e) => patch({ heroSubtitle: e.target.value })} />
            </Field>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-900">
            <span className="text-base">💬</span> WhatsApp
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Número do WhatsApp" hint="Formato DDI+DDD+número, só dígitos. Ex: 5598999999999">
              <Input value={draft.whatsappNumber} onChange={(e) => patch({ whatsappNumber: e.target.value })} />
            </Field>
            <Field label="Mensagem inicial padrão">
              <Input value={draft.whatsappDefaultMessage} onChange={(e) => patch({ whatsappDefaultMessage: e.target.value })} />
            </Field>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-900">
            <span className="text-base">📍</span> Endereço
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Rua/Endereço">
              <Input value={draft.address.street ?? ""} onChange={(e) => patch({ address: { ...draft.address, street: e.target.value } })} />
            </Field>
            <Field label="Cidade">
              <Input value={draft.address.city ?? ""} onChange={(e) => patch({ address: { ...draft.address, city: e.target.value } })} />
            </Field>
            <Field label="Estado (UF)">
              <Input value={draft.address.state ?? ""} onChange={(e) => patch({ address: { ...draft.address, state: e.target.value } })} />
            </Field>
            <Field label="CEP">
              <Input value={draft.address.zip ?? ""} onChange={(e) => patch({ address: { ...draft.address, zip: e.target.value } })} />
            </Field>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-900">
            <span className="text-base">🔗</span> Redes sociais
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Instagram">
              <Input value={draft.social.instagram ?? ""} onChange={(e) => patch({ social: { ...draft.social, instagram: e.target.value } })} />
            </Field>
            <Field label="Facebook">
              <Input value={draft.social.facebook ?? ""} onChange={(e) => patch({ social: { ...draft.social, facebook: e.target.value } })} />
            </Field>
            <Field label="TikTok">
              <Input value={draft.social.tiktok ?? ""} onChange={(e) => patch({ social: { ...draft.social, tiktok: e.target.value } })} />
            </Field>
            <Field label="Site">
              <Input value={draft.social.site ?? ""} onChange={(e) => patch({ social: { ...draft.social, site: e.target.value } })} />
            </Field>
          </div>
        </section>

        {saved && (
          <p className="animate-fade-in rounded-lg bg-green-50 px-3.5 py-2.5 text-sm font-semibold text-green-700">
            ✓ Configurações salvas com sucesso.
          </p>
        )}

        <div className="flex items-center gap-3">
          <Button type="submit" variant="brand" disabled={saving}>
            {saving ? "Salvando..." : "Salvar configurações"}
          </Button>
        </div>
      </form>
    </div>
  );
}
