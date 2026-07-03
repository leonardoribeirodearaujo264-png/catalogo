"use client";

import { useEffect, useState } from "react";
import { useAdminCatalog } from "@/lib/admin-catalog-context";
import { fetchOwnerLeads, type LeadSummary } from "@/lib/supabase/queries";
import { formatPrice } from "@/lib/utils";

export default function AdminOrdersPage() {
  const { catalog, loading: catalogLoading } = useAdminCatalog();
  const [leads, setLeads] = useState<LeadSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!catalog) return;
    let cancelled = false;
    fetchOwnerLeads(catalog.id)
      .then((data) => {
        if (!cancelled) setLeads(data);
      })
      .catch(() => {
        if (!cancelled) setError("Não foi possível carregar os pedidos.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [catalog]);

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900">Pedidos</h1>
      <p className="mt-1 text-sm text-gray-500">
        Registro de interesses enviados a partir do botão de compra do catálogo.
      </p>

      {(catalogLoading || loading) && <p className="mt-6 text-sm text-gray-400">Carregando...</p>}
      {error && <p className="mt-6 text-sm font-semibold text-red-600">{error}</p>}

      {!loading && !error && leads.length === 0 && (
        <div className="mt-6 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-gray-300 py-16 text-center">
          <span className="text-4xl">📬</span>
          <h3 className="text-lg font-bold text-gray-900">Nenhum pedido ainda</h3>
          <p className="text-sm text-gray-500">Assim que alguém comprar pelo WhatsApp, aparece aqui.</p>
        </div>
      )}

      {!loading && leads.length > 0 && (
        <div className="mt-6 space-y-3">
          {leads.map((lead) => {
            const total = lead.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
            return (
              <div key={lead.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{new Date(lead.createdAt).toLocaleString("pt-BR")}</span>
                  <span className="font-bold text-gray-900">{formatPrice(total)}</span>
                </div>
                <ul className="mt-2 space-y-1 text-sm text-gray-700">
                  {lead.items.map((item, i) => (
                    <li key={i}>
                      {item.quantity}x {item.name}
                      {item.variationName ? ` (${item.variationName})` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
