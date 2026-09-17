"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useAdminStore } from "@/lib/admin-store-context";
import { useToast } from "@/lib/toast-context";
import { vehicleTitle, type VehicleImage } from "@/types/vehicle";
import { PageHeader } from "@/components/admin/admin-ui";
import { VehicleForm, vehicleToValues } from "@/components/admin/vehicle-form";
import { EmptyState, Skeleton } from "@/components/ui/feedback";
import { ButtonLink } from "@/components/ui/button";
import { ArrowLeftIcon, EyeIcon } from "@/components/icons";

export default function EditVehiclePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const { store, getVehicle, updateVehicle, loading } = useAdminStore();

  const vehicle = getVehicle(params.id);
  const [images, setImages] = useState<VehicleImage[]>(vehicle?.images ?? []);
  const [syncedId, setSyncedId] = useState(vehicle?.id);

  // Quando o veículo termina de carregar (ou troca), o estado local das fotos
  // é ajustado durante o render — o padrão recomendado para estado derivado.
  if (vehicle && vehicle.id !== syncedId) {
    setSyncedId(vehicle.id);
    setImages(vehicle.images ?? []);
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <EmptyState
        title="Veículo não encontrado"
        description="Ele pode ter sido removido ou pertence a outra loja."
        action={
          <ButtonLink href="/admin/veiculos" variant="outline">
            Voltar para o estoque
          </ButtonLink>
        }
      />
    );
  }

  return (
    <>
      <Link
        href="/admin/veiculos"
        className="mb-4 inline-flex items-center gap-2 text-sm text-mute transition-colors hover:text-cream"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Voltar para o estoque
      </Link>

      <PageHeader
        title={vehicleTitle(vehicle)}
        description={vehicle.version || "Edite os dados, os opcionais e as fotos do anúncio."}
        action={
          store && vehicle.published ? (
            <ButtonLink
              href={`/loja/${store.slug}/veiculos/${vehicle.slug}`}
              target="_blank"
              variant="outline"
            >
              <EyeIcon className="h-4 w-4" />
              Ver no catálogo
            </ButtonLink>
          ) : null
        }
      />

      <VehicleForm
        initial={vehicleToValues(vehicle)}
        vehicleId={vehicle.id}
        images={images}
        onImagesChange={setImages}
        submitLabel="Salvar alterações"
        onSubmit={async (values) => {
          await updateVehicle(vehicle.id, values);
          toast.success("Veículo atualizado.");
          router.push("/admin/veiculos");
        }}
      />
    </>
  );
}
