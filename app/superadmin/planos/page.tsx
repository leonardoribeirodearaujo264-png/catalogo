"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/lib/toast-context";
import { fetchActivePlans, updatePlan } from "@/lib/supabase/queries";
import { formatPrice } from "@/lib/utils";
import type { Plan } from "@/types/store";
import { PageHeader, Panel } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import { Field, TextArea, Toggle } from "@/components/ui/field";
import { EmptyState, Skeleton } from "@/components/ui/feedback";

export default function PlansPage() {
  const toast = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState<Record<string, Partial<Plan>>>({});
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetchActivePlans()
      .then(setPlans)
      .catch(() => toast.error("Não foi possível carregar os planos."))
      .finally(() => setLoading(false));
  }, [toast]);

  function edit(id: string, patch: Partial<Plan>) {
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }

  async function save(plan: Plan) {
    const draft = drafts[plan.id];
    if (!draft) return;
    setSaving(plan.id);
    try {
      await updatePlan(plan.id, draft);
      setPlans((prev) => prev.map((p) => (p.id === plan.id ? { ...p, ...draft } : p)));
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[plan.id];
        return next;
      });
      toast.success("Plano atualizado.");
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível salvar o plano.");
    } finally {
      setSaving(null);
    }
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-80 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (plans.length === 0) {
    return <EmptyState title="Nenhum plano" description="Rode o supabase/setup.sql para criar os planos padrão." />;
  }

  return (
    <>
      <PageHeader
        title="Planos"
        description="Limites e preços dos planos oferecidos às lojas. Deixe o limite vazio para ilimitado."
      />

      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => {
          const value = { ...plan, ...drafts[plan.id] };
          const dirty = !!drafts[plan.id];

          return (
            <Panel key={plan.id} title={plan.name}>
              <div className="flex flex-col gap-4">
                <Field label="Nome" value={value.name} onChange={(e) => edit(plan.id, { name: e.target.value })} />
                <TextArea
                  label="Descrição"
                  rows={2}
                  value={value.description}
                  onChange={(e) => edit(plan.id, { description: e.target.value })}
                />
                <Field
                  label="Preço mensal"
                  value={value.priceMonthly}
                  inputMode="numeric"
                  onChange={(e) => edit(plan.id, { priceMonthly: Number(e.target.value.replace(/\D/g, "")) })}
                  hint={formatPrice(value.priceMonthly)}
                />
                <Field
                  label="Limite de veículos"
                  value={value.vehicleLimit ?? ""}
                  inputMode="numeric"
                  placeholder="Ilimitado"
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "");
                    edit(plan.id, { vehicleLimit: digits ? Number(digits) : null });
                  }}
                />
                <Field
                  label="Limite de usuários"
                  value={value.memberLimit ?? ""}
                  inputMode="numeric"
                  placeholder="Ilimitado"
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "");
                    edit(plan.id, { memberLimit: digits ? Number(digits) : null });
                  }}
                />
                <TextArea
                  label="Itens do plano (um por linha)"
                  rows={4}
                  value={value.features.join("\n")}
                  onChange={(e) => edit(plan.id, { features: e.target.value.split("\n").filter(Boolean) })}
                />
                <Toggle
                  checked={value.active}
                  onChange={(checked) => edit(plan.id, { active: checked })}
                  label="Plano ativo"
                />

                <Button onClick={() => save(plan)} loading={saving === plan.id} disabled={!dirty} full>
                  Salvar
                </Button>
              </div>
            </Panel>
          );
        })}
      </div>
    </>
  );
}
