import { Suspense } from "react";
import type { Metadata } from "next";
import { CatalogView } from "./catalog-view";

export const metadata: Metadata = {
  title: "Catálogo",
};

export default function CatalogoPage() {
  return (
    <Suspense fallback={<div className="container-app py-20 text-center text-sm text-gray-400">Carregando catálogo...</div>}>
      <CatalogView />
    </Suspense>
  );
}
