"use client";

import { useCatalogView } from "@/lib/catalog-view-context";
import { useInterestList } from "@/lib/interest-context";
import { CartIcon } from "@/components/icons";
import { formatPrice, cn } from "@/lib/utils";

export function CartCheckoutBar() {
  const { catalog } = useCatalogView();
  const { entriesForCatalog, totalItemsForCatalog, isCartOpen, openCart } = useInterestList();
  const entries = entriesForCatalog(catalog.id);
  const totalItems = totalItemsForCatalog(catalog.id);
  const total = entries.reduce((sum, e) => sum + e.price * e.quantity, 0);
  const visible = totalItems > 0 && !isCartOpen;

  return (
    <div
      className={cn(
        "fixed inset-x-4 bottom-4 z-40 mx-auto max-w-md transition-all duration-300 ease-out",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-24 opacity-0",
      )}
      aria-hidden={!visible}
    >
      <button
        type="button"
        onClick={openCart}
        className="flex w-full items-center justify-between gap-3 rounded-2xl bg-[#16a34a] px-4 py-3.5 text-white shadow-lg shadow-black/30 active:scale-[0.98]"
      >
        <span className="flex items-center gap-2 text-sm font-bold">
          <CartIcon className="h-5 w-5" />
          {totalItems} {totalItems === 1 ? "item" : "itens"}
        </span>
        <span className="truncate text-sm font-extrabold">{formatPrice(total)}</span>
        <span className="flex shrink-0 items-center gap-1 text-sm font-bold">
          Ver carrinho
          <svg viewBox="0 0 24 24" fill="none" strokeWidth={2.2} stroke="currentColor" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </button>
    </div>
  );
}
