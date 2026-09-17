"use client";

import { useRouter } from "next/navigation";
import { useAdminStore } from "@/lib/admin-store-context";
import { useToast } from "@/lib/toast-context";
import { PageHeader } from "@/components/admin/admin-ui";
import { VehicleForm, emptyVehicleValues } from "@/components/admin/vehicle-form";
import { EmptyState } from "@/components/ui/feedback";

export default function NewVehiclePage() {
  const router = useRouter();
  const toast = useToast();
  const { createVehicle, permissions } = useAdminStore();

  if (!permissions.vehicles_create) {
    return (
      <EmptyState
        title="Sem permissão"
        description="Seu perfil não permite cadastrar veículos nesta loja. Fale com o administrador."
      />
    );
  }

  return (
    <>
      <PageHeader
        title="Novo veículo"
        description="Preencha as informações principais. Depois de salvar você já pode enviar as fotos."
      />

      <VehicleForm
        initial={emptyVehicleValues()}
        submitLabel="Salvar e enviar fotos"
        onSubmit={async (values) => {
          const created = await createVehicle(values);
          toast.success("Veículo cadastrado. Agora adicione as fotos.");
          router.push(`/admin/veiculos/${created.id}?etapa=fotos`);
        }}
      />
    </>
  );
}
