"use client";

import type { MouseEvent } from "react";
import { ItemImage } from "@/components/item-image";
import { Badge } from "@/components/ui/badge";
import { DiscountBadge } from "@/components/discount-badge";
import { formatPrice, cn } from "@/lib/utils";
import type { CatalogItem, Category } from "@/types/catalog";

export function ProductCard({
  item,
  category,
  watermark,
  size = "compact",
  added,
  onOpen,
  onAddToCart,
}: {
  item: CatalogItem;
  category?: Category;
  watermark?: string;
  size?: "compact" | "large";
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
      className="flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-[#E4E4E4] bg-white transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square w-full overflow-hidden">
        <ItemImage src={item.image} icon={category?.icon ?? "🛍️"} alt={item.name} watermark={watermark} />

        <div className="absolute left-2 top-2 flex flex-col items-start gap-1.5">
          {item.kind === "servico" && <Badge tone="dark">Serviço</Badge>}
          {outOfStock ? <Badge tone="gray">Esgotado</Badge> : hasDiscount ? <DiscountBadge percent={discountPct} /> : null}
        </div>

        <button
          type="button"
          onClick={handleAddClick}
          disabled={outOfStock}
          aria-label="Adicionar ao carrinho"
          className={cn(
            "absolute bottom-2 right-2 flex items-center justify-center rounded-xl bg-black text-white shadow-md transition-all active:scale-90 disabled:cursor-not-allowed disabled:bg-gray-400",
            size === "large" ? "h-12 w-12" : "h-11 w-11",
          )}
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

      <div className="flex flex-1 flex-col items-center gap-1 px-3 py-3 text-center">
        <h3 className={cn("line-clamp-2 font-medium text-[#444444]", size === "large" ? "text-sm" : "text-xs")}>
          {item.name}
        </h3>
        <div className="mt-auto pt-1">
          {hasDiscount && (
            <div className="text-xs font-semibold text-red-500 line-through">{formatPrice(item.priceCompare!)}</div>
          )}
          <div className={cn("font-bold text-black", size === "large" ? "text-xl" : "text-base")}>
            {formatPrice(item.price)}
          </div>
        </div>
      </div>
    </div>
  );
}
