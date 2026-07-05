"use client";

import { useEffect, useMemo, useState } from "react";
import { useCatalogView } from "@/lib/catalog-view-context";
import { useInterestList } from "@/lib/interest-context";
import { getBrowserClient } from "@/lib/supabase/browser-client";
import { insertOrder } from "@/lib/supabase/queries";
import { ItemImage } from "@/components/item-image";
import { Badge } from "@/components/ui/badge";
import { DiscountBadge } from "@/components/discount-badge";
import { Button } from "@/components/ui/button";
import { CloseIcon, WhatsAppIcon } from "@/components/icons";
import { buildItemInterestMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { formatPrice } from "@/lib/utils";
import type { CatalogItem } from "@/types/catalog";

export function ProductModal({ item, onClose }: { item: CatalogItem; onClose: () => void }) {
  const { catalog, getCategory } = useCatalogView();
  const { addEntry, openCart } = useInterestList();
  const category = getCategory(item.categoryId);

  const [selectedVariationId, setSelectedVariationId] = useState<string | null>(null);
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const selectedVariation = useMemo(
    () => item.variations?.find((v) => v.id === selectedVariationId),
    [item, selectedVariationId],
  );

  const hasDiscount = !!item.priceCompare && item.priceCompare > item.price;
  const discountPct = hasDiscount ? Math.round((1 - item.price / item.priceCompare!) * 100) : 0;
  const outOfStock = item.stock !== null && item.stock !== undefined && item.stock <= 0;
  const needsVariation = (item.variations?.length ?? 0) > 0;
  const canAct = !outOfStock && (!needsVariation || !!selectedVariation);
  const finalPrice = selectedVariation?.price ?? item.price;

  function handleAddToCart() {
    addEntry({
      catalogId: catalog.id,
      itemId: item.id,
      name: item.name,
      price: finalPrice,
      variationName: selectedVariation?.name,
    });
    onClose();
    openCart();
  }

  async function handleWhatsAppBuy() {
    setSendingWhatsApp(true);
    const message = buildItemInterestMessage({
      greeting: catalog.whatsappDefaultMessage,
      itemName: item.name,
      price: finalPrice,
      variationName: selectedVariation?.name,
    });
    const whatsappUrl = buildWhatsAppUrl(catalog.whatsappNumber, message);

    try {
      const client = getBrowserClient();
      if (client) {
        await insertOrder(client, {
          catalogId: catalog.id,
          items: [
            {
              catalogId: catalog.id,
              itemId: item.id,
              name: item.name,
              price: finalPrice,
              variationName: selectedVariation?.name,
              quantity: 1,
            },
          ],
          totalAmount: finalPrice,
          message,
        });
      }
    } catch (err) {
      console.error("Não foi possível registrar o pedido:", err);
    }

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    setSendingWhatsApp(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <div
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-square w-full bg-gray-100 sm:rounded-t-3xl">
          <ItemImage
            src={item.image}
            icon={category?.icon ?? "🛍️"}
            alt={item.name}
            watermark={catalog.businessName.slice(0, 10)}
            className="sm:rounded-t-3xl"
          />
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-md hover:bg-white"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
          <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
            {item.kind === "servico" && <Badge tone="dark">Serviço</Badge>}
            {outOfStock ? <Badge tone="gray">Esgotado</Badge> : hasDiscount ? <DiscountBadge percent={discountPct} /> : null}
          </div>
        </div>

        <div className="p-5 sm:p-6">
          {category && <span className="text-xs font-bold uppercase tracking-wide text-brand-accent">{category.name}</span>}
          <h2 className="mt-1 text-xl font-extrabold text-gray-900">{item.name}</h2>

          <div className="mt-2">
            {hasDiscount && (
              <span className="mr-1.5 text-sm font-semibold text-red-500 line-through">{formatPrice(item.priceCompare!)}</span>
            )}
            <span className="text-2xl font-extrabold text-green-600">{formatPrice(finalPrice)}</span>
          </div>

          {item.description && <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-600">{item.description}</p>}

          {needsVariation && (
            <div className="mt-5">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">Escolha uma opção</p>
              <div className="flex flex-wrap gap-2">
                {item.variations!.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    disabled={!v.available}
                    onClick={() => setSelectedVariationId(v.id)}
                    className={`rounded-lg border px-3.5 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                      selectedVariationId === v.id
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-gray-300 text-gray-700 hover:border-gray-900"
                    }`}
                  >
                    {v.name}
                    {!v.available && " (esgotado)"}
                  </button>
                ))}
              </div>
              {!selectedVariation && (
                <p className="mt-2 text-xs font-semibold text-amber-600">⚠️ Selecione uma opção para continuar</p>
              )}
            </div>
          )}

          <div className="mt-6 flex flex-col gap-2">
            <Button variant="brand" size="lg" className="w-full" disabled={!canAct} onClick={handleAddToCart}>
              {outOfStock ? "Esgotado" : "Adicionar ao carrinho"}
            </Button>
            <Button variant="whatsapp" size="lg" className="w-full" disabled={!canAct || sendingWhatsApp} onClick={handleWhatsAppBuy}>
              <WhatsAppIcon className="h-4 w-4" />
              {sendingWhatsApp ? "Enviando..." : "Comprar pelo WhatsApp"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
