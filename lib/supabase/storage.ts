"use client";

import { getBrowserClient } from "./browser-client";
import { generateId } from "@/lib/utils";

const BUCKET = "store-media";
const MAX_SIZE_BYTES = 12 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

/** Fotos de veículo passam de 3000px à toa; 1920 já é retina em qualquer card. */
const MAX_DIMENSION = 1920;
const JPEG_QUALITY = 0.82;

export function validateImageFile(file: File): string | null {
  if (!ACCEPTED.includes(file.type)) return "Envie uma imagem JPG, PNG, WebP ou AVIF.";
  if (file.size > MAX_SIZE_BYTES) return "A imagem deve ter no máximo 12MB.";
  return null;
}

/**
 * Redimensiona e recomprime no navegador antes do upload. Se algo falhar
 * (canvas bloqueado, formato exótico), devolve o arquivo original — é melhor
 * subir pesado do que não subir.
 */
export async function compressImage(file: File): Promise<Blob> {
  if (typeof window === "undefined" || typeof createImageBitmap !== "function") return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size < 600 * 1024) {
      bitmap.close();
      return file;
    }

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY),
    );
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}

export interface UploadResult {
  url: string;
  path: string;
}

/**
 * Caminho sempre começa pelo storeId — é o que a policy do bucket exige
 * para garantir que uma loja não escreva na pasta de outra.
 */
export async function uploadStoreMedia(
  file: File,
  storeId: string,
  folder: "branding" | "vehicles" | "about",
  vehicleId?: string,
  onProgress?: (percent: number) => void,
): Promise<UploadResult> {
  const client = getBrowserClient();
  if (!client) throw new Error("Supabase não está configurado.");

  const invalid = validateImageFile(file);
  if (invalid) throw new Error(invalid);

  onProgress?.(10);
  const body = await compressImage(file);
  onProgress?.(40);

  const ext = body.type === "image/jpeg" ? "jpg" : (file.name.split(".").pop()?.toLowerCase() || "jpg");
  const segments = [storeId, folder, vehicleId, `${generateId("img")}.${ext}`].filter(Boolean);
  const path = segments.join("/");

  const { error } = await client.storage.from(BUCKET).upload(path, body, {
    cacheControl: "31536000",
    upsert: false,
    contentType: body.type || file.type,
  });
  if (error) throw error;

  onProgress?.(90);
  const { data } = client.storage.from(BUCKET).getPublicUrl(path);
  onProgress?.(100);
  return { url: data.publicUrl, path };
}

/** Remove o arquivo do bucket. Falha silenciosa: a linha do banco já foi apagada. */
export async function removeStoreMedia(path: string): Promise<void> {
  const client = getBrowserClient();
  if (!client || !path) return;
  try {
    await client.storage.from(BUCKET).remove([path]);
  } catch {
    // arquivo órfão é preferível a erro na tela
  }
}
