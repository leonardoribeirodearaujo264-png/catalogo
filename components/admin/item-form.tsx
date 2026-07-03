"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useCatalog } from "@/lib/catalog-context";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { generateId } from "@/lib/utils";
import type { CatalogItem, ItemKind, ItemVariation } from "@/types/catalog";

type FormState = {
  name: string;
  kind: ItemKind;
  categoryId: string;
  description: string;
  price: string;
  priceCompare: string;
  image: string;
  stockEnabled: boolean;
  stock: string;
  active: boolean;
  featured: boolean;
  promotional: boolean;
  variations: ItemVariation[];
};

function toFormState(item?: CatalogItem, defaultCategoryId?: string): FormState {
  return {
    name: item?.name ?? "",
    kind: item?.kind ?? "produto",
    categoryId: item?.categoryId ?? defaultCategoryId ?? "",
    description: item?.description ?? "",
    price: item ? String(item.price) : "",
    priceCompare: item?.priceCompare ? String(item.priceCompare) : "",
    image: item?.image ?? "",
    stockEnabled: item ? item.stock !== null && item.stock !== undefined : false,
    stock: item?.stock !== null && item?.stock !== undefined ? String(item.stock) : "",
    active: item?.active ?? true,
    featured: item?.featured ?? false,
    promotional: item?.promotional ?? false,
    variations: item?.variations ?? [],
  };
}

