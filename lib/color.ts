/** Converte #RGB ou #RRGGBB em rgba(). Valor inválido cai no dourado padrão. */
export function hexToRgba(hex: string, alpha: number): string {
  const normalized = normalizeHex(hex);
  if (!normalized) return `rgba(201, 162, 39, ${alpha})`;
  const value = parseInt(normalized, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function normalizeHex(hex: string): string | null {
  const clean = hex?.trim().replace(/^#/, "") ?? "";
  if (/^[0-9a-f]{3}$/i.test(clean)) {
    return clean
      .split("")
      .map((char) => char + char)
      .join("");
  }
  if (/^[0-9a-f]{6}$/i.test(clean)) return clean;
  return null;
}

export function isValidHex(hex: string): boolean {
  return normalizeHex(hex) !== null;
}

/**
 * Luminância relativa — usada para escolher texto preto ou branco sobre a
 * cor da loja, mantendo o contraste legível mesmo se ela escolher um tom claro.
 */
export function readableTextOn(hex: string): "#0B0B0C" | "#F6F5F2" {
  const normalized = normalizeHex(hex);
  if (!normalized) return "#0B0B0C";
  const value = parseInt(normalized, 16);
  const channels = [(value >> 16) & 255, (value >> 8) & 255, value & 255].map((channel) => {
    const srgb = channel / 255;
    return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
  });
  const luminance = 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  return luminance > 0.45 ? "#0B0B0C" : "#F6F5F2";
}
