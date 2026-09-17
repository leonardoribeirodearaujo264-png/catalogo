"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { ensureStoreForUser } from "@/lib/auth";
import { useToast } from "@/lib/toast-context";
import { isSlugTaken, updateStore } from "@/lib/supabase/queries";
import { isValidHex } from "@/lib/color";
import { formatPhone, onlyDigits, slugError, slugify } from "@/lib/utils";
import { DEFAULT_TRUST_BADGES } from "@/lib/vehicle-options";
import type { Store } from "@/types/store";
import { MediaField } from "@/components/admin/media-field";
import { Button } from "@/components/ui/button";
import { Field, Select, TextArea } from "@/components/ui/field";
import { ErrorNote, Skeleton } from "@/components/ui/feedback";
import { ArrowRightIcon, CarIcon, CheckIcon } from "@/components/icons";

const STEPS = [
  "Dados da loja",
  "Identidade visual",
  "Contato e endereço",
  "Link público",
  "Publicar",
];

export default function OnboardingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const [store, setStore] = useState<Store | null>(null);
  const [draft, setDraft] = useState<Partial<Store>>({});
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading || !user) return;
    ensureStoreForUser(user)
      .then((current) => {
        setStore(current);
        setStep(Math.min(Math.max(current.onboardingStep - 1, 0), STEPS.length - 1));
      })
      .catch((err) => {
        console.error(err);
        setError("Não foi possível carregar sua loja. Confira as variáveis do Supabase.");
      });
  }, [authLoading, user]);

  if (!store) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink px-4">
        {error ? <ErrorNote>{error}</ErrorNote> : <Skeleton className="h-10 w-48" />}
      </div>
    );
  }

  const value = { ...store, ...draft };

  function set<K extends keyof Store>(key: K, next: Store[K]) {
    setDraft((prev) => ({ ...prev, [key]: next }));
  }

  async function persist(patch: Partial<Store>) {
    await updateStore(store!.id, patch);
    setStore((prev) => (prev ? { ...prev, ...patch } : prev));
    setDraft({});
  }

  async function handleNext() {
    setError(null);

    if (step === 0 && !value.name.trim()) {
      setError("Informe o nome da loja.");
      return;
    }
    if (step === 1 && (!isValidHex(value.primaryColor) || !isValidHex(value.secondaryColor))) {
      setError("As cores precisam ser hexadecimais, como #C9A227.");
      return;
    }
    if (step === 2 && onlyDigits(value.whatsappNumber).length < 10) {
      setError("Informe um WhatsApp com DDD — é por ele que os clientes chamam.");
      return;
    }

    setSaving(true);
    try {
      if (step === 3) {
        const normalized = slugify(value.slug);
        const validation = slugError(normalized);
        if (validation) {
          setError(validation);
          return;
        }
        if (normalized !== store!.slug && (await isSlugTaken(normalized))) {
          setError("Esse link já está em uso. Escolha outro.");
          return;
        }
        await persist({ ...draft, slug: normalized, onboardingStep: step + 2 });
      } else {
        await persist({
          ...draft,
          onboardingStep: step + 2,
          // Loja nova começa com os selos padrão já preenchidos.
          trustBadges: value.trustBadges?.length ? value.trustBadges : DEFAULT_TRUST_BADGES,
        });
      }
      setStep((current) => current + 1);
    } catch (err) {
      console.error(err);
      setError("Não foi possível salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  async function handleFinish(publish: boolean) {
    setSaving(true);
    try {
      await persist({ ...draft, isPublished: publish, onboardingStep: 6 });
      toast.success(publish ? "Catálogo publicado!" : "Loja configurada. Publique quando quiser.");
      router.replace(publish ? "/admin/veiculos/novo" : "/admin");
    } catch (err) {
      console.error(err);
      setError("Não foi possível concluir.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-ink">
      <header className="border-b border-white/8">
        <div className="container-app flex h-[72px] items-center gap-3">
          <CarIcon className="h-6 w-6 accent-text" />
          <span className="brand-wordmark text-[15px] uppercase text-cream">Car Select</span>
        </div>
      </header>

      <main className="container-app flex-1 py-10">
        <div className="mx-auto max-w-2xl">
          <nav aria-label="Progresso" className="no-scrollbar mb-8 flex gap-2 overflow-x-auto pb-1">
            {STEPS.map((label, index) => (
              <div
                key={label}
                className={
                  index === step
                    ? "accent-border accent-soft accent-text flex h-9 shrink-0 items-center gap-2 rounded-full border px-3.5 text-[12.5px] font-semibold"
                    : "flex h-9 shrink-0 items-center gap-2 rounded-full border border-white/10 px-3.5 text-[12.5px] text-mute"
                }
              >
                <span
                  className={
                    index < step
                      ? "accent-bg flex h-4.5 w-4.5 items-center justify-center rounded-full text-ink"
                      : "flex h-4.5 w-4.5 items-center justify-center rounded-full bg-white/10 text-[10px]"
                  }
                >
                  {index < step ? <CheckIcon className="h-3 w-3" /> : index + 1}
                </span>
                {label}
              </div>
            ))}
          </nav>

          <div className="surface rounded-2xl p-6 sm:p-8">
            <h1 className="font-display text-[26px] leading-tight text-cream">{STEPS[step]}</h1>
            <p className="mt-2 mb-6 text-[14px] text-mute">
              {
                [
                  "Como sua loja aparece para os clientes.",
                  "Envie o logotipo e escolha as cores da marca.",
                  "Como os clientes falam com você.",
                  "O endereço que você vai compartilhar.",
                  "Tudo pronto — é só publicar.",
                ][step]
              }
            </p>

            {error && (
              <div className="mb-5">
                <ErrorNote>{error}</ErrorNote>
              </div>
            )}

            {step === 0 && (
              <div className="flex flex-col gap-4">
                <Field label="Nome da loja *" value={value.name} onChange={(e) => set("name", e.target.value)} required />
                <Field
                  label="Slogan"
                  value={value.slogan}
                  onChange={(e) => set("slogan", e.target.value)}
                  placeholder="Confiança em cada km"
                />
                <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
                  <Select
                    label="Documento"
                    value={value.documentType}
                    onChange={(e) => set("documentType", e.target.value as "cnpj" | "cpf")}
                  >
                    <option value="cnpj">CNPJ</option>
                    <option value="cpf">CPF</option>
                  </Select>
                  <Field
                    label={value.documentType.toUpperCase()}
                    value={value.document}
                    inputMode="numeric"
                    onChange={(e) => set("document", onlyDigits(e.target.value))}
                  />
                </div>
                <TextArea
                  label="Sobre a loja"
                  rows={4}
                  value={value.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Conte a história da loja e o que faz o atendimento de vocês ser diferente."
                />
              </div>
            )}

            {step === 1 && (
              <div className="flex flex-col gap-6">
                <div className="grid gap-5 sm:grid-cols-2">
                  <MediaField
                    label="Logotipo"
                    value={value.logoUrl}
                    storeId={store.id}
                    aspect="aspect-3/1"
                    onChange={(url) => set("logoUrl", url)}
                  />
                  <MediaField
                    label="Imagem de capa"
                    value={value.coverUrl}
                    storeId={store.id}
                    onChange={(url) => set("coverUrl", url)}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-end gap-3">
                    <Field
                      label="Cor principal"
                      value={value.primaryColor}
                      onChange={(e) => set("primaryColor", e.target.value)}
                      className="flex-1"
                    />
                    <input
                      type="color"
                      aria-label="Seletor de cor principal"
                      value={isValidHex(value.primaryColor) ? value.primaryColor : "#0b0b0c"}
                      onChange={(e) => set("primaryColor", e.target.value)}
                      className="h-11 w-14 shrink-0 cursor-pointer rounded-xl border border-white/12 bg-graphite-900 p-1"
                    />
                  </div>
                  <div className="flex items-end gap-3">
                    <Field
                      label="Cor de destaque"
                      value={value.secondaryColor}
                      onChange={(e) => set("secondaryColor", e.target.value)}
                      className="flex-1"
                    />
                    <input
                      type="color"
                      aria-label="Seletor de cor de destaque"
                      value={isValidHex(value.secondaryColor) ? value.secondaryColor : "#c9a227"}
                      onChange={(e) => set("secondaryColor", e.target.value)}
                      className="h-11 w-14 shrink-0 cursor-pointer rounded-xl border border-white/12 bg-graphite-900 p-1"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="WhatsApp *"
                  value={formatPhone(value.whatsappNumber)}
                  onChange={(e) => set("whatsappNumber", onlyDigits(e.target.value))}
                  inputMode="tel"
                  className="sm:col-span-2"
                  hint="Com DDD. É o número dos botões do catálogo."
                />
                <Field
                  label="Telefone"
                  value={formatPhone(value.phone)}
                  onChange={(e) => set("phone", onlyDigits(e.target.value))}
                  inputMode="tel"
                />
                <Field label="E-mail" type="email" value={value.email} onChange={(e) => set("email", e.target.value)} />
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
                  label="Cidade"
                  value={value.address.city ?? ""}
                  onChange={(e) => set("address", { ...value.address, city: e.target.value })}
                />
                <Field
                  label="Estado"
                  maxLength={2}
                  value={value.address.state ?? ""}
                  onChange={(e) => set("address", { ...value.address, state: e.target.value.toUpperCase() })}
                />
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col gap-4">
                <Field
                  label="Link público"
                  value={value.slug}
                  onChange={(e) => set("slug", e.target.value.toLowerCase())}
                  hint="Letras minúsculas, números e hífen."
                />
                <div className="surface-raised rounded-xl p-4">
                  <p className="text-[12px] text-mute">Seu catálogo ficará em</p>
                  <code className="mt-1 block break-all text-[14px] accent-text">
                    /loja/{slugify(value.slug) || "sua-loja"}
                  </code>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="flex flex-col gap-5">
                <p className="text-[14px] leading-relaxed text-mute">
                  A loja <span className="text-cream">{value.name}</span> está configurada. Você pode publicar
                  agora e cadastrar o primeiro veículo em seguida — ou publicar depois, pelo painel.
                </p>
                <div className="surface-raised rounded-xl p-4 text-[13.5px] text-mute">
                  <p>
                    Link: <span className="accent-text">/loja/{store.slug}</span>
                  </p>
                  <p className="mt-1">
                    WhatsApp: <span className="text-cream">{formatPhone(value.whatsappNumber) || "não informado"}</span>
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button onClick={() => handleFinish(true)} loading={saving} size="lg">
                    Publicar e cadastrar veículo
                    <ArrowRightIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="lg" onClick={() => handleFinish(false)} disabled={saving}>
                    Publicar depois
                  </Button>
                </div>
              </div>
            )}

            {step < 4 && (
              <div className="mt-7 flex justify-between gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep((current) => Math.max(current - 1, 0))}
                  disabled={step === 0}
                >
                  Voltar
                </Button>
                <Button type="button" onClick={handleNext} loading={saving}>
                  Continuar
                  <ArrowRightIcon className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
