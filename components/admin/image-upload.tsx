"use client";

import { useRef, useState } from "react";
import { uploadCatalogImage, validateImageFile } from "@/lib/supabase/storage";
import { SpinnerIcon, TrashIcon, UploadIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

export function ImageUpload({
  value,
  onChange,
  catalogId,
  folder = "products",
  aspect = "square",
}: {
  value: string;
  onChange: (url: string) => void;
  catalogId: string;
  folder?: "products" | "branding";
  aspect?: "square" | "wide";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    const invalid = validateImageFile(file);
    if (invalid) {
      setError(invalid);
      return;
    }

    setUploading(true);
    try {
      const url = await uploadCatalogImage(file, catalogId, folder);
      onChange(url);
    } catch (err) {
      console.error(err);
      setError("Não foi possível enviar a imagem. Verifique se o bucket 'catalog-images' já foi criado no Supabase.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />

      <div
        className={cn(
          "relative flex w-full items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-colors",
          aspect === "square" ? "aspect-square max-w-[220px]" : "aspect-[21/9] max-w-full",
          value ? "border-transparent" : "border-gray-300 hover:border-gray-400",
        )}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="Imagem enviada" className="h-full w-full object-cover" />
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex flex-col items-center gap-2 p-6 text-center text-gray-400 hover:text-gray-600"
          >
            <UploadIcon className="h-6 w-6" />
            <span className="text-xs font-semibold">Enviar imagem</span>
          </button>
        )}

        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            <SpinnerIcon className="h-6 w-6 animate-spin-slow text-gray-500" />
          </div>
        )}
      </div>

      {value && !uploading && (
        <div className="mt-2 flex gap-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-xs font-semibold text-brand-accent hover:underline"
          >
            Trocar imagem
          </button>
          <button
            type="button"
            onClick={() => onChange("")}
            className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:underline"
          >
            <TrashIcon className="h-3.5 w-3.5" />
            Remover
          </button>
        </div>
      )}

      {!value && <p className="mt-1.5 text-xs text-gray-400">JPG, PNG ou WebP, até 5MB. Opcional.</p>}
      {error && <p className="mt-1.5 text-xs font-semibold text-red-500">{error}</p>}
    </div>
  );
}
