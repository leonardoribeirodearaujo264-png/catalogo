"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useToast } from "@/lib/toast-context";
import {
  deleteVehicleImage,
  insertVehicleImage,
  reorderVehicleImages,
  setVehicleCover,
  updateVehicle,
} from "@/lib/supabase/queries";
import { removeStoreMedia, uploadStoreMedia, validateImageFile } from "@/lib/supabase/storage";
import { cn } from "@/lib/utils";
import type { VehicleImage } from "@/types/vehicle";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/feedback";
import { DragIcon, ImageIcon, StarIcon, TrashIcon, UploadIcon } from "@/components/icons";

interface UploadProgress {
  name: string;
  percent: number;
}

/**
 * Galeria do veículo no painel: upload múltiplo com progresso, reordenação
 * arrastando e escolha da foto de capa. A primeira posição é sempre a capa.
 */
export function VehicleImages({
  storeId,
  vehicleId,
  images,
  onChange,
  disabled,
}: {
  storeId: string;
  vehicleId: string;
  images: VehicleImage[];
  onChange: (images: VehicleImage[]) => void;
  disabled?: boolean;
}) {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  // O índice arrastado vive num ref, não só no estado: o drop pode chegar
  // antes do re-render que o estado provocaria, e aí a posição de origem
  // chegaria desatualizada no handler.
  const dragIndexRef = useRef<number | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<VehicleImage | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);

    const invalid = files.map(validateImageFile).find(Boolean);
    if (invalid) {
      toast.error(invalid);
      return;
    }

    setUploads(files.map((file) => ({ name: file.name, percent: 0 })));
    const created: VehicleImage[] = [];

    for (const [index, file] of files.entries()) {
      try {
        const { url, path } = await uploadStoreMedia(file, storeId, "vehicles", vehicleId, (percent) =>
          setUploads((prev) => prev.map((item, i) => (i === index ? { ...item, percent } : item))),
        );
        const position = images.length + created.length;
        const image = await insertVehicleImage({
          storeId,
          vehicleId,
          url,
          path,
          position,
          isCover: position === 0,
        });
        created.push(image);
        if (position === 0) await updateVehicle(vehicleId, { coverUrl: url });
      } catch (err) {
        console.error(err);
        toast.error(`Não foi possível enviar ${file.name}.`);
      }
    }

    setUploads([]);
    if (created.length > 0) {
      onChange([...images, ...created]);
      toast.success(created.length === 1 ? "Foto adicionada." : `${created.length} fotos adicionadas.`);
    }
  }

  async function persistOrder(next: VehicleImage[]) {
    const reindexed = next.map((image, index) => ({ ...image, position: index, isCover: index === 0 }));
    onChange(reindexed);
    try {
      await reorderVehicleImages(reindexed);
      if (reindexed[0]) await updateVehicle(vehicleId, { coverUrl: reindexed[0].url });
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível salvar a nova ordem.");
    }
  }

  function startDrag(index: number) {
    dragIndexRef.current = index;
    setDragIndex(index);
  }

  function endDrag() {
    dragIndexRef.current = null;
    setDragIndex(null);
  }

  function handleDrop(targetIndex: number) {
    const from = dragIndexRef.current;
    endDrag();
    if (from === null || from === targetIndex) return;

    const next = [...images];
    const [moved] = next.splice(from, 1);
    next.splice(targetIndex, 0, moved);
    persistOrder(next);
  }

  async function handleSetCover(image: VehicleImage) {
    try {
      await setVehicleCover(vehicleId, image.id, image.url);
      onChange(images.map((item) => ({ ...item, isCover: item.id === image.id })));
      toast.success("Foto de capa atualizada.");
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível definir a capa.");
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteVehicleImage(pendingDelete.id);
      if (pendingDelete.path) await removeStoreMedia(pendingDelete.path);
      const next = images.filter((image) => image.id !== pendingDelete.id);
      await persistOrder(next);
      toast.success("Foto removida.");
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível remover a foto.");
    } finally {
      setDeleting(false);
      setPendingDelete(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          if (!disabled) handleFiles(event.dataTransfer.files);
        }}
        className="rounded-2xl border border-dashed border-white/15 p-6 text-center transition-colors hover:border-white/30"
      >
        <ImageIcon className="mx-auto h-9 w-9 text-graphite-500" />
        <p className="mt-3 text-sm text-cream">Arraste as fotos aqui ou escolha do computador</p>
        <p className="mt-1 text-[12px] text-graphite-500">
          JPG, PNG, WebP ou AVIF até 12MB. As imagens são otimizadas antes do envio.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          className="hidden"
          onChange={(event) => {
            handleFiles(event.target.files);
            event.target.value = "";
          }}
        />
        <Button
          type="button"
          variant="outline"
          className="mt-4"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          <UploadIcon className="h-4 w-4" />
          Selecionar fotos
        </Button>
      </div>

      {uploads.length > 0 && (
        <div className="flex flex-col gap-2">
          {uploads.map((upload) => (
            <div key={upload.name} className="surface-raised rounded-xl px-4 py-3">
              <div className="flex items-center justify-between gap-3 text-[12.5px]">
                <span className="truncate text-cream">{upload.name}</span>
                <span className="text-mute">{upload.percent}%</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="accent-bg h-full transition-all" style={{ width: `${upload.percent}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <>
          <p className="text-[12px] text-graphite-500">
            Arraste para reordenar. A primeira foto é a capa do anúncio.
          </p>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {images.map((image, index) => (
              <li
                key={image.id}
                draggable={!disabled}
                onDragStart={() => startDrag(index)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => handleDrop(index)}
                onDragEnd={endDrag}
                className={cn(
                  "surface group relative aspect-4/3 overflow-hidden rounded-xl",
                  dragIndex === index && "opacity-40",
                  image.isCover && "accent-border",
                )}
              >
                <Image src={image.url} alt="" fill sizes="220px" className="object-cover" />

                <span className="absolute left-2 top-2 flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-1 text-[10px] text-white backdrop-blur">
                  <DragIcon className="h-3 w-3" />
                  {index + 1}
                </span>

                {image.isCover && (
                  <span className="accent-bg absolute right-2 top-2 rounded-md px-1.5 py-1 text-[10px] font-bold text-ink">
                    Capa
                  </span>
                )}

                <div className="absolute inset-x-0 bottom-0 flex gap-1 bg-black/70 p-1.5 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                  <button
                    type="button"
                    onClick={() => handleSetCover(image)}
                    aria-label="Definir como capa"
                    className="flex h-8 flex-1 items-center justify-center rounded-md text-white hover:bg-white/15"
                  >
                    <StarIcon className="h-4 w-4" filled={image.isCover} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingDelete(image)}
                    aria-label="Remover foto"
                    className="flex h-8 flex-1 items-center justify-center rounded-md text-red-300 hover:bg-red-500/20"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        title="Remover foto?"
        description="A foto sai do anúncio e o arquivo é apagado do armazenamento. Essa ação não pode ser desfeita."
        confirmLabel="Remover"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
