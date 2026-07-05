"use client";

import type { MouseEvent } from "react";
import { ItemImage } from "@/components/item-image";
import { Badge } from "@/components/ui/badge";
import { DiscountBadge } from "@/components/discount-badge";
import { formatPrice } from "@/lib/utils";
import type { CatalogItem, Category } from "@/types/catalog";

export function ProductListItem({
  item,
  category,
  watermark,
  added,
  onOpen,
  onAddToCart,
}: {
  item: CatalogItem;
  category?: Category;
  watermark?: string;
  added?: boolean;
  onOpen: (item: CatalogItem) => void;
  onAddToCart: (item: CatalogItem) => void;
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

  return (
    <div
      onClick={() => onOpen(item)}
      className="flex cursor-pointer items-center gap-3 rounded-2xl border border-[#E4E4E4] bg-white p-3 transition-shadow hover:shadow-md"
    >
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
        <ItemImage src={item.image} icon={category?.icon ?? "🛍️"} alt={item.name} watermark={watermark} />
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
        <h3 className="truncate text-sm font-medium text-[#444444]">{item.name}</h3>
        {outOfStock ? (
          <p className="mt-0.5 text-xs font-bold text-gray-400">Esgotado</p>
        ) : (
          <div className="mt-0.5 flex items-baseline gap-1.5">
            {hasDiscount && <span className="text-xs font-semibold text-red-500 line-through">{formatPrice(item.priceCompare!)}</span>}
            <span className="text-base font-bold text-black">{formatPrice(item.price)}</span>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleAddClick}
        disabled={outOfStock}
        aria-label="Adicionar ao carrinho"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-black text-white transition-all active:scale-90 disabled:cursor-not-allowed disabled:bg-gray-400"
      >
        {added ? (
          <span className="text-lg">✓</span>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" strokeWidth={2.2} stroke="currentColor" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        )}
      </button>
    </div>
  );
}
