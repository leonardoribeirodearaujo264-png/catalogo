"use client";

import { useCatalogView } from "@/lib/catalog-view-context";

export function HeroBanner() {
  const { catalog } = useCatalogView();

  return (
    <div className="h-44 w-full overflow-hidden bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 sm:h-56">
      {catalog.bannerUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={catalog.bannerUrl} alt={catalog.businessName} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <span className="text-sm font-bold uppercase tracking-widest text-gray-400">{catalog.businessName}</span>
        </div>
      )}
    </div>
  );
}
