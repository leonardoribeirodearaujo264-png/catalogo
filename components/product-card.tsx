"use client";

import type { MouseEvent } from "react";
import { ItemImage } from "@/components/item-image";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import type { CatalogItem, Category } from "@/types/catalog";

export function ProductCard({
  item,
  category,
  added,
  onOpen,
  onQuickAdd,
}: {
  item: CatalogItem;
  category?: Category;
  added?: boolean;
  onOpen: (item: CatalogItem) => void;
  onQuickAdd: (item: CatalogItem) => void;
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
    onQuickAdd(item);
  }

  return (
    <div
      onClick={() => onOpen(item)}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
        <ItemImage
          src={item.image}
          icon={category?.icon ?? "🛍️"}
          seed={item.id}
          alt={item.name}
          className="transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute left-2 top-2 flex flex-col gap-1.5">
          {item.kind === "servico" && <Badge tone="dark">Serviço</Badge>}
          {outOfStock ? (
            <Badge tone="gray">Esgotado</Badge>
          ) : hasDiscount ? (
            <Badge tone="green">-{discountPct}%</Badge>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3.5 sm:p-4">
        <h3 className="line-clamp-2 text-sm font-bold text-gray-900">{item.name}</h3>

        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <div className="min-w-0">
            {hasDiscount && (
              <div className="text-[11px] font-semibold text-gray-400 line-through">{formatPrice(item.priceCompare!)}</div>
            )}
            <div className="truncate text-base font-extrabold text-gray-900">{formatPrice(item.price)}</div>
          </div>
          <button
            type="button"
            onClick={handleAddClick}
            disabled={outOfStock}
            className="shrink-0 rounded-full bg-gray-900 px-3.5 py-2 text-xs font-bold text-white transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 sm:px-4"
          >
            {added ? "✓" : outOfStock ? "—" : "+ Adicionar"}
          </button>
        </div>
      </div>
    </div>
  );
}
