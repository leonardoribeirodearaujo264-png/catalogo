"use client";

import { useState, type FormEvent } from "react";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CloseIcon } from "@/components/icons";
import { PAYMENT_METHOD_LABELS } from "@/types/financial";
import type { PaymentMethod } from "@/types/financial";
import type { Order } from "@/types/catalog";

export interface SoldPayload {
  amount: number;
  paymentMethod: PaymentMethod | "";
  paidDate: string;
  notes: string;
}

export function MarkSoldModal({
  order,
  onClose,
  onConfirm,
}: {
  order: Order;
  onClose: () => void;
  onConfirm: (payload: SoldPayload) => Promise<void>;
}) {
  const [amount, setAmount] = useState(String(order.totalAmount));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
  const [paidDate, setPaidDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onConfirm({ amount: Number(amount) || 0, paymentMethod, paidDate, notes });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-gray-900">Marcar como vendido</h2>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100">
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>
        <p className="mb-4 text-sm text-gray-500">
          Isso cria um lançamento de receita no financeiro vinculado a este pedido.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Valor final (R$)">
            <Input required type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </Field>
          <Field label="Forma de pagamento">
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod | "")}
              className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-900"
            >
              <option value="">Selecione...</option>
              {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </Field>
          <Field label="Data do pagamento">
            <Input type="date" value={paidDate} onChange={(e) => setPaidDate(e.target.value)} />
          </Field>
          <Field label="Observações" hint="Opcional.">
            <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Field>

          <div className="flex gap-3 pt-2">
            <Button type="submit" variant="brand" disabled={saving} className="flex-1">
              {saving ? "Salvando..." : "Confirmar venda"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
