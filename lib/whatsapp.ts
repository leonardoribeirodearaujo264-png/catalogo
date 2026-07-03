import { formatPrice } from "@/lib/utils";
import type { InterestListEntry } from "@/types/catalog";

function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const digits = onlyDigits(phone);
  const text = encodeURIComponent(message);
  return `https://wa.me/${digits}?text=${text}`;
}

export function buildItemInterestMessage(params: {
  greeting: string;
  itemName: string;
  price: number;
  variationName?: string;
}): string {
  const lines = [
    params.greeting,
    "",
    `• ${params.itemName}${params.variationName ? ` (${params.variationName})` : ""} — ${formatPrice(params.price)}`,
  ];
  return lines.join("\n");
}

export function buildInterestListMessage(
  greeting: string,
  entries: InterestListEntry[],
): string {
  const lines = [greeting, ""];
  let total = 0;

  for (const entry of entries) {
    const subtotal = entry.price * entry.quantity;
    total += subtotal;
    const variation = entry.variationName ? ` (${entry.variationName})` : "";
    lines.push(`• ${entry.quantity}x ${entry.name}${variation} — ${formatPrice(subtotal)}`);
  }

  lines.push("", `Total estimado: ${formatPrice(total)}`);
  return lines.join("\n");
}
