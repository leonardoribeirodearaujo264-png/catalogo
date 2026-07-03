"use client";

import { useEffect, useState } from "react";
import { useCatalogView } from "@/lib/catalog-view-context";
import { useInterestList } from "@/lib/interest-context";
import { getBrowserClient } from "@/lib/supabase/browser-client";
import { insertOrder } from "@/lib/supabase/queries";
import { Button } from "@/components/ui/button";
import { CartIcon, CloseIcon, WhatsAppIcon } from "@/components/icons";
import { buildInterestListMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const { catalog } = useCatalogView();
  const { entriesForCatalog, updateQuantity, removeEntry, clear, isCartOpen, closeCart } = useInterestList();
  const entries = entriesForCatalog(catalog.id);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!isCartOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const total = entries.reduce((sum, e) => sum + e.price * e.quantity, 0);

  async function handleFinish() {
    if (entries.length === 0) return;
    setSending(true);
    const message = buildInterestListMessage(catalog.whatsappDefaultMessage, entries);
    const whatsappUrl = buildWhatsAppUrl(catalog.whatsappNumber, message);

    try {
      const client = getBrowserClient();
      if (client) {
        await insertOrder(client, { catalogId: catalog.id, items: entries, totalAmount: total, message });
      }
    } catch (err) {
      console.error("Não foi possível registrar o pedido:", err);
      // segue para o WhatsApp mesmo assim — não trava a compra do cliente
    }

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    clear(catalog.id);
    setSending(false);
    closeCart();
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm" onClick={closeCart}>
      <div
        className="flex h-full w-full max-w-sm flex-col bg-white shadow-2xl animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 className="flex items-center gap-2 text-base font-extrabold text-gray-900">
            <CartIcon className="h-5 w-5" />
            Carrinho
          </h2>
          <button onClick={closeCart} aria-label="Fechar" className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100">
            <CloseIcon className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {entries.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
              <span className="text-4xl">🛍️</span>
              <p className="text-sm font-semibold text-gray-900">Seu carrinho está vazio</p>
              <p className="text-xs text-gray-500">Adicione produtos ou serviços para continuar.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => (
                <div key={`${entry.itemId}-${entry.variationName ?? ""}`} className="flex items-start justify-between gap-3 rounded-xl border border-gray-200 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-gray-900">{entry.name}</p>
                    {entry.variationName && <p className="text-xs text-gray-500">{entry.variationName}</p>}
                    <p className="mt-0.5 text-xs font-semibold text-gray-500">
                      {formatPrice(entry.price)} · subtotal {formatPrice(entry.price * entry.quantity)}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex items-center rounded-lg border border-gray-300">
                        <button
                          className="h-7 w-7 text-gray-600 hover:bg-gray-50"
                          onClick={() => updateQuantity(catalog.id, entry.itemId, entry.variationName, entry.quantity - 1)}
                        >
                          −
                        </button>
                        <span className="w-7 text-center text-xs font-bold">{entry.quantity}</span>
                        <button
                          className="h-7 w-7 text-gray-600 hover:bg-gray-50"
                          onClick={() => updateQuantity(catalog.id, entry.itemId, entry.variationName, entry.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      <button
                        className="text-xs font-semibold text-red-500 hover:underline"
                        onClick={() => removeEntry(catalog.id, entry.itemId, entry.variationName)}
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {entries.length > 0 && (
          <footer className="border-t border-gray-200 p-5">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="text-gray-500">Total</span>
              <span className="text-lg font-extrabold text-gray-900">{formatPrice(total)}</span>
            </div>
            <div className="flex flex-col gap-2">
              <Button variant="whatsapp" size="lg" className="w-full" onClick={handleFinish} disabled={sending}>
                <WhatsAppIcon className="h-4 w-4" />
                {sending ? "Enviando..." : "Enviar pedido pelo WhatsApp"}
              </Button>
              <Button variant="outline" className="w-full" onClick={closeCart}>
                Continuar comprando
              </Button>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}
