"use client";

import type { MouseEvent } from "react";
import { ItemImage } from "@/components/item-image";
import { Badge } from "@/components/ui/badge";
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
      className="flex cursor-pointer items-center gap-3 rounded-2xl border border-gray-200 bg-white p-3 transition-shadow hover:shadow-md sm:gap-4 sm:p-4"
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100 sm:h-20 sm:w-20">
        <ItemImage src={item.image} icon={category?.icon ?? "🛍️"} seed={item.id} alt={item.name} />
        {outOfStock && (
          <span className="absolute inset-0 flex items-center justify-center bg-white/70 text-[10px] font-bold text-gray-500">
            Esgotado
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          {item.kind === "servico" && <Badge tone="dark">Serviço</Badge>}
          {hasDiscount && !outOfStock && <Badge tone="green">-{discountPct}%</Badge>}
        </div>
        <h3 className="truncate text-sm font-bold text-gray-900">{item.name}</h3>
        {item.description && <p className="line-clamp-1 text-xs text-gray-400">{item.description}</p>}
        <div className="mt-0.5 flex items-baseline gap-1.5">
          {hasDiscount && <span className="text-xs font-semibold text-gray-400 line-through">{formatPrice(item.priceCompare!)}</span>}
          <span className="text-sm font-extrabold text-gray-900">{formatPrice(item.price)}</span>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-stretch gap-1.5 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={handleAddClick}
          disabled={outOfStock}
          className="rounded-full bg-gray-900 px-3.5 py-2 text-xs font-bold text-white transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {added ? "✓" : outOfStock ? "—" : "Adicionar"}
        </button>
        <button
          type="button"
          onClick={handleWhatsAppClick}
          disabled={outOfStock}
          aria-label="Enviar pelo WhatsApp"
          className="flex h-8 w-8 shrink-0 items-center justify-center self-center rounded-full bg-[#16a34a] text-white transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <WhatsAppIcon className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
