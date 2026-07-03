import Link from "next/link";
import { ItemImage } from "@/components/item-image";
import { Badge } from "@/components/ui/badge";
import { ArrowRightIcon } from "@/components/icons";
import { formatPrice } from "@/lib/utils";
import type { CatalogItem, Category } from "@/types/catalog";

export function ProductCard({ item, category }: { item: CatalogItem; category?: Category }) {
  const hasDiscount = !!item.priceCompare && item.priceCompare > item.price;
  const discountPct = hasDiscount ? Math.round((1 - item.price / item.priceCompare!) * 100) : 0;
  const outOfStock = item.stock !== null && item.stock !== undefined && item.stock <= 0;

  return (
    <Link
      href={`/produto/${item.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-shadow hover:shadow-lg"
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

      <div className="flex flex-1 flex-col gap-1 p-4">
        {category && <span className="text-[11px] font-bold uppercase tracking-wide text-gray-400">{category.name}</span>}
        <h3 className="line-clamp-2 text-sm font-bold text-gray-900">{item.name}</h3>

        <div className="mt-auto flex items-end justify-between pt-3">
          <div>
            {hasDiscount && (
              <span className="mr-1.5 text-xs font-semibold text-gray-400 line-through">
                {formatPrice(item.priceCompare!)}
              </span>
            )}
            <div className="text-base font-extrabold text-gray-900">{formatPrice(item.price)}</div>
          </div>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-white transition-transform group-hover:translate-x-0.5">
            <ArrowRightIcon className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
