"use client";

import { useState, type FormEvent } from "react";
import { useSettings } from "@/lib/settings-context";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { StoreSettings } from "@/types/catalog";

export default function AdminSettingsPage() {
  const { settings, updateSettings, resetToDefaults } = useSettings();
  const [draft, setDraft] = useState<StoreSettings>(settings);
  const [saved, setSaved] = useState(false);
  const [syncedSettings, setSyncedSettings] = useState(settings);

  // Re-sincroniza o rascunho quando `settings` muda por fora (hidratação do
  // localStorage ou "Restaurar padrão"), sem sobrescrever o que o usuário
  // está digitando a cada render.
  if (settings !== syncedSettings) {
    setSyncedSettings(settings);
    setDraft(settings);
  }

  function patch(fields: Partial<StoreSettings>) {
    setDraft((prev) => ({ ...prev, ...fields }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await updateSettings(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900">Configurações</h1>
      <p className="mt-1 text-sm text-gray-500">
        Personalize a marca, o WhatsApp e os textos da página inicial — vale para qualquer nicho de negócio.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 max-w-3xl space-y-6">
        <section className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-sm font-bold text-gray-900">Identidade da marca</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome da marca">
              <Input value={draft.brandName} onChange={(e) => patch({ brandName: e.target.value })} />
            </Field>
            <Field label="Nicho / segmento" hint="Aparece como selo no banner principal.">
              <Input value={draft.niche} onChange={(e) => patch({ niche: e.target.value })} placeholder="Ex: Moda feminina, Clínica odontológica..." />
            </Field>
            <Field label="URL do logo" hint="Opcional.">
              <Input value={draft.logoUrl ?? ""} onChange={(e) => patch({ logoUrl: e.target.value })} placeholder="https://..." />
            </Field>
            <Field label="URL do banner" hint="Opcional. Imagem de fundo do banner principal.">
              <Input value={draft.bannerUrl ?? ""} onChange={(e) => patch({ bannerUrl: e.target.value })} placeholder="https://..." />
            </Field>
            <Field label="Cor primária">
              <Input type="color" value={draft.primaryColor} onChange={(e) => patch({ primaryColor: e.target.value })} className="h-11 p-1" />
            </Field>
            <Field label="Cor de destaque (CTAs)">
              <Input type="color" value={draft.accentColor} onChange={(e) => patch({ accentColor: e.target.value })} className="h-11 p-1" />
            </Field>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-sm font-bold text-gray-900">Textos da página inicial</h2>
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

        <section className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-sm font-bold text-gray-900">WhatsApp</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Número do WhatsApp" hint="Formato DDI+DDD+número, só dígitos. Ex: 5598999999999">
              <Input value={draft.whatsappNumber} onChange={(e) => patch({ whatsappNumber: e.target.value })} />
            </Field>
            <Field label="Mensagem inicial padrão">
              <Input value={draft.whatsappDefaultMessage} onChange={(e) => patch({ whatsappDefaultMessage: e.target.value })} />
            </Field>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-sm font-bold text-gray-900">Endereço</h2>
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

        <section className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-sm font-bold text-gray-900">Redes sociais</h2>
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

        <div className="flex items-center gap-3">
          <Button type="submit">{saved ? "Salvo ✓" : "Salvar configurações"}</Button>
          <Button type="button" variant="outline" onClick={resetToDefaults}>Restaurar padrão</Button>
        </div>
      </form>
    </div>
  );
}
