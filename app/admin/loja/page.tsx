"use client";

import { useState, type FormEvent } from "react";
import { useAdminStore } from "@/lib/admin-store-context";
import { useToast } from "@/lib/toast-context";
import { isValidHex } from "@/lib/color";
import { formatPhone, isValidCnpj, isValidCpf, isValidEmail, onlyDigits } from "@/lib/utils";
import { DEFAULT_TRUST_BADGES } from "@/lib/vehicle-options";
import type { BusinessHour, DocumentType, Store, TrustBadge } from "@/types/store";
import { PageHeader, Panel } from "@/components/admin/admin-ui";
import { MediaField } from "@/components/admin/media-field";
import { Button } from "@/components/ui/button";
import { Field, Select, TextArea } from "@/components/ui/field";
import { EmptyState, ErrorNote } from "@/components/ui/feedback";
import { TRUST_ICON_KEYS, CloseIcon, PlusIcon } from "@/components/icons";

const TABS = ["Dados da loja", "Marca e cores", "Vitrine", "Horários"] as const;

export default function StoreSettingsPage() {
  const { store, updateStoreData, role } = useAdminStore();
  const toast = useToast();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Dados da loja");
  const [draft, setDraft] = useState<Partial<Store>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  if (role === "collaborator") {
    return (
      <EmptyState
        title="Sem permissão"
        description="Apenas administradores podem editar os dados da loja."
      />
    );
  }

  if (!store) return null;

  const value = { ...store, ...draft };

  function set<K extends keyof Store>(key: K, next: Store[K]) {
    setDraft((prev) => ({ ...prev, [key]: next }));
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!value.name.trim()) next.name = "Informe o nome da loja.";
    if (value.email && !isValidEmail(value.email)) next.email = "E-mail inválido.";
    if (value.document) {
      const valid = value.documentType === "cpf" ? isValidCpf(value.document) : isValidCnpj(value.document);
      if (!valid) next.document = `${value.documentType.toUpperCase()} inválido.`;
    }
    if (!isValidHex(value.primaryColor)) next.primaryColor = "Use um hex como #0B0B0C.";
    if (!isValidHex(value.secondaryColor)) next.secondaryColor = "Use um hex como #C9A227.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!validate()) {
      toast.error("Revise os campos destacados.");
      return;
    }
    setSaving(true);
    try {
      await updateStoreData(draft);
      setDraft({});
      toast.success("Dados da loja atualizados.");
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  const dirty = Object.keys(draft).length > 0;

  return (
    <form onSubmit={handleSubmit}>
      <PageHeader
        title="Minha loja"
        description="Dados cadastrais, identidade visual e o conteúdo que aparece na vitrine pública."
      />

      <nav className="no-scrollbar mb-6 flex gap-2 overflow-x-auto pb-1">
        {TABS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            aria-current={tab === item ? "page" : undefined}
            className={
              tab === item
                ? "accent-border accent-soft accent-text h-10 shrink-0 rounded-xl border px-4 text-[13px] font-semibold"
                : "h-10 shrink-0 rounded-xl border border-white/12 px-4 text-[13px] text-mute hover:border-white/30 hover:text-cream"
            }
          >
            {item}
          </button>
        ))}
      </nav>

      {Object.keys(errors).length > 0 && (
        <div className="mb-5">
          <ErrorNote>Alguns campos precisam de ajuste antes de salvar.</ErrorNote>
        </div>
      )}

      {tab === "Dados da loja" && (
        <Panel title="Dados cadastrais">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Nome da loja *"
              value={value.name}
              onChange={(e) => set("name", e.target.value)}
              error={errors.name}
              required
            />
            <Field label="Slogan" value={value.slogan} onChange={(e) => set("slogan", e.target.value)} />

            <Select
              label="Tipo de documento"
              value={value.documentType}
              onChange={(e) => set("documentType", e.target.value as DocumentType)}
            >
              <option value="cnpj">CNPJ</option>
              <option value="cpf">CPF</option>
            </Select>
            <Field
              label={value.documentType.toUpperCase()}
              value={value.document}
              onChange={(e) => set("document", onlyDigits(e.target.value))}
              error={errors.document}
              inputMode="numeric"
            />

            <Field
              label="E-mail"
              type="email"
              value={value.email}
              onChange={(e) => set("email", e.target.value)}
              error={errors.email}
            />
            <Field
              label="Telefone"
              value={formatPhone(value.phone)}
              onChange={(e) => set("phone", onlyDigits(e.target.value))}
              inputMode="tel"
            />

            <Field
              label="WhatsApp"
              value={formatPhone(value.whatsappNumber)}
              onChange={(e) => set("whatsappNumber", onlyDigits(e.target.value))}
              inputMode="tel"
              hint="Com DDD. É o número usado nos botões do catálogo."
            />
            <Field
              label="Mensagem automática do WhatsApp"
              value={value.whatsappDefaultMessage}
              onChange={(e) => set("whatsappDefaultMessage", e.target.value)}
              hint="Use {veiculo}, {loja} e {preco} para preencher automaticamente."
            />

            <TextArea
              label="Sobre a loja"
              value={value.description}
              onChange={(e) => set("description", e.target.value)}
              className="sm:col-span-2"
              rows={5}
              placeholder="História, diferenciais e o que torna o atendimento da loja único."
            />
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field
              label="Rua"
              value={value.address.street ?? ""}
              onChange={(e) => set("address", { ...value.address, street: e.target.value })}
            />
            <Field
              label="Número"
              value={value.address.number ?? ""}
              onChange={(e) => set("address", { ...value.address, number: e.target.value })}
            />
            <Field
              label="Bairro"
              value={value.address.neighborhood ?? ""}
              onChange={(e) => set("address", { ...value.address, neighborhood: e.target.value })}
            />
            <Field
              label="CEP"
              value={value.address.zip ?? ""}
              onChange={(e) => set("address", { ...value.address, zip: e.target.value })}
            />
            <Field
              label="Cidade"
              value={value.address.city ?? ""}
              onChange={(e) => set("address", { ...value.address, city: e.target.value })}
            />
            <Field
              label="Estado"
              value={value.address.state ?? ""}
              maxLength={2}
              onChange={(e) => set("address", { ...value.address, state: e.target.value.toUpperCase() })}
            />
            <Field
              label="Link do mapa (opcional)"
              value={value.address.mapUrl ?? ""}
              onChange={(e) => set("address", { ...value.address, mapUrl: e.target.value })}
              className="sm:col-span-2"
              hint="URL de incorporação do Google Maps. Em branco, o mapa é montado a partir do endereço acima."
            />
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field
              label="Instagram"
              value={value.social.instagram ?? ""}
              onChange={(e) => set("social", { ...value.social, instagram: e.target.value })}
              placeholder="https://instagram.com/sualoja"
            />
            <Field
              label="Facebook"
              value={value.social.facebook ?? ""}
              onChange={(e) => set("social", { ...value.social, facebook: e.target.value })}
            />
            <Field
              label="YouTube"
              value={value.social.youtube ?? ""}
              onChange={(e) => set("social", { ...value.social, youtube: e.target.value })}
            />
            <Field
              label="Site"
              value={value.social.site ?? ""}
              onChange={(e) => set("social", { ...value.social, site: e.target.value })}
            />
          </div>
        </Panel>
      )}

      {tab === "Marca e cores" && (
        <Panel
          title="Identidade visual"
          description="A estrutura do catálogo é fixa para manter o padrão premium; você personaliza marca, imagens e cor de destaque."
        >
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <MediaField
              label="Logotipo"
              hint="PNG com fundo transparente funciona melhor."
              value={value.logoUrl}
              storeId={store.id}
              aspect="aspect-3/1"
              onChange={(url) => set("logoUrl", url)}
            />
            <MediaField
              label="Favicon"
              hint="Ícone quadrado que aparece na aba do navegador."
              value={value.faviconUrl}
              storeId={store.id}
              aspect="aspect-square"
              onChange={(url) => set("faviconUrl", url)}
            />
            <MediaField
              label="Imagem de capa"
              hint="Usada no banner e no compartilhamento em redes sociais."
              value={value.coverUrl}
              storeId={store.id}
              onChange={(url) => set("coverUrl", url)}
            />
            <MediaField
              label="Foto da loja"
              hint="Aparece na seção 'Sobre'."
              value={value.aboutImageUrl}
              storeId={store.id}
              folder="about"
              onChange={(url) => set("aboutImageUrl", url)}
            />
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <ColorInput
              label="Cor principal"
              value={value.primaryColor}
              error={errors.primaryColor}
              onChange={(color) => set("primaryColor", color)}
            />
            <ColorInput
              label="Cor de destaque"
              value={value.secondaryColor}
              error={errors.secondaryColor}
              onChange={(color) => set("secondaryColor", color)}
            />
          </div>
        </Panel>
      )}

      {tab === "Vitrine" && (
        <div className="flex flex-col gap-4">
          <Panel title="Banner principal">
            <div className="grid gap-4">
              <Field
                label="Frase de apoio"
                value={value.heroEyebrow}
                onChange={(e) => set("heroEyebrow", e.target.value)}
              />
              <Field
                label="Título"
                value={value.heroTitle}
                onChange={(e) => set("heroTitle", e.target.value)}
              />
              <TextArea
                label="Subtítulo"
                value={value.heroSubtitle}
                rows={2}
                onChange={(e) => set("heroSubtitle", e.target.value)}
              />
              <MediaField
                label="Imagem do banner"
                hint="Se ficar vazio, usamos a foto do veículo em destaque."
                value={value.heroImageUrl}
                storeId={store.id}
                onChange={(url) => set("heroImageUrl", url)}
              />
            </div>
          </Panel>

          <Panel
            title="Indicadores"
            description="Deixe vazio o que a loja ainda não tem — o indicador some da vitrine em vez de mostrar um número inventado."
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <Field
                label="Veículos vendidos"
                value={value.statVehiclesSold ?? ""}
                inputMode="numeric"
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "");
                  set("statVehiclesSold", digits ? Number(digits) : null);
                }}
              />
              <Field
                label="Clientes satisfeitos (%)"
                value={value.statSatisfaction ?? ""}
                inputMode="numeric"
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "");
                  set("statSatisfaction", digits ? Math.min(Number(digits), 100) : null);
                }}
              />
              <Field
                label="Anos de mercado"
                value={value.statYearsMarket ?? ""}
                inputMode="numeric"
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "");
                  set("statYearsMarket", digits ? Number(digits) : null);
                }}
              />
            </div>
          </Panel>

          <TrustBadgeEditor badges={value.trustBadges} onChange={(badges) => set("trustBadges", badges)} />
        </div>
      )}

      {tab === "Horários" && (
        <BusinessHoursEditor hours={value.businessHours} onChange={(hours) => set("businessHours", hours)} />
      )}

      <div className="sticky bottom-0 -mx-4 mt-6 flex items-center justify-between gap-3 border-t border-white/8 bg-ink/95 px-4 py-4 backdrop-blur md:-mx-8 md:px-8">
        <p className="text-[12.5px] text-mute">
          {dirty ? "Você tem alterações não salvas." : "Tudo salvo."}
        </p>
        <Button type="submit" loading={saving} disabled={!dirty}>
          Salvar alterações
        </Button>
      </div>
    </form>
  );
}

