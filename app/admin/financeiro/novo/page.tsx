import { TransactionForm } from "@/components/admin/financeiro/transaction-form";

export default function NewTransactionPage() {
  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">Novo lançamento</h1>
      <p className="mt-1 text-sm text-gray-500">Registre uma receita ou despesa do seu negócio.</p>
      <div className="mt-6">
        <TransactionForm />
      </div>
    </div>
  );
}
