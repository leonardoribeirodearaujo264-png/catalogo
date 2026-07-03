"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { useCatalogView } from "@/lib/catalog-view-context";
import { useInterestList } from "@/lib/interest-context";
import { getBrowserClient } from "@/lib/supabase/browser-client";
import { insertLead } from "@/lib/supabase/queries";
import { ItemImage } from "@/components/item-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/icons";
import { buildItemInterestMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { formatPrice } from "@/lib/utils";

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { id } = use(params);
  const { catalog, getItem, getCategory } = useCatalogView();
  const { addEntry } = useInterestList();

  const item = getItem(id);
  const category = item ? getCategory(item.categoryId) : undefined;
  const base = `/catalogo/${catalog.slug}`;

  const [selectedVariationId, setSelectedVariationId] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const selectedVariation = useMemo(
    () => item?.variations?.find((v) => v.id === selectedVariationId),
    [item, selectedVariationId],
  );

  if (!item) {
    return (
      <div className="container-app flex flex-col items-center gap-4 py-24 text-center">
        <span className="text-4xl">🔍</span>
        <h1 className="text-xl font-bold text-gray-900">Item não encontrado</h1>
        <p className="text-sm text-gray-500">Ele pode ter sido removido ou o link está incorreto.</p>
        <Link href={base} className="text-sm font-semibold text-brand-accent">
          ← Voltar para o catálogo
        </Link>
      </div>
    );
  }

  const hasDiscount = !!item.priceCompare && item.priceCompare > item.price;
  const discountPct = hasDiscount ? Math.round((1 - item.price / item.priceCompare!) * 100) : 0;
  const outOfStock = item.stock !== null && item.stock !== undefined && item.stock <= 0;
  const needsVariation = (item.variations?.length ?? 0) > 0;
  const canBuy = !outOfStock && (!needsVariation || !!selectedVariation);
  const finalPrice = selectedVariation?.price ?? item.price;

  const whatsappMessage = buildItemInterestMessage({
    greeting: catalog.whatsappDefaultMessage,
    itemName: item.name,
    price: finalPrice,
    variationName: selectedVariation?.name,
  });
  const whatsappUrl = buildWhatsAppUrl(catalog.whatsappNumber, whatsappMessage);

  function handleBuyClick() {
    const client = getBrowserClient();
    if (client) {
      insertLead(client, {
        catalogId: catalog.id,
        items: [
          {
            catalogId: catalog.id,
            itemId: item!.id,
            name: item!.name,
            price: finalPrice,
            variationName: selectedVariation?.name,
            quantity: 1,
          },
        ],
        message: whatsappMessage,
      }).catch(() => {
        // best-effort: não bloqueia a compra se o registro do lead falhar
      });
    }
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  }

  function handleAddToInterest() {
    addEntry({
      catalogId: catalog.id,
      itemId: item!.id,
      name: item!.name,
      price: finalPrice,
      variationName: selectedVariation?.name,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="pb-28">
      <div className="container-app py-5">
        <nav className="flex items-center gap-2 text-sm text-gray-500">
          <Link href={base} className="hover:text-gray-900">← Catálogo</Link>
          <span>›</span>
          <span className="truncate text-gray-900">{item.name}</span>
        </nav>
      </div>

      <div className="container-app grid gap-10 md:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-2xl bg-gray-100">
          <ItemImage src={item.image} icon={category?.icon ?? "🛍️"} seed={item.id} alt={item.name} />
        </div>

        <div>
          {category && (
            <span className="text-xs font-bold uppercase tracking-wide text-brand-accent">{category.name}</span>
          )}
          <h1 className="mt-1 text-2xl font-extrabold text-gray-900 md:text-3xl">{item.name}</h1>

          <div className="mt-4">
            {hasDiscount && (
              <div className="mb-1 flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-400 line-through">{formatPrice(item.priceCompare!)}</span>
                <Badge tone="green">-{discountPct}% OFF</Badge>
              </div>
            )}
            <div className="text-3xl font-extrabold text-gray-900">{formatPrice(finalPrice)}</div>
          </div>

          {item.description && <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-gray-600">{item.description}</p>}

          <div className="mt-4">
            {outOfStock ? (
              <Badge tone="red">Esgotado</Badge>
            ) : item.stock !== null && item.stock !== undefined ? (
              <Badge tone="green">✓ {item.stock} disponível{item.stock > 1 ? "is" : ""}</Badge>
            ) : item.kind === "servico" ? (
              <Badge tone="dark">Sob agendamento</Badge>
            ) : null}
          </div>

          {needsVariation && (
            <div className="mt-6">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">Escolha uma opção</p>
              <div className="flex flex-wrap gap-2">
                {item.variations!.map((v) => (
                  <button
                    key={v.id}
                    disabled={!v.available}
                    onClick={() => setSelectedVariationId(v.id)}
                    className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                      selectedVariationId === v.id
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-gray-300 text-gray-700 hover:border-gray-900"
                    }`}
                  >
                    {v.name}
                    {!v.available && " (esgotado)"}
                  </button>
                ))}
              </div>
              {!selectedVariation && (
                <p className="mt-2 text-xs font-semibold text-amber-600">⚠️ Selecione uma opção para continuar</p>
              )}
            </div>
          )}

          <div className="mt-8 hidden gap-3 md:flex">
            <Button variant="whatsapp" size="lg" disabled={!canBuy} onClick={handleBuyClick}>
              <WhatsAppIcon className="h-5 w-5" />
              {outOfStock ? "Produto esgotado" : "Comprar pelo WhatsApp"}
            </Button>
            <Button variant="outline" size="lg" disabled={!canBuy} onClick={handleAddToInterest}>
              {added ? "Adicionado ✓" : "+ Lista de interesse"}
            </Button>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white/95 p-4 backdrop-blur md:hidden">
        <div className="container-app flex gap-2">
          <Button variant="outline" onClick={handleAddToInterest} disabled={!canBuy} className="flex-1">
            {added ? "✓" : "+ Interesse"}
          </Button>
          <Button variant="whatsapp" disabled={!canBuy} onClick={handleBuyClick} className="flex-[2]">
            <WhatsAppIcon className="h-4 w-4" />
            {outOfStock ? "Esgotado" : "Comprar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
