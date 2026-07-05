"use client";

import { ProductCard } from "@/components/product-card";
import { ProductListItem } from "@/components/product-list-item";
import type { ViewMode } from "@/components/view-toggle";
import type { CatalogItem, Category } from "@/types/catalog";

const PREVIEW_COUNT = 6;

export function ProductRail({
  items,
  getCategory,
  watermark,
  mode,
  expanded,
  addedId,
  onOpen,
  onAddToCart,
}: {
  items: CatalogItem[];
  getCategory: (id: string) => Category | undefined;
  watermark?: string;
  mode: ViewMode;
  expanded: boolean;
  addedId?: string | null;
  onOpen: (item: CatalogItem) => void;
  onAddToCart: (item: CatalogItem) => void;
}) {
  if (items.length === 0) return null;

  const visible = expanded ? items : items.slice(0, PREVIEW_COUNT);

  if (mode === "list") {
    return (
      <div className="flex flex-col gap-2.5 px-4">
        {visible.map((item) => (
          <ProductListItem
            key={item.id}
            item={item}
            category={getCategory(item.categoryId)}
            watermark={watermark}
            added={addedId === item.id}
            onOpen={onOpen}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    );
  }

  const size = mode === "featured" ? "large" : "compact";
  const cardWidth = mode === "featured" ? "w-[78%] max-w-[320px]" : "w-[45%] max-w-[210px]";

  if (expanded) {
    return (
      <div className={mode === "featured" ? "flex flex-col gap-4 px-4" : "grid grid-cols-2 gap-3 px-4"}>
        {visible.map((item) => (
          <ProductCard
            key={item.id}
            item={item}
            category={getCategory(item.categoryId)}
            watermark={watermark}
            size={size}
            added={addedId === item.id}
            onOpen={onOpen}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-3 overflow-x-auto px-4 pb-1 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
      {visible.map((item) => (
        <div key={item.id} className={`shrink-0 snap-start ${cardWidth}`}>
          <ProductCard
            item={item}
            category={getCategory(item.categoryId)}
            watermark={watermark}
            size={size}
            added={addedId === item.id}
            onOpen={onOpen}
            onAddToCart={onAddToCart}
          />
        </div>
      ))}
    </div>
  );
}
