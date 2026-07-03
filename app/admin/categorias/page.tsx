"use client";

import { useState, type FormEvent } from "react";
import { useAdminCatalog } from "@/lib/admin-catalog-context";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import type { Category } from "@/types/catalog";

const EMPTY = { name: "", icon: "🏷️", description: "", active: true };

export default function AdminCategoriesPage() {
  const { categories, items, addCategory, updateCategory, deleteCategory, loading } = useAdminCatalog();
  const [newCat, setNewCat] = useState(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<Category>>({});

  if (loading) return <p className="text-sm text-gray-400">Carregando...</p>;

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!newCat.name.trim()) return;
    try {
      await addCategory({ ...newCat, order: categories.length + 1 });
      setNewCat(EMPTY);
    } catch (err) {
      console.error(err);
      alert("Não foi possível criar a categoria. Verifique sua conexão com o Supabase.");
    }
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setEditDraft(cat);
  }

  async function saveEdit() {
    if (!editingId) return;
    try {
      await updateCategory(editingId, editDraft);
      setEditingId(null);
    } catch (err) {
      console.error(err);
      alert("Não foi possível salvar a categoria. Verifique sua conexão com o Supabase.");
    }
  }

  async function handleDelete(cat: Category) {
    const inUse = items.some((i) => i.categoryId === cat.id);
    const msg = inUse
      ? `"${cat.name}" tem itens vinculados. Excluir mesmo assim?`
      : `Excluir a categoria "${cat.name}"?`;
    if (confirm(msg)) {
      try {
        await deleteCategory(cat.id);
      } catch (err) {
        console.error(err);
        alert("Não foi possível excluir a categoria. Verifique sua conexão com o Supabase.");
      }
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900">Categorias</h1>
      <p className="mt-1 text-sm text-gray-500">Organize seu catálogo em categorias — funciona para qualquer nicho.</p>

      <form onSubmit={handleCreate} className="mt-6 flex flex-wrap items-end gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="w-24">
          <Field label="Ícone">
            <Input value={newCat.icon} onChange={(e) => setNewCat({ ...newCat, icon: e.target.value })} />
          </Field>
        </div>
        <div className="min-w-[200px] flex-1">
          <Field label="Nome da categoria">
            <Input value={newCat.name} onChange={(e) => setNewCat({ ...newCat, name: e.target.value })} placeholder="Ex: Assinaturas" />
          </Field>
        </div>
        <div className="min-w-[240px] flex-1">
          <Field label="Descrição (opcional)">
            <Input value={newCat.description} onChange={(e) => setNewCat({ ...newCat, description: e.target.value })} />
          </Field>
        </div>
        <Button type="submit">+ Adicionar</Button>
      </form>

      <div className="mt-6 space-y-2">
        {categories
          .sort((a, b) => a.order - b.order)
          .map((cat) => (
            <div key={cat.id} className="rounded-xl border border-gray-200 bg-white p-4">
              {editingId === cat.id ? (
                <div className="flex flex-wrap items-end gap-3">
                  <Input className="w-20" value={editDraft.icon ?? ""} onChange={(e) => setEditDraft({ ...editDraft, icon: e.target.value })} />
                  <Input className="min-w-[180px] flex-1" value={editDraft.name ?? ""} onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })} />
                  <Input className="min-w-[220px] flex-1" value={editDraft.description ?? ""} onChange={(e) => setEditDraft({ ...editDraft, description: e.target.value })} />
                  <Button size="sm" onClick={saveEdit}>Salvar</Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancelar</Button>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{cat.icon}</span>
                    <div>
                      <p className="font-bold text-gray-900">{cat.name}</p>
                      {cat.description && <p className="text-xs text-gray-500">{cat.description}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-gray-400">
                      {items.filter((i) => i.categoryId === cat.id).length} itens
                    </span>
                    <button className="text-sm font-semibold text-brand-accent hover:underline" onClick={() => startEdit(cat)}>
                      Editar
                    </button>
                    <button className="text-sm font-semibold text-red-500 hover:underline" onClick={() => handleDelete(cat)}>
                      Excluir
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
