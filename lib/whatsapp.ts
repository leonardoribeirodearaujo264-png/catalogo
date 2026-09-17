import { formatVehiclePrice, onlyDigits } from "@/lib/utils";
import { vehicleFullTitle, type Vehicle } from "@/types/vehicle";
import type { Store } from "@/types/store";

export function buildWhatsAppUrl(phone: string, message: string): string {
  return `https://wa.me/${onlyDigits(phone)}?text=${encodeURIComponent(message)}`;
}

/**
 * Monta a mensagem a partir do template da loja. Suporta {veiculo}, {loja}
 * e {preco}; se o template não tiver nenhum placeholder, o veículo é
 * acrescentado no fim para a mensagem nunca sair vazia de contexto.
 */
export function buildVehicleMessage(store: Store, vehicle?: Vehicle | null): string {
  const template =
    store.whatsappDefaultMessage?.trim() ||
    "Olá! Vi o veículo {veiculo} no catálogo da {loja} e gostaria de mais informações.";

  const vehicleLabel = vehicle ? vehicleFullTitle(vehicle) : "";
  const price = vehicle ? formatVehiclePrice(vehicle.pricePromo || vehicle.price) : "";

  const filled = template
    .replaceAll("{veiculo}", vehicleLabel)
    .replaceAll("{loja}", store.name)
    .replaceAll("{preco}", price);

  const hasPlaceholder = /\{veiculo\}|\{loja\}|\{preco\}/.test(template);
  if (!hasPlaceholder && vehicleLabel) return `${filled}\n\n${vehicleLabel} — ${price}`;

  // Sem veículo (botão "Fale conosco"), a frase não pode ficar com buraco.
  return filled.replace(/\s+—\s+$/, "").replace(/\s{2,}/g, " ").trim();
}

export function buildStoreMessage(store: Store): string {
  return `Olá! Vim pelo catálogo da ${store.name} e gostaria de mais informações.`;
}

export function buildOfferMessage(store: Store, vehicle: Vehicle, name: string, amount: number): string {
  return [
    `Olá! Meu nome é ${name}.`,
    `Vi o veículo ${vehicleFullTitle(vehicle)} no catálogo da ${store.name}`,
    `e gostaria de fazer uma proposta de ${formatVehiclePrice(amount)}.`,
  ].join(" ");
}
