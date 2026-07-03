"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAdminCatalog } from "@/lib/admin-catalog-context";
import { useFinancial } from "@/lib/financial-context";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PAYMENT_METHOD_LABELS, STATUS_LABELS } from "@/types/financial";
import type { FinancialTransaction, PaymentMethod, TransactionStatus, TransactionType } from "@/types/financial";

type FormState = {
  type: TransactionType;
  description: string;
  customerName: string;
  productId: string;
  amount: string;
  dueDate: string;
  paidDate: string;
  status: TransactionStatus;
  paymentMethod: PaymentMethod | "";
  notes: string;
};

function toFormState(tx?: FinancialTransaction): FormState {
  return {
    type: tx?.type ?? "receita",
    description: tx?.description ?? "",
    customerName: tx?.customerName ?? "",
    productId: tx?.productId ?? "",
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
  const { items } = useAdminCatalog();
  const { addTransaction, updateTransaction, deleteTransaction } = useFinancial();
  const [form, setForm] = useState<FormState>(() => toFormState(transaction));
  const [saving, setSaving] = useState(false);
  const isEditing = !!transaction;

  function patch(fields: Partial<FormState>) {
    setForm((prev) => ({ ...prev, ...fields }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const payload = {
      type: form.type,
      description: form.description.trim(),
      customerName: form.customerName.trim() || undefined,
      productId: form.productId || undefined,
      amount: Number(form.amount) || 0,
      dueDate: form.dueDate || undefined,
      paidDate: form.paidDate || undefined,
      status: form.status,
      paymentMethod: form.paymentMethod || undefined,
      notes: form.notes.trim() || undefined,
    };

    setSaving(true);
    try {
      if (isEditing) {
        await updateTransaction(transaction.id, payload);
      } else {
        await addTransaction(payload);
      }
      router.push("/admin/financeiro");
    } catch (err) {
      console.error(err);
      alert("Não foi possível salvar o lançamento. Verifique sua conexão com o Supabase.");
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!transaction) return;
    if (confirm("Excluir este lançamento? Essa ação não pode ser desfeita.")) {
      try {
        await deleteTransaction(transaction.id);
        router.push("/admin/financeiro");
      } catch (err) {
        console.error(err);
        alert("Não foi possível excluir. Tente novamente.");
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500">Tipo</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => patch({ type: "receita" })}
            className={cn(
              "rounded-xl border-2 px-4 py-3 text-sm font-bold transition-all",
              form.type === "receita" ? "border-green-600 bg-green-50 text-green-700" : "border-gray-200 text-gray-500 hover:border-gray-300",
            )}
          >
            ↑ Receita
          </button>
          <button
            type="button"
            onClick={() => patch({ type: "despesa" })}
            className={cn(
              "rounded-xl border-2 px-4 py-3 text-sm font-bold transition-all",
              form.type === "despesa" ? "border-red-500 bg-red-50 text-red-600" : "border-gray-200 text-gray-500 hover:border-gray-300",
            )}
          >
            ↓ Despesa
          </button>
        </div>
      </div>

      <div className="grid gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Descrição">
            <Input required value={form.description} onChange={(e) => patch({ description: e.target.value })} placeholder="Ex: Venda balcão, Aluguel, Fornecedor..." />
          </Field>
        </div>

        <Field label="Valor (R$)">
          <Input required type="number" step="0.01" min="0" value={form.amount} onChange={(e) => patch({ amount: e.target.value })} />
        </Field>

        <Field label="Cliente" hint="Opcional.">
          <Input value={form.customerName} onChange={(e) => patch({ customerName: e.target.value })} placeholder="Nome do cliente" />
        </Field>

        <Field label="Produto/serviço relacionado" hint="Opcional.">
          <select
            value={form.productId}
            onChange={(e) => patch({ productId: e.target.value })}
            className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-900"
          >
            <option value="">Nenhum</option>
            {items.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </Field>

        <Field label="Forma de pagamento" hint="Opcional.">
          <select
            value={form.paymentMethod}
            onChange={(e) => patch({ paymentMethod: e.target.value as PaymentMethod | "" })}
            className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-900"
          >
            <option value="">Selecione...</option>
            {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </Field>

        <Field label="Data de vencimento">
          <Input type="date" value={form.dueDate} onChange={(e) => patch({ dueDate: e.target.value })} />
        </Field>

        <Field label="Data de pagamento">
          <Input type="date" value={form.paidDate} onChange={(e) => patch({ paidDate: e.target.value })} />
        </Field>

        <Field label="Status">
          <select
            value={form.status}
            onChange={(e) => patch({ status: e.target.value as TransactionStatus })}
            className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-900"
          >
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </Field>

        <div className="sm:col-span-2">
          <Field label="Observações" hint="Opcional.">
            <Textarea rows={3} value={form.notes} onChange={(e) => patch({ notes: e.target.value })} />
          </Field>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" variant="brand" disabled={saving}>
          {saving ? "Salvando..." : isEditing ? "Salvar alterações" : "Criar lançamento"}
        </Button>
        {isEditing && (
          <Button type="button" variant="danger" onClick={handleDelete} disabled={saving}>Excluir</Button>
        )}
      </div>
    </form>
  );
}
