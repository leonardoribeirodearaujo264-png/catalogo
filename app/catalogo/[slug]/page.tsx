"use client";

import { useMemo, useState } from "react";
import { useCatalogView } from "@/lib/catalog-view-context";
import { useInterestList } from "@/lib/interest-context";
import { getBrowserClient } from "@/lib/supabase/browser-client";
import { insertOrder } from "@/lib/supabase/queries";
import { SearchBar } from "@/components/search-bar";
import { ProductGrid } from "@/components/product-grid";
import { ProductModal } from "@/components/product-modal";
import { buildItemInterestMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import type { CatalogItem } from "@/types/catalog";

export default function CatalogHomePage() {
  const { catalog, items } = useCatalogView();
  const { addEntry, openCart } = useInterestList();
  const [query, setQuery] = useState("");
  const [quickViewItem, setQuickViewItem] = useState<CatalogItem | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (!item.active) return false;
      if (!q) return true;
      return `${item.name} ${item.description}`.toLowerCase().includes(q);
    });
  }, [items, query]);

  function handleAddToCart(item: CatalogItem) {
    addEntry({ catalogId: catalog.id, itemId: item.id, name: item.name, price: item.price });
    setAddedId(item.id);
    setTimeout(() => setAddedId(null), 1000);
    openCart();
  }

  async function handleWhatsAppBuy(item: CatalogItem) {
    const message = buildItemInterestMessage({
      greeting: catalog.whatsappDefaultMessage,
      itemName: item.name,
      price: item.price,
    });
    const whatsappUrl = buildWhatsAppUrl(catalog.whatsappNumber, message);

    try {
      const client = getBrowserClient();
      if (client) {
        await insertOrder(client, {
          catalogId: catalog.id,
          items: [{ catalogId: catalog.id, itemId: item.id, name: item.name, price: item.price, quantity: 1 }],
          totalAmount: item.price,
          message,
        });
      }
    } catch (err) {
      console.error("Não foi possível registrar o pedido:", err);
    }

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="container-app py-6 sm:py-8">
      <div className="max-w-xl">
        <SearchBar value={query} onChange={setQuery} placeholder="Buscar produtos e serviços..." />
      </div>

      <p className="mb-4 mt-4 text-xs font-semibold text-gray-400">
        {filtered.length} {filtered.length === 1 ? "item" : "itens"}
      </p>

      <ProductGrid
        items={filtered}
        layout={catalog.layout}
        addedId={addedId}
        onOpen={setQuickViewItem}
        onAddToCart={handleAddToCart}
        onWhatsAppBuy={handleWhatsAppBuy}
      />

      {quickViewItem && <ProductModal item={quickViewItem} onClose={() => setQuickViewItem(null)} />}
    </div>
  );
}
