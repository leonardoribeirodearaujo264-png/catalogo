"use client";

import { useEffect, useState } from "react";
import { useAdminStore } from "@/lib/admin-store-context";
import { useToast } from "@/lib/toast-context";
import { isSlugTaken } from "@/lib/supabase/queries";
import { slugError, slugify } from "@/lib/utils";
import { PageHeader, Panel } from "@/components/admin/admin-ui";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Toggle } from "@/components/ui/field";
import { ArrowRightIcon, CheckIcon, LinkIcon } from "@/components/icons";

export default function PublicLinkPage() {
  const { store, updateStoreData, vehicles, role } = useAdminStore();
  const toast = useToast();

  const [slug, setSlug] = useState(store?.slug ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- window.location só existe no cliente; preenche depois da hidratação
    setOrigin(window.location.origin);
  }, []);

  if (!store) return null;

  const url = `${origin}/loja/${store.slug}`;
  const publishedCount = vehicles.filter((v) => v.published && v.status !== "arquivado").length;
  const canEdit = role !== "collaborator";

  async function handleSaveSlug() {
    const normalized = slugify(slug);
    const validation = slugError(normalized);
    if (validation) {
      setError(validation);
      return;
    }
    if (normalized === store!.slug) {
      setError(null);
      return;
    }

    setSaving(true);
    try {
      if (await isSlugTaken(normalized)) {
        setError("Esse link já está em uso por outra loja.");
        return;
      }
      await updateStoreData({ slug: normalized });
      setSlug(normalized);
      setError(null);
      toast.success("Link atualizado. O endereço antigo deixa de funcionar.");
    } catch (err) {
      console.error(err);
      setError("Não foi possível salvar o link. Tente outro.");
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish(value: boolean) {
    try {
      await updateStoreData({ isPublished: value });
      toast.success(value ? "Catálogo publicado." : "Catálogo despublicado.");
    } catch {
      toast.error("Não foi possível alterar a publicação.");
    }
  }

  return (
    <>
      <PageHeader
        title="Link público"
        description="O endereço que você compartilha no WhatsApp, Instagram e cartão de visita."
      />

      <div className="flex flex-col gap-4">
        <Panel title="Seu endereço">
          <div className="surface-raised flex flex-col gap-3 rounded-xl p-4 sm:flex-row sm:items-center">
            <LinkIcon className="h-5 w-5 shrink-0 accent-text" />
            <code className="min-w-0 flex-1 break-all text-[14px] text-cream">{url}</code>
            <div className="flex shrink-0 gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(url);
                  toast.success("Link copiado.");
                }}
              >
                Copiar
              </Button>
              <ButtonLink size="sm" href={`/loja/${store.slug}`} target="_blank">
                Abrir
                <ArrowRightIcon className="h-4 w-4" />
              </ButtonLink>
            </div>
          </div>

          {canEdit && (
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
              <Field
                label="Personalizar o link"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value.toLowerCase());
                  setError(null);
                }}
                error={error ?? undefined}
                hint="Letras minúsculas, números e hífen. Ex.: prime-veiculos"
                className="flex-1"
              />
              <Button onClick={handleSaveSlug} loading={saving} disabled={slugify(slug) === store.slug}>
                Salvar link
              </Button>
            </div>
          )}
        </Panel>

        {canEdit && (
          <Panel title="Publicação">
            <Toggle
              checked={store.isPublished}
              onChange={handlePublish}
              label={store.isPublished ? "Catálogo publicado" : "Catálogo despublicado"}
              description={
                store.isPublished
                  ? "Qualquer pessoa com o link consegue ver os veículos publicados."
                  : "O link retorna página não encontrada para visitantes."
              }
            />

            <ul className="mt-5 flex flex-col gap-2 text-[13.5px] text-mute">
              <Requirement done={!!store.whatsappNumber} label="WhatsApp cadastrado" />
              <Requirement done={!!store.logoUrl} label="Logotipo enviado" />
              <Requirement done={publishedCount > 0} label={`${publishedCount} veículo(s) publicado(s)`} />
              <Requirement done={!!store.address.city} label="Endereço informado" />
            </ul>
          </Panel>
        )}

        <Panel title="Onde divulgar" description="Sugestões rápidas para o link circular.">
          <ul className="flex flex-col gap-2 text-[13.5px] text-mute">
            <li>• Bio do Instagram e do Facebook da loja</li>
            <li>• Mensagem automática e status do WhatsApp</li>
            <li>• Assinatura de e-mail e cartão de visita</li>
            <li>• Placas e adesivos no pátio, com QR code apontando para o link</li>
          </ul>
        </Panel>
      </div>
    </>
  );
}

function Requirement({ done, label }: { done: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2.5">
      <span
        className={
          done
            ? "flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300"
            : "flex h-5 w-5 items-center justify-center rounded-full border border-white/15 text-graphite-600"
        }
      >
        {done ? <CheckIcon className="h-3 w-3" /> : null}
      </span>
      <span className={done ? "text-cream" : undefined}>{label}</span>
    </li>
  );
}
