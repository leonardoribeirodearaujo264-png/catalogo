"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useAdminStore } from "@/lib/admin-store-context";
import { useFinancial } from "@/lib/financial-context";
import { useToast } from "@/lib/toast-context";
import { cn } from "@/lib/utils";
import { vehicleTitle } from "@/types/vehicle";
import { PAYMENT_METHOD_LABELS, STATUS_LABELS } from "@/types/financial";
import type { FinancialTransaction, PaymentMethod, TransactionStatus, TransactionType } from "@/types/financial";
import { Button } from "@/components/ui/button";
import { Field, Select, TextArea } from "@/components/ui/field";
import { ConfirmDialog } from "@/components/ui/feedback";

interface FormState {
  type: TransactionType;
  description: string;
  customerName: string;
  vehicleId: string;
  amount: string;
  dueDate: string;
  paidDate: string;
  status: TransactionStatus;
  paymentMethod: PaymentMethod | "";
  notes: string;
}

function toFormState(tx?: FinancialTransaction): FormState {
  return {
    type: tx?.type ?? "receita",
    description: tx?.description ?? "",
    customerName: tx?.customerName ?? "",
    vehicleId: tx?.vehicleId ?? "",
    amount: tx ? String(tx.amount) : "",
    dueDate: tx?.dueDate ?? "",
    paidDate: tx?.paidDate ?? "",
    status: tx?.status ?? "pendente",
    paymentMethod: tx?.paymentMethod ?? "",
    notes: tx?.notes ?? "",
  };
}

export function TransactionForm({ transaction }: { transaction?: FinancialTransaction }) {
  const router = useRouter();
  const toast = useToast();
  const { vehicles } = useAdminStore();
  const { addTransaction, updateTransaction, deleteTransaction } = useFinancial();

  const [form, setForm] = useState<FormState>(() => toFormState(transaction));
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isEditing = !!transaction;

  function patch(fields: Partial<FormState>) {
    setForm((prev) => ({ ...prev, ...fields }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const payload = {
      type: form.type,
      description: form.description.trim(),
      customerName: form.customerName.trim() || undefined,
      vehicleId: form.vehicleId || undefined,
      amount: Number(form.amount) || 0,
      dueDate: form.dueDate || undefined,
      paidDate: form.paidDate || undefined,
      status: form.status,
      paymentMethod: form.paymentMethod || undefined,
      notes: form.notes.trim() || undefined,
    };

    setSaving(true);
    try {
      if (isEditing) await updateTransaction(transaction.id, payload);
      else await addTransaction(payload);
      toast.success(isEditing ? "Lançamento atualizado." : "Lançamento criado.");
      router.push("/admin/financeiro");
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível salvar o lançamento.");
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!transaction) return;
    try {
      await deleteTransaction(transaction.id);
      toast.success("Lançamento excluído.");
      router.push("/admin/financeiro");
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível excluir.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-3xl flex-col gap-5">
      <div className="surface rounded-2xl p-5">
        <span className="mb-3 block text-[12px] font-semibold tracking-wide text-mute">TIPO</span>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => patch({ type: "receita" })}
            className={cn(
              "h-12 rounded-xl border text-sm font-semibold transition-colors",
              form.type === "receita"
                ? "border-emerald-500/40 bg-emerald-500/12 text-emerald-300"
                : "border-white/12 text-mute hover:border-white/30",
            )}
          >
            Receita
          </button>
          <button
            type="button"
            onClick={() => patch({ type: "despesa" })}
            className={cn(
              "h-12 rounded-xl border text-sm font-semibold transition-colors",
              form.type === "despesa"
                ? "border-red-500/40 bg-red-500/12 text-red-300"
                : "border-white/12 text-mute hover:border-white/30",
            )}
          >
            Despesa
          </button>
        </div>
      </div>

      <div className="surface grid gap-4 rounded-2xl p-5 sm:grid-cols-2">
        <Field
          label="Descrição *"
          required
          value={form.description}
          onChange={(e) => patch({ description: e.target.value })}
          placeholder="Venda do Corolla XEi, comissão, despachante..."
          className="sm:col-span-2"
        />

        <Field
          label="Valor (R$) *"
          required
          type="number"
          step="0.01"
          min="0"
          value={form.amount}
          onChange={(e) => patch({ amount: e.target.value })}
        />
        <Field
          label="Cliente"
          value={form.customerName}
          onChange={(e) => patch({ customerName: e.target.value })}
        />

        <Select
          label="Veículo relacionado"
          value={form.vehicleId}
          onChange={(e) => patch({ vehicleId: e.target.value })}
        >
          <option value="">Nenhum</option>
          {vehicles.map((vehicle) => (
            <option key={vehicle.id} value={vehicle.id}>
              {vehicleTitle(vehicle)}
              {vehicle.internalCode ? ` (${vehicle.internalCode})` : ""}
            </option>
          ))}
        </Select>

        <Select
          label="Forma de pagamento"
          value={form.paymentMethod}
          onChange={(e) => patch({ paymentMethod: e.target.value as PaymentMethod | "" })}
        >
          <option value="">Selecione</option>
          {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>

        <Field
          label="Vencimento"
          type="date"
          value={form.dueDate}
          onChange={(e) => patch({ dueDate: e.target.value })}
        />
        <Field
          label="Pagamento"
          type="date"
          value={form.paidDate}
          onChange={(e) => patch({ paidDate: e.target.value })}
        />

        <Select
          label="Status"
          value={form.status}
          onChange={(e) => patch({ status: e.target.value as TransactionStatus })}
        >
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>

        <TextArea
          label="Observações"
          rows={3}
          value={form.notes}
          onChange={(e) => patch({ notes: e.target.value })}
          className="sm:col-span-2"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" loading={saving}>
          {isEditing ? "Salvar alterações" : "Criar lançamento"}
        </Button>
        {isEditing && (
          <Button type="button" variant="danger" onClick={() => setConfirmDelete(true)} disabled={saving}>
            Excluir
          </Button>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Excluir lançamento?"
        description="Essa ação não pode ser desfeita."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </form>
  );
}
