import { PageHeader } from "@/components/admin/admin-ui";
import { TransactionForm } from "@/components/admin/financeiro/transaction-form";

export default function NewTransactionPage() {
  return (
    <>
      <PageHeader title="Novo lançamento" description="Registre uma receita ou despesa da loja." />
      <TransactionForm />
    </>
  );
}
