"use client";

import Link from "next/link";
import { useCatalogView } from "@/lib/catalog-view-context";
import { useInterestList } from "@/lib/interest-context";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/icons";
import { buildInterestListMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { formatPrice } from "@/lib/utils";

export default function InterestListPage() {
  const { catalog } = useCatalogView();
  const { entriesForCatalog, updateQuantity, removeEntry, clear } = useInterestList();
  const entries = entriesForCatalog(catalog.id);
  const base = `/catalogo/${catalog.slug}`;

  const total = entries.reduce((sum, e) => sum + e.price * e.quantity, 0);
  const message = buildInterestListMessage(catalog.whatsappDefaultMessage, entries);
  const whatsappUrl = buildWhatsAppUrl(catalog.whatsappNumber, message);

  return (
    <div className="container-app py-10">
      <h1 className="text-2xl font-extrabold text-gray-900">Lista de interesse</h1>
      <p className="mt-1 text-sm text-gray-500">
        Reúna os itens que você quer e envie tudo de uma vez pelo WhatsApp.
      </p>

      {entries.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-300 py-16 text-center">
          <span className="text-4xl">🛍️</span>
          <h2 className="text-lg font-bold text-gray-900">Sua lista está vazia</h2>
          <p className="text-sm text-gray-500">Adicione itens a partir da página de cada produto ou serviço.</p>
          <Link href={base} className="text-sm font-semibold text-brand-accent">
            Ver catálogo →
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          <div className="space-y-3 md:col-span-2">
            {entries.map((entry) => (
              <div
                key={`${entry.itemId}-${entry.variationName ?? ""}`}
                className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-bold text-gray-900">{entry.name}</p>
                  {entry.variationName && <p className="text-xs text-gray-500">{entry.variationName}</p>}
                  <p className="text-sm font-semibold text-gray-700">{formatPrice(entry.price)}</p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center rounded-lg border border-gray-300">
                    <button
                      className="h-8 w-8 text-gray-600 hover:bg-gray-50"
                      onClick={() => updateQuantity(catalog.id, entry.itemId, entry.variationName, entry.quantity - 1)}
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-bold">{entry.quantity}</span>
                    <button
                      className="h-8 w-8 text-gray-600 hover:bg-gray-50"
                      onClick={() => updateQuantity(catalog.id, entry.itemId, entry.variationName, entry.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <button
                    className="text-xs font-semibold text-red-500 hover:text-red-700"
                    onClick={() => removeEntry(catalog.id, entry.itemId, entry.variationName)}
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}

            <button onClick={() => clear(catalog.id)} className="text-xs font-semibold text-gray-400 hover:text-gray-700">
              Esvaziar lista
            </button>
          </div>

          <div className="h-fit rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Total estimado</span>
              <span className="text-lg font-extrabold text-gray-900">{formatPrice(total)}</span>
            </div>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="mt-4 block">
              <Button variant="whatsapp" size="lg" className="w-full">
                <WhatsAppIcon className="h-5 w-5" />
                Enviar pelo WhatsApp
              </Button>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