function ColorInput({
  label,
  value,
  error,
  onChange,
}: {
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-end gap-3">
      <Field label={label} value={value} error={error} onChange={(e) => onChange(e.target.value)} className="flex-1" />
      <input
        type="color"
        value={isValidHex(value) ? value : "#c9a227"}
        onChange={(e) => onChange(e.target.value)}
        aria-label={`Seletor de ${label}`}
        className="h-11 w-14 shrink-0 cursor-pointer rounded-xl border border-white/12 bg-graphite-900 p-1"
      />
    </div>
  );
}

function TrustBadgeEditor({
  badges,
  onChange,
}: {
  badges: TrustBadge[];
  onChange: (badges: TrustBadge[]) => void;
}) {
  function update(index: number, patch: Partial<TrustBadge>) {
    onChange(badges.map((badge, i) => (i === index ? { ...badge, ...patch } : badge)));
  }

  return (
    <Panel
      title="Selos de confiança"
      description="Até 4 selos aparecem na faixa abaixo do banner."
      action={
        <div className="flex gap-2">
          {badges.length < 4 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                onChange([
                  ...badges,
                  { id: `selo-${Date.now()}`, icon: "shield", title: "Novo selo", description: "" },
                ])
              }
            >
              <PlusIcon className="h-4 w-4" />
              Adicionar
            </Button>
          )}
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(DEFAULT_TRUST_BADGES)}>
            Restaurar padrão
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-3">
        {badges.map((badge, index) => (
          <div key={badge.id} className="surface-raised grid gap-3 rounded-xl p-4 sm:grid-cols-[140px_1fr_1fr_auto]">
            <Select value={badge.icon} onChange={(e) => update(index, { icon: e.target.value })} aria-label="Ícone">
              {TRUST_ICON_KEYS.map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </Select>
            <Field value={badge.title} onChange={(e) => update(index, { title: e.target.value })} aria-label="Título" />
            <Field
              value={badge.description}
              onChange={(e) => update(index, { description: e.target.value })}
              aria-label="Descrição"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange(badges.filter((_, i) => i !== index))}
              aria-label="Remover selo"
            >
              <CloseIcon className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {badges.length === 0 && <p className="text-[13px] text-mute">Nenhum selo — a faixa não aparece na vitrine.</p>}
      </div>
    </Panel>
  );
}

const DEFAULT_HOURS: BusinessHour[] = [
  { label: "Segunda a sexta", hours: "08h às 18h" },
  { label: "Sábado", hours: "08h às 13h" },
  { label: "Domingo", hours: "Fechado" },
];

function BusinessHoursEditor({
  hours,
  onChange,
}: {
  hours: BusinessHour[];
  onChange: (hours: BusinessHour[]) => void;
}) {
  return (
    <Panel
      title="Horário de atendimento"
      action={
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onChange([...hours, { label: "", hours: "" }])}
          >
            <PlusIcon className="h-4 w-4" />
            Adicionar
          </Button>
          {hours.length === 0 && (
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange(DEFAULT_HOURS)}>
              Usar padrão
            </Button>
          )}
        </div>
      }
    >
      <div className="flex flex-col gap-3">
        {hours.map((hour, index) => (
          <div key={index} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <Field
              value={hour.label}
              placeholder="Segunda a sexta"
              aria-label="Dias"
              onChange={(e) => onChange(hours.map((h, i) => (i === index ? { ...h, label: e.target.value } : h)))}
            />
            <Field
              value={hour.hours}
              placeholder="08h às 18h"
              aria-label="Horário"
              onChange={(e) => onChange(hours.map((h, i) => (i === index ? { ...h, hours: e.target.value } : h)))}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label="Remover horário"
              onClick={() => onChange(hours.filter((_, i) => i !== index))}
            >
              <CloseIcon className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {hours.length === 0 && (
          <p className="text-[13px] text-mute">Sem horários cadastrados — a seção não aparece na vitrine.</p>
        )}
      </div>
    </Panel>
  );
}
