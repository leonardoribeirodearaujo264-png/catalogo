"use client";

import type { MouseEvent } from "react";
import { ItemImage } from "@/components/item-image";
import { Badge } from "@/components/ui/badge";
import { DiscountBadge } from "@/components/discount-badge";
import { WhatsAppIcon } from "@/components/icons";
import { formatPrice } from "@/lib/utils";
import type { CatalogItem, Category } from "@/types/catalog";

export function ProductListItem({
  item,
  category,
  added,
  onOpen,
  onAddToCart,
  onWhatsAppBuy,
}: {
  item: CatalogItem;
  category?: Category;
  added?: boolean;
  onOpen: (item: CatalogItem) => void;
  onAddToCart: (item: CatalogItem) => void;
  onWhatsAppBuy: (item: CatalogItem) => void;
}) {
  const hasDiscount = !!item.priceCompare && item.priceCompare > item.price;
  const discountPct = hasDiscount ? Math.round((1 - item.price / item.priceCompare!) * 100) : 0;
  const outOfStock = item.stock !== null && item.stock !== undefined && item.stock <= 0;
  const needsVariation = (item.variations?.length ?? 0) > 0;

  function handleAddClick(e: MouseEvent) {
    e.stopPropagation();
    if (outOfStock) return;
    if (needsVariation) {
      onOpen(item);
      return;
    }
    onAddToCart(item);
  }

  function handleWhatsAppClick(e: MouseEvent) {
    e.stopPropagation();
    if (outOfStock) return;
    if (needsVariation) {
      onOpen(item);
      return;
    }
    onWhatsAppBuy(item);
  }

  return (
    <div
      onClick={() => onOpen(item)}
      className="flex cursor-pointer flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-3.5 transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:gap-4 sm:p-4"
    >
      <div className="flex items-center gap-3 sm:contents">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100">
          <ItemImage src={item.image} icon={category?.icon ?? "🛍️"} seed={item.id} alt={item.name} />
          {outOfStock && (
            <span className="absolute inset-0 flex items-center justify-center bg-white/70 text-[10px] font-bold text-gray-500">
              Esgotado
            </span>
          )}
          {hasDiscount && !outOfStock && (
            <span className="absolute left-1 top-1">
              <DiscountBadge percent={discountPct} />
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          {item.kind === "servico" && (
            <div className="mb-0.5">
              <Badge tone="dark">Serviço</Badge>
            </div>
          )}
          <h3 className="truncate text-sm font-bold text-gray-900">{item.name}</h3>
          {item.description && <p className="line-clamp-1 text-xs text-gray-400">{item.description}</p>}
          <div className="mt-0.5 flex items-baseline gap-1.5">
            {hasDiscount && <span className="text-xs font-semibold text-red-500 line-through">{formatPrice(item.priceCompare!)}</span>}
            <span className="text-base font-extrabold text-green-600">{formatPrice(item.price)}</span>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 flex-col gap-2 sm:w-52">
        <button
          type="button"
          onClick={handleAddClick}
          disabled={outOfStock}
          className="min-h-[44px] w-full rounded-xl bg-gray-900 px-3 py-2.5 text-sm font-bold text-white transition-all active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {added ? "✓ Adicionado" : outOfStock ? "Esgotado" : "+ Adicionar"}
        </button>
        <button
          type="button"
          onClick={handleWhatsAppClick}
          disabled={outOfStock}
          className="flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-xl bg-[#16a34a] px-3 py-2.5 text-sm font-bold text-white transition-all active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <WhatsAppIcon className="h-4 w-4 shrink-0" />
          Comprar pelo WhatsApp
        </button>
      </div>
    </div>
  );
}
