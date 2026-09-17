export type TransactionType = "receita" | "despesa";
export type TransactionStatus = "pendente" | "pago" | "atrasado" | "cancelado";
export type PaymentMethod =
  | "pix"
  | "dinheiro"
  | "cartao"
  | "boleto"
  | "transferencia"
  | "financiamento"
  | "outro";

export interface FinancialTransaction {
  id: string;
  userId: string;
  storeId: string;
  type: TransactionType;
  description: string;
  customerName?: string;
  /** Veículo que originou o lançamento (venda, preparação, despachante...). */
  vehicleId?: string;
  /** Lead que virou venda. */
  leadId?: string;
  amount: number;
  dueDate?: string;
  paidDate?: string;
  status: TransactionStatus;
  paymentMethod?: PaymentMethod;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  pix: "Pix",
  dinheiro: "Dinheiro",
  cartao: "Cartão",
  boleto: "Boleto",
  transferencia: "Transferência",
  financiamento: "Financiamento",
  outro: "Outro",
};

export const STATUS_LABELS: Record<TransactionStatus, string> = {
  pendente: "Pendente",
  pago: "Pago",
  atrasado: "Atrasado",
  cancelado: "Cancelado",
};
