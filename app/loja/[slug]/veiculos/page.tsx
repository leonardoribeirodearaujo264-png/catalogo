import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/site/page-hero";
import { VehicleBrowser } from "@/components/site/vehicle-browser";
import { VehicleCardSkeleton } from "@/components/ui/feedback";

export const metadata: Metadata = {
  title: "Veículos",
  description: "Veja o estoque completo, filtre por marca, modelo, ano, preço e condição.",
};

export default function VehiclesPage() {
  return (
    <>
      <PageHero
        eyebrow="Estoque completo"
        title="Nossos veículos"
        description="Filtre por marca, modelo, ano, faixa de preço, câmbio e combustível para achar o carro certo."
      />

      <Suspense fallback={<BrowserFallback />}>
        <VehicleBrowser />
      </Suspense>
    </>
  );
}

function BrowserFallback() {
  return (
    <div className="container-app grid gap-5 py-10 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <VehicleCardSkeleton key={index} />
      ))}
    </div>
  );
}
