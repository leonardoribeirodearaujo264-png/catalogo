"use client";

import { useMemo } from "react";
import { useStoreView } from "@/lib/store-view-context";
import { currentPrice, type Vehicle } from "@/types/vehicle";
import { VehicleCard } from "./vehicle-card";

/**
 * Semelhantes por proximidade: mesma marca ou mesma carroceria valem mais,
 * e desempata pela diferença de preço. Assim a seção nunca fica vazia
 * quando a loja tem estoque, mas também não mostra qualquer coisa.
 */
export function SimilarVehicles({ vehicle }: { vehicle: Vehicle }) {
  const { vehicles } = useStoreView();

  const similar = useMemo(() => {
    const price = currentPrice(vehicle);

    return vehicles
      .filter((candidate) => candidate.id !== vehicle.id)
      .map((candidate) => {
        let score = 0;
        if (candidate.brand === vehicle.brand) score += 3;
        if (candidate.bodyType && candidate.bodyType === vehicle.bodyType) score += 2;
        if (candidate.fuel === vehicle.fuel) score += 1;
        const gap = Math.abs(currentPrice(candidate) - price) / Math.max(price, 1);
        return { candidate, score: score - gap };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((item) => item.candidate);
  }, [vehicles, vehicle]);

  if (similar.length === 0) return null;

  return (
    <section className="mt-16 border-t border-white/8 pt-12">
      <h2 className="font-display mb-8 text-[clamp(1.5rem,3.5vw,2rem)] text-cream">Veículos semelhantes</h2>
      <div className="grid auto-rows-fr grid-cols-2 gap-3 max-[349px]:grid-cols-1 md:gap-5 lg:grid-cols-3 lg:gap-6">
        {similar.map((item) => (
          <VehicleCard key={item.id} vehicle={item} />
        ))}
      </div>
    </section>
  );
}
