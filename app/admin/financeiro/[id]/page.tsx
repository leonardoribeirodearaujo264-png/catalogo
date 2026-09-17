"use client";

import { use } from "react";
import { useFinancial } from "@/lib/financial-context";
import { PageHeader } from "@/components/admin/admin-ui";
import { TransactionForm } from "@/components/admin/financeiro/transaction-form";
import { EmptyState } from "@/components/ui/feedback";
import { ButtonLink } from "@/components/ui/button";

export default function EditTransactionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { getTransaction } = useFinancial();
  const transaction = getTransaction(id);

  if (!transaction) {
    return (
      <EmptyState
        title="Lançamento não encontrado"
        description="Ele pode ter sido excluído ou pertence a outra loja."
        action={
          <ButtonLink href="/admin/financeiro" variant="outline">
            Voltar para o financeiro
          </ButtonLink>
        }
      />
    );
  }

  return (
    <>
      <PageHeader title="Editar lançamento" description={transaction.description} />
      <TransactionForm transaction={transaction} />
    </>
  );
}
