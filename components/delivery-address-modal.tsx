"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useCatalogView } from "@/lib/catalog-view-context";
import { useDeliveryAddress } from "@/lib/delivery-address-context";
import { Field, Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CloseIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import type { DeliveryAddress } from "@/types/catalog";

const FORM_ID = "delivery-address-form";

const EMPTY_ADDRESS: DeliveryAddress = {
  recipientName: "",
  zip: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
  reference: "",
};

const REQUIRED_FIELDS = [
  "recipientName",
  "zip",
  "street",
  "number",
  "neighborhood",
  "city",
  "state",
] as const;

function formatZip(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function DeliveryAddressModal({ onClose }: { onClose: () => void }) {
  const { catalog } = useCatalogView();
  const { getAddress, saveAddress } = useDeliveryAddress();
  const [form, setForm] = useState<DeliveryAddress>(() => ({
    ...EMPTY_ADDRESS,
    ...(getAddress(catalog.id) ?? {}),
  }));
  const [errors, setErrors] = useState<Partial<Record<keyof DeliveryAddress, boolean>>>({});

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  function patch(fields: Partial<DeliveryAddress>) {
    setForm((prev) => ({ ...prev, ...fields }));
  }

  async function handleZipBlur() {
    const digits = form.zip.replace(/\D/g, "");
    if (digits.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (!data || data.erro) return;
      setForm((prev) => ({
        ...prev,
        street: prev.street || data.logradouro || prev.street,
        neighborhood: prev.neighborhood || data.bairro || prev.neighborhood,
        city: prev.city || data.localidade || prev.city,
        state: prev.state || data.uf || prev.state,
      }));
    } catch {
      // Busca automática por CEP indisponível — preenchimento manual segue funcionando.
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors: Partial<Record<keyof DeliveryAddress, boolean>> = {};
    for (const field of REQUIRED_FIELDS) {
      if (!form[field]?.trim()) nextErrors[field] = true;
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    saveAddress(catalog.id, { ...form, state: form.state.trim().toUpperCase().slice(0, 2) });
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 className="text-base font-extrabold text-gray-900">Endereço de entrega</h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </header>

        <form id={FORM_ID} onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4">
          <div className="flex flex-col gap-4">
            <Field label="Nome de quem recebe">
              <Input
                value={form.recipientName}
                onChange={(e) => patch({ recipientName: e.target.value })}
                className={cn(errors.recipientName && "border-red-400 focus:border-red-500")}
                placeholder="Ex.: Maria Silva"
              />
              {errors.recipientName && <p className="mt-1 text-xs font-semibold text-red-500">Informe o nome de quem recebe.</p>}
            </Field>

            <Field label="CEP">
              <Input
                value={form.zip}
                inputMode="numeric"
                onChange={(e) => patch({ zip: formatZip(e.target.value) })}
                onBlur={handleZipBlur}
                className={cn(errors.zip && "border-red-400 focus:border-red-500")}
                placeholder="00000-000"
                maxLength={9}
              />
              {errors.zip && <p className="mt-1 text-xs font-semibold text-red-500">Informe o CEP.</p>}
            </Field>

            <Field label="Rua / Logradouro">
              <Input
                value={form.street}
                onChange={(e) => patch({ street: e.target.value })}
                className={cn(errors.street && "border-red-400 focus:border-red-500")}
                placeholder="Ex.: Rua das Flores"
              />
              {errors.street && <p className="mt-1 text-xs font-semibold text-red-500">Informe a rua.</p>}
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Número">
                <Input
                  value={form.number}
                  onChange={(e) => patch({ number: e.target.value })}
                  className={cn(errors.number && "border-red-400 focus:border-red-500")}
                  placeholder="Ex.: 123"
                />
                {errors.number && <p className="mt-1 text-xs font-semibold text-red-500">Informe o número.</p>}
              </Field>
              <Field label="Complemento (opcional)">
                <Input
                  value={form.complement ?? ""}
                  onChange={(e) => patch({ complement: e.target.value })}
                  placeholder="Ex.: Apto 12"
                />
              </Field>
            </div>

            <Field label="Bairro">
              <Input
                value={form.neighborhood}
                onChange={(e) => patch({ neighborhood: e.target.value })}
                className={cn(errors.neighborhood && "border-red-400 focus:border-red-500")}
                placeholder="Ex.: Centro"
              />
              {errors.neighborhood && <p className="mt-1 text-xs font-semibold text-red-500">Informe o bairro.</p>}
            </Field>

            <div className="grid grid-cols-[1fr_88px] gap-3">
              <Field label="Cidade">
                <Input
                  value={form.city}
                  onChange={(e) => patch({ city: e.target.value })}
                  className={cn(errors.city && "border-red-400 focus:border-red-500")}
                  placeholder="Ex.: São Paulo"
                />
                {errors.city && <p className="mt-1 text-xs font-semibold text-red-500">Informe a cidade.</p>}
              </Field>
              <Field label="UF">
                <Input
                  value={form.state}
                  onChange={(e) => patch({ state: e.target.value.toUpperCase().slice(0, 2) })}
                  className={cn(errors.state && "border-red-400 focus:border-red-500")}
                  placeholder="SP"
                  maxLength={2}
                />
                {errors.state && <p className="mt-1 text-xs font-semibold text-red-500">UF</p>}
              </Field>
            </div>

            <Field label="Ponto de referência (opcional)">
              <Input
                value={form.reference ?? ""}
                onChange={(e) => patch({ reference: e.target.value })}
                placeholder="Ex.: Perto do mercado"
              />
            </Field>
          </div>
        </form>

        <footer className="border-t border-gray-200 p-5">
          <div className="flex flex-col gap-2">
            <Button type="submit" form={FORM_ID} variant="primary" size="lg" className="w-full">
              Salvar endereço
            </Button>
            <Button type="button" variant="outline" className="w-full" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
}
