import { getBrowserClient } from "./browser-client";
import { generateId } from "@/lib/utils";

const BUCKET = "catalog-images";
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export function validateImageFile(file: File): string | null {
  if (!file.type.startsWith("image/")) return "Envie um arquivo de imagem (JPG, PNG, WebP...).";
  if (file.size > MAX_SIZE_BYTES) return "A imagem deve ter no máximo 5MB.";
  return null;
}

export async function uploadCatalogImage(
  file: File,
  catalogId: string,
  folder: "products" | "branding" = "products",
): Promise<string> {
  const client = getBrowserClient();
  if (!client) throw new Error("Supabase não está configurado.");

  const invalid = validateImageFile(file);
  if (invalid) throw new Error(invalid);

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${catalogId}/${folder}/${generateId("img")}.${ext}`;

  const { error } = await client.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;

  const { data } = client.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
