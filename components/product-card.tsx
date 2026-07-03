"use client";

import type { MouseEvent } from "react";
import { ItemImage } from "@/components/item-image";
import { Badge } from "@/components/ui/badge";
import { DiscountBadge } from "@/components/discount-badge";
import { WhatsAppIcon } from "@/components/icons";
import { formatPrice } from "@/lib/utils";
import type { CatalogItem, Category } from "@/types/catalog";

export function ProductCard({
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
        <div className="absolute left-2 top-2 flex flex-col items-start gap-1.5">
          {item.kind === "servico" && <Badge tone="dark">Serviço</Badge>}
          {outOfStock ? <Badge tone="gray">Esgotado</Badge> : hasDiscount ? <DiscountBadge percent={discountPct} /> : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="line-clamp-2 text-sm font-bold text-gray-900">{item.name}</h3>

        <div className="pt-0.5">
          {hasDiscount && (
            <div className="text-xs font-semibold text-red-500 line-through">{formatPrice(item.priceCompare!)}</div>
          )}
          <div className="truncate text-lg font-extrabold text-green-600">{formatPrice(item.price)}</div>
        </div>

        <div className="mt-auto flex flex-col gap-2 pt-3">
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
            <span className="truncate">
              <span className="sm:hidden">WhatsApp</span>
              <span className="hidden sm:inline">Comprar pelo WhatsApp</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
