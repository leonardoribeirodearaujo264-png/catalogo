"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useToast } from "@/lib/toast-context";
import { removeStoreMedia, uploadStoreMedia } from "@/lib/supabase/storage";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ImageIcon, TrashIcon, UploadIcon } from "@/components/icons";

/** Campo de imagem única (logo, capa, favicon, foto da loja). */
export function MediaField({
  label,
  hint,
  value,
  storeId,
  folder = "branding",
  aspect = "aspect-16/9",
  onChange,
}: {
  label: string;
  hint?: string;
  value?: string;
  storeId: string;
  folder?: "branding" | "about";
  aspect?: string;
  onChange: (url: string | undefined, path?: string) => void;
}) {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [path, setPath] = useState<string | undefined>(undefined);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setProgress(0);
    try {
      const result = await uploadStoreMedia(file, storeId, folder, undefined, setProgress);
      setPath(result.path);
      onChange(result.url, result.path);
      toast.success(`${label} atualizado.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível enviar a imagem.");
    } finally {
      setProgress(null);
    }
  }

  async function handleRemove() {
    // Só apaga do bucket o arquivo que foi enviado nesta sessão; imagens
    // antigas continuam lá até serem substituídas (evita sumir com algo
    // que outra tela ainda usa).
    if (path) await removeStoreMedia(path);
    setPath(undefined);
    onChange(undefined);
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[12px] font-semibold tracking-wide text-mute">{label}</span>

      <div className={cn("surface-raised relative overflow-hidden rounded-xl", aspect)}>
        {value ? (
          <Image src={value} alt={label} fill sizes="400px" className="object-contain p-2" />
        ) : (
          <span className="flex h-full items-center justify-center text-graphite-600">
            <ImageIcon className="h-8 w-8" />
          </span>
        )}

        {progress !== null && (
          <div className="absolute inset-x-0 bottom-0 h-1.5 bg-white/10">
            <div className="accent-bg h-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={(event) => {
          handleFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          loading={progress !== null}
        >
          <UploadIcon className="h-4 w-4" />
          {value ? "Trocar" : "Enviar"}
        </Button>
        {value && (
          <Button type="button" variant="ghost" size="sm" onClick={handleRemove}>
            <TrashIcon className="h-4 w-4" />
            Remover
          </Button>
        )}
      </div>

      {hint && <p className="text-[12px] text-graphite-500">{hint}</p>}
    </div>
  );
}
