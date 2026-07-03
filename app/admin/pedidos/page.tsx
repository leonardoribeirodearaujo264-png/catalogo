"use client";

import { useEffect, useState } from "react";
import { useAdminCatalog } from "@/lib/admin-catalog-context";
import { useAuth } from "@/lib/auth-context";
import { deleteOrderRow, fetchOwnerOrders, insertTransaction, updateOrderRow } from "@/lib/supabase/queries";
import { isSameMonth } from "@/lib/financial-utils";
import { StatCard } from "@/components/admin/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { MarkSoldModal, type SoldPayload } from "@/components/admin/pedidos/mark-sold-modal";
import { formatPrice } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types/catalog";

const STATUS_TONE: Record<OrderStatus, "amber" | "green" | "red"> = {
  pendente: "amber",
  vendido: "green",
  perdido: "red",
};
const STATUS_LABEL: Record<OrderStatus, string> = {
  pendente: "Pendente",
  vendido: "Vendido",
  perdido: "Perdido",
};

type Filter = "todos" | OrderStatus;

export default function AdminOrdersPage() {
  const { catalog, loading: catalogLoading } = useAdminCatalog();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("todos");
  const [soldModalOrder, setSoldModalOrder] = useState<Order | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState({ customerName: "", customerPhone: "", notes: "" });

  useEffect(() => {
    if (!catalog) return;
    let cancelled = false;
    fetchOwnerOrders(catalog.id)
      .then((data) => {
        if (!cancelled) setOrders(data);
      })
      .catch(() => {
        if (!cancelled) setError("Não foi possível carregar os pedidos. Rode o supabase/setup.sql mais recente.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [catalog]);

  if (catalogLoading || loading) return <p className="text-sm text-gray-400">Carregando...</p>;
  if (error) return <p className="text-sm font-semibold text-red-600">{error}</p>;

  const now = new Date();
  const soldThisMonth = orders
    .filter((o) => o.status === "vendido" && isSameMonth(new Date(o.updatedAt), now.getFullYear(), now.getMonth()))
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingTotal = orders.filter((o) => o.status === "pendente").reduce((sum, o) => sum + o.totalAmount, 0);
  const lostTotal = orders.filter((o) => o.status === "perdido").reduce((sum, o) => sum + o.totalAmount, 0);

  const filtered = filter === "todos" ? orders : orders.filter((o) => o.status === filter);

  function patchOrder(id: string, patch: Partial<Order>) {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  }

  async function handleMarkLost(order: Order) {
    await updateOrderRow(order.id, { status: "perdido" });
    patchOrder(order.id, { status: "perdido" });
  }

  async function handleReopen(order: Order) {
    await updateOrderRow(order.id, { status: "pendente" });
    patchOrder(order.id, { status: "pendente" });
  }

  async function handleDelete(order: Order) {
    if (!confirm("Excluir este pedido? Essa ação não pode ser desfeita.")) return;
    await deleteOrderRow(order.id);
    setOrders((prev) => prev.filter((o) => o.id !== order.id));
  }

  async function handleConfirmSold(payload: SoldPayload) {
    if (!soldModalOrder || !catalog || !user) return;
    await insertTransaction({
      userId: user.id,
      catalogId: catalog.id,
      orderId: soldModalOrder.id,
      type: "receita",
      description: `Pedido via WhatsApp${soldModalOrder.customerName ? ` — ${soldModalOrder.customerName}` : ""}`,
      customerName: soldModalOrder.customerName,
      amount: payload.amount,
      status: "pago",
      paymentMethod: payload.paymentMethod || undefined,
      paidDate: payload.paidDate,
      notes: payload.notes || undefined,
    });
    await updateOrderRow(soldModalOrder.id, { status: "vendido" });
    patchOrder(soldModalOrder.id, { status: "vendido" });
    setSoldModalOrder(null);
  }

  function startEdit(order: Order) {
    setEditingId(order.id);
    setEditDraft({
      customerName: order.customerName ?? "",
      customerPhone: order.customerPhone ?? "",
      notes: order.notes ?? "",
    });
  }

  async function saveEdit() {
    if (!editingId) return;
    const patch = {
      customerName: editDraft.customerName || undefined,
      customerPhone: editDraft.customerPhone || undefined,
      notes: editDraft.notes || undefined,
    };
    await updateOrderRow(editingId, patch);
    patchOrder(editingId, patch);
    setEditingId(null);
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">Pedidos</h1>
      <p className="mt-1 text-sm text-gray-500">Pedidos enviados pelo carrinho ou botão de WhatsApp do catálogo.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label="Vendido no mês" value={formatPrice(soldThisMonth)} icon="✅" tone="green" />
        <StatCard label="Pendente" value={formatPrice(pendingTotal)} icon="⏳" tone="amber" />
        <StatCard label="Perdido" value={formatPrice(lostTotal)} icon="❌" tone="red" />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {(["todos", "pendente", "vendido", "perdido"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-bold transition-colors ${
              filter === f ? "border-gray-900 bg-gray-900 text-white" : "border-gray-300 text-gray-600 hover:border-gray-900"
            }`}
          >
            {f === "todos" ? "Todos" : STATUS_LABEL[f]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-gray-300 py-16 text-center">
          <span className="text-4xl">📬</span>
          <h3 className="text-lg font-bold text-gray-900">Nenhum pedido por aqui</h3>
          <p className="text-sm text-gray-500">Assim que alguém enviar um pedido pelo WhatsApp, aparece aqui.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {filtered.map((order) => (
            <div key={order.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge tone={STATUS_TONE[order.status]}>{STATUS_LABEL[order.status]}</Badge>
                  <span className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString("pt-BR")}</span>
                </div>
                <span className="font-extrabold text-gray-900">{formatPrice(order.totalAmount)}</span>
              </div>

              <ul className="mt-2 space-y-0.5 text-sm text-gray-700">
                {order.items.map((item, i) => (
                  <li key={i}>
                    {item.quantity}x {item.name}
                    {item.variationName ? ` (${item.variationName})` : ""}
                  </li>
                ))}
              </ul>

              {editingId === order.id ? (
                <div className="mt-3 space-y-2 rounded-xl border border-gray-200 bg-gray-50 p-3">
                  <Input
                    placeholder="Nome do cliente"
                    value={editDraft.customerName}
                    onChange={(e) => setEditDraft({ ...editDraft, customerName: e.target.value })}
                  />
                  <Input
                    placeholder="Telefone"
                    value={editDraft.customerPhone}
                    onChange={(e) => setEditDraft({ ...editDraft, customerPhone: e.target.value })}
                  />
                  <Textarea
                    placeholder="Observações"
                    rows={2}
                    value={editDraft.notes}
                    onChange={(e) => setEditDraft({ ...editDraft, notes: e.target.value })}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveEdit}>Salvar</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancelar</Button>
                  </div>
                </div>
              ) : (
                (order.customerName || order.customerPhone || order.notes) && (
                  <p className="mt-2 text-xs text-gray-500">
                    {[order.customerName, order.customerPhone].filter(Boolean).join(" · ")}
                    {order.notes && <span className="block italic">{order.notes}</span>}
                  </p>
                )
              )}

              <div className="mt-3 flex flex-wrap gap-2 border-t border-gray-100 pt-3">
                {order.status === "pendente" && (
                  <>
                    <Button size="sm" variant="brand" onClick={() => setSoldModalOrder(order)}>✅ Vendido</Button>
                    <Button size="sm" variant="danger" onClick={() => handleMarkLost(order)}>❌ Perdido</Button>
                  </>
                )}
                {order.status !== "pendente" && (
                  <Button size="sm" variant="outline" onClick={() => handleReopen(order)}>↩ Reabrir</Button>
                )}
                {editingId !== order.id && (
                  <Button size="sm" variant="ghost" onClick={() => startEdit(order)}>Editar</Button>
                )}
                <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDelete(order)}>Excluir</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {soldModalOrder && (
        <MarkSoldModal order={soldModalOrder} onClose={() => setSoldModalOrder(null)} onConfirm={handleConfirmSold} />
      )}
    </div>
  );
}
