"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useStoreView } from "@/lib/store-view-context";
import { useToast } from "@/lib/toast-context";
import { getBrowserClient } from "@/lib/supabase/browser-client";
import { insertPublicLead, trackStoreEvent } from "@/lib/supabase/queries";
import { buildVehicleMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { formatVehiclePrice, isValidEmail, formatPhone, onlyDigits } from "@/lib/utils";
import { currentPrice, vehicleFullTitle, type Vehicle } from "@/types/vehicle";
import type { LeadOrigin } from "@/types/lead";
import { Button } from "@/components/ui/button";
import { Field, Select, TextArea } from "@/components/ui/field";
import { Modal } from "@/components/ui/feedback";
import { ChatIcon, ShareIcon, WalletIcon, WhatsAppIcon } from "@/components/icons";

/** Botões principais da página do veículo. */
export function VehicleActions({ vehicle }: { vehicle: Vehicle }) {
  const { store } = useStoreView();
  const toast = useToast();
  const [openForm, setOpenForm] = useState<LeadOrigin | null>(null);

  function handleWhatsApp() {
    const client = getBrowserClient();
    if (client) trackStoreEvent(client, store.id, "whatsapp_click", vehicle.id);
  }

  async function handleShare() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${vehicleFullTitle(vehicle)} — ${store.name}`, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copiado.");
      }
      const client = getBrowserClient();
      if (client) trackStoreEvent(client, store.id, "share", vehicle.id);
    } catch {
      // compartilhamento cancelado
    }
  }

  return (
    <>
      <div className="flex flex-col gap-2.5">
        <Button onClick={() => setOpenForm("formulario")} size="lg" full>
          <ChatIcon className="h-4 w-4" />
          Tenho interesse
        </Button>

        {store.whatsappNumber && (
          <a
            href={buildWhatsAppUrl(store.whatsappNumber, buildVehicleMessage(store, vehicle))}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleWhatsApp}
            className="inline-flex h-12 items-center justify-center gap-2.5 rounded-xl bg-[#25D366] text-[15px] font-semibold text-white transition-all hover:brightness-110"
          >
            <WhatsAppIcon className="h-5 w-5" />
            Chamar no WhatsApp
          </a>
        )}

        <div className="grid grid-cols-2 gap-2.5">
          <Button variant="outline" onClick={() => setOpenForm("proposta")}>
            <WalletIcon className="h-4 w-4" />
            Fazer proposta
          </Button>
          <Button variant="outline" onClick={handleShare}>
            <ShareIcon className="h-4 w-4" />
            Compartilhar
          </Button>
        </div>
      </div>

      <LeadModal
        vehicle={vehicle}
        origin={openForm}
        onClose={() => setOpenForm(null)}
      />
    </>
  );
}

// ── Formulário de lead ───────────────────────────────────────

export function LeadModal({
  vehicle,
  origin,
  onClose,
}: {
  vehicle?: Vehicle;
  origin: LeadOrigin | null;
  onClose: () => void;
}) {
  if (!origin) return null;
  const isOffer = origin === "proposta";
  return (
    <Modal
      open
      onClose={onClose}
      title={isOffer ? "Enviar proposta" : "Tenho interesse"}
      size="md"
    >
      <LeadForm vehicle={vehicle} origin={origin} onDone={onClose} />
    </Modal>
  );
}

export function LeadForm({
  vehicle,
  origin,
  onDone,
}: {
  vehicle?: Vehicle;
  origin: LeadOrigin;
  onDone?: () => void;
}) {
  const { store } = useStoreView();
  const toast = useToast();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [offer, setOffer] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const isOffer = origin === "proposta";

  function validate() {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Informe seu nome.";
    if (onlyDigits(phone).length < 10) next.phone = "Informe um telefone com DDD.";
    if (email.trim() && !isValidEmail(email)) next.email = "Digite um e-mail válido.";
    if (isOffer && Number(onlyDigits(offer)) <= 0) next.offer = "Informe o valor da proposta.";
    if (!consent) next.consent = "Precisamos da sua autorização para entrar em contato.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    // Trava contra envio duplicado: clique repetido ou Enter enquanto salva.
    if (loading || sent) return;
    if (!validate()) return;

    const client = getBrowserClient();
    if (!client) {
      toast.error("Não foi possível enviar agora. Tente pelo WhatsApp.");
      return;
    }

    setLoading(true);
    try {
      await insertPublicLead(client, {
        storeId: store.id,
        vehicleId: vehicle?.id,
        vehicleLabel: vehicle ? vehicleFullTitle(vehicle) : "",
        name: name.trim(),
        phone: onlyDigits(phone),
        whatsapp: onlyDigits(phone),
        email: email.trim(),
        message: message.trim(),
        origin,
        offerAmount: isOffer ? Number(onlyDigits(offer)) : null,
      });
      setSent(true);
      toast.success("Recebemos seu contato! A loja vai responder em breve.");
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível enviar. Tente novamente ou chame no WhatsApp.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <span className="accent-border accent-text flex h-14 w-14 items-center justify-center rounded-full border">
          <ChatIcon className="h-6 w-6" />
        </span>
        <h3 className="font-display text-xl text-cream">Contato enviado</h3>
        <p className="max-w-sm text-sm leading-relaxed text-mute">
          A equipe da {store.name} recebeu sua mensagem e entrará em contato pelo telefone informado.
        </p>
        {store.whatsappNumber && vehicle && (
          <a
            href={buildWhatsAppUrl(store.whatsappNumber, buildVehicleMessage(store, vehicle))}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#25D366] px-5 text-sm font-semibold text-white"
          >
            <WhatsAppIcon className="h-4 w-4" />
            Falar agora no WhatsApp
          </a>
        )}
        {onDone && (
          <Button variant="ghost" onClick={onDone}>
            Fechar
          </Button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {vehicle && (
        <div className="surface-raised rounded-xl px-4 py-3">
          <p className="text-[12px] text-mute">Veículo de interesse</p>
          <p className="mt-0.5 text-sm text-cream">{vehicleFullTitle(vehicle)}</p>
          <p className="accent-text mt-0.5 text-sm font-semibold">{formatVehiclePrice(currentPrice(vehicle))}</p>
        </div>
      )}

      <Field
        label="Nome completo"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        autoComplete="name"
        required
      />
      <Field
        label="Telefone / WhatsApp"
        value={phone}
        onChange={(e) => setPhone(formatPhone(e.target.value))}
        error={errors.phone}
        inputMode="tel"
        autoComplete="tel"
        placeholder="(11) 90000-0000"
        required
      />
      <Field
        label="E-mail (opcional)"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        autoComplete="email"
      />

      {isOffer && (
        <Field
          label="Valor da proposta"
          value={offer}
          onChange={(e) => setOffer(e.target.value.replace(/\D/g, ""))}
          error={errors.offer}
          inputMode="numeric"
          hint={offer ? formatVehiclePrice(Number(offer)) : "Digite apenas números."}
        />
      )}

      <TextArea
        label="Mensagem (opcional)"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        placeholder="Conte o que você gostaria de saber."
      />

      <label className="flex cursor-pointer items-start gap-3 text-[13px] leading-relaxed text-mute">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-[18px] w-[18px] shrink-0 accent-[var(--store-accent)]"
        />
        <span>
          Autorizo a {store.name} a usar meus dados para responder este contato.
          {errors.consent && <span className="mt-1 block text-red-400">{errors.consent}</span>}
        </span>
      </label>

      <Button type="submit" loading={loading} full size="lg" className="h-14 rounded-full text-[16px]">
        {loading ? "Enviando..." : "Enviar contato"}
      </Button>
    </form>
  );
}

// ── Simulação de financiamento ───────────────────────────────

const RATE_OPTIONS = [
  { value: "1.29", label: "1,29% a.m." },
  { value: "1.59", label: "1,59% a.m." },
  { value: "1.89", label: "1,89% a.m." },
  { value: "2.19", label: "2,19% a.m." },
];

const TERM_OPTIONS = [12, 24, 36, 48, 60];

export function FinancingSimulator({ vehicle }: { vehicle: Vehicle }) {
  const price = currentPrice(vehicle);
  const [down, setDown] = useState(String(Math.round(price * 0.3)));
  const [term, setTerm] = useState(48);
  const [rate, setRate] = useState("1.59");

  const installment = useMemo(() => {
    const financed = Math.max(price - Number(down || 0), 0);
    const monthlyRate = Number(rate) / 100;
    if (financed <= 0) return 0;
    if (monthlyRate === 0) return financed / term;
    // Tabela Price
    const factor = (1 + monthlyRate) ** term;
    return (financed * monthlyRate * factor) / (factor - 1);
  }, [price, down, term, rate]);

  return (
    <div className="surface rounded-2xl p-5">
      <h3 className="font-display text-lg text-cream">Simule seu financiamento</h3>
      <p className="mt-1 text-[13px] text-mute">
        Cálculo aproximado pela Tabela Price, só para você ter uma referência.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <Field
          label="Entrada"
          value={down}
          onChange={(e) => setDown(e.target.value.replace(/\D/g, ""))}
          inputMode="numeric"
          hint={formatVehiclePrice(Number(down || 0))}
        />
        <Select label="Parcelas" value={String(term)} onChange={(e) => setTerm(Number(e.target.value))}>
          {TERM_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}x
            </option>
          ))}
        </Select>
        <Select label="Taxa estimada" value={rate} onChange={(e) => setRate(e.target.value)}>
          {RATE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-3 border-t border-white/8 pt-5">
        <div>
          <p className="text-[12px] text-mute">Parcela estimada</p>
          <p className="font-display text-3xl accent-text">
            {installment > 0 ? formatVehiclePrice(installment) : "—"}
          </p>
        </div>
        <p className="max-w-xs text-[11.5px] leading-relaxed text-graphite-500">
          Valores simulados, sem consulta de crédito. As condições finais dependem da análise da
          financeira.
        </p>
      </div>
    </div>
  );
}