export function ItemForm({ item }: { item?: CatalogItem }) {
  const router = useRouter();
  const { categories, addItem, updateItem, deleteItem } = useCatalog();
  const [form, setForm] = useState<FormState>(() => toFormState(item, categories[0]?.id));
  const [saving, setSaving] = useState(false);
  const isEditing = !!item;

  function patch(fields: Partial<FormState>) {
    setForm((prev) => ({ ...prev, ...fields }));
  }

  function addVariation() {
    patch({
      variations: [...form.variations, { id: generateId("var"), name: "", available: true }],
    });
  }

  function updateVariation(id: string, fields: Partial<ItemVariation>) {
    patch({ variations: form.variations.map((v) => (v.id === id ? { ...v, ...fields } : v)) });
  }

  function removeVariation(id: string) {
    patch({ variations: form.variations.filter((v) => v.id !== id) });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const payload = {
      name: form.name.trim(),
      kind: form.kind,
      categoryId: form.categoryId,
      description: form.description.trim(),
      price: Number(form.price) || 0,
      priceCompare: form.priceCompare ? Number(form.priceCompare) : undefined,
      image: form.image.trim(),
      stock: form.stockEnabled ? Number(form.stock) || 0 : null,
      active: form.active,
      featured: form.featured,
      promotional: form.promotional,
      variations: form.variations.filter((v) => v.name.trim()),
    };

    setSaving(true);
    try {
      if (isEditing) {
        await updateItem(item.id, payload);
      } else {
        await addItem(payload);
      }
      router.push("/admin/produtos");
    } catch (err) {
      console.error(err);
      alert("Não foi possível salvar. Verifique sua conexão com o Supabase e tente novamente.");
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!item) return;
    if (confirm(`Excluir "${item.name}"? Essa ação não pode ser desfeita.`)) {
      try {
        await deleteItem(item.id);
        router.push("/admin/produtos");
      } catch (err) {
        console.error(err);
        alert("Não foi possível excluir. Verifique sua conexão com o Supabase e tente novamente.");
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <div className="grid gap-4 rounded-2xl border border-gray-200 bg-white p-6 sm:grid-cols-2">
        <Field label="Nome">
          <Input required value={form.name} onChange={(e) => patch({ name: e.target.value })} placeholder="Ex: Corte de cabelo masculino" />
        </Field>

        <Field label="Tipo">
          <select
            value={form.kind}
            onChange={(e) => patch({ kind: e.target.value as ItemKind })}
            className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-900"
          >
            <option value="produto">Produto</option>
            <option value="servico">Serviço</option>
          </select>
        </Field>

        <Field label="Categoria">
          <select
            required
            value={form.categoryId}
            onChange={(e) => patch({ categoryId: e.target.value })}
            className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-900"
          >
            <option value="" disabled>Selecione...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
            ))}
          </select>
        </Field>

        <Field label="URL da imagem" hint="Opcional. Deixe em branco para usar um ícone ilustrativo.">
          <Input value={form.image} onChange={(e) => patch({ image: e.target.value })} placeholder="https://..." />
        </Field>

        <div className="sm:col-span-2">
          <Field label="Descrição">
            <Textarea rows={4} value={form.description} onChange={(e) => patch({ description: e.target.value })} placeholder="Detalhes do produto ou serviço" />
          </Field>
        </div>

        <Field label="Preço (R$)">
          <Input required type="number" step="0.01" min="0" value={form.price} onChange={(e) => patch({ price: e.target.value })} />
        </Field>

        <Field label="Preço 'de' (opcional)" hint="Preencha para mostrar desconto.">
          <Input type="number" step="0.01" min="0" value={form.priceCompare} onChange={(e) => patch({ priceCompare: e.target.value })} />
        </Field>

        <div className="flex items-center gap-2 pt-6">
          <input
            id="stockEnabled"
            type="checkbox"
            checked={form.stockEnabled}
            onChange={(e) => patch({ stockEnabled: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300"
          />
          <label htmlFor="stockEnabled" className="text-sm font-semibold text-gray-700">Controlar estoque</label>
        </div>

        {form.stockEnabled && (
          <Field label="Quantidade em estoque">
            <Input type="number" min="0" value={form.stock} onChange={(e) => patch({ stock: e.target.value })} />
          </Field>
        )}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900">Variações (tamanhos, sabores, pacotes...)</h3>
          <Button type="button" size="sm" variant="secondary" onClick={addVariation}>+ Adicionar</Button>
        </div>

        {form.variations.length === 0 && (
          <p className="mt-2 text-xs text-gray-400">Nenhuma variação. Use para tamanhos, cores, sabores ou pacotes de serviço.</p>
        )}

        <div className="mt-4 space-y-2">
          {form.variations.map((v) => (
            <div key={v.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 p-2.5">
              <Input
                className="max-w-[200px]"
                placeholder="Nome (ex: M, Corte + barba)"
                value={v.name}
                onChange={(e) => updateVariation(v.id, { name: e.target.value })}
              />
              <Input
                className="max-w-[140px]"
                type="number"
                step="0.01"
                placeholder="Preço (opcional)"
                value={v.price ?? ""}
                onChange={(e) => updateVariation(v.id, { price: e.target.value ? Number(e.target.value) : undefined })}
              />
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                <input type="checkbox" checked={v.available} onChange={(e) => updateVariation(v.id, { available: e.target.checked })} />
                Disponível
              </label>
              <button type="button" onClick={() => removeVariation(v.id)} className="ml-auto text-xs font-semibold text-red-500 hover:text-red-700">
                Remover
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h3 className="mb-3 text-sm font-bold text-gray-900">Visibilidade</h3>
        <div className="flex flex-wrap gap-5">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <input type="checkbox" checked={form.active} onChange={(e) => patch({ active: e.target.checked })} />
            Ativo no catálogo
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <input type="checkbox" checked={form.featured} onChange={(e) => patch({ featured: e.target.checked })} />
            Destaque na home
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <input type="checkbox" checked={form.promotional} onChange={(e) => patch({ promotional: e.target.checked })} />
            Promocional
          </label>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Salvando..." : isEditing ? "Salvar alterações" : "Cadastrar item"}
        </Button>
        {isEditing && (
          <Button type="button" variant="danger" onClick={handleDelete} disabled={saving}>Excluir</Button>
        )}
      </div>
    </form>
  );
}
