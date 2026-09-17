"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { getBrowserClient } from "@/lib/supabase/browser-client";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { ErrorNote } from "@/components/ui/feedback";
import { AuthShell } from "@/components/auth/auth-shell";

export default function InvitePage() {
  return (
    <Suspense fallback={null}>
      <InviteView />
    </Suspense>
  );
}

function InviteView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading } = useAuth();

  const [code, setCode] = useState(searchParams.get("codigo") ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const client = getBrowserClient();
    if (!client) {
      setError("Supabase não está configurado.");
      return;
    }

    setSaving(true);
    try {
      // cs_redeem_invite roda no banco: é ela que decide se o código vale e
      // com qual papel a pessoa entra — o frontend não escolhe nada disso.
      const { error: rpcError } = await client.rpc("cs_redeem_invite", { p_code: code });
      if (rpcError) throw rpcError;
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível usar este convite.");
      setSaving(false);
    }
  }

  if (!loading && !user) {
    const target = `/convite?codigo=${encodeURIComponent(code)}`;
    return (
      <AuthShell
        title="Entre para aceitar o convite"
        subtitle="Crie sua conta (ou entre, se já tiver uma) e o convite é aplicado em seguida."
        footer={
          <Link href={`/login?redirect=${encodeURIComponent(target)}`} className="accent-text font-semibold hover:underline">
            Já tenho conta
          </Link>
        }
      >
        <Button
          full
          size="lg"
          onClick={() => router.push(`/register?redirect=${encodeURIComponent(target)}`)}
        >
          Criar minha conta
        </Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Aceitar convite"
      subtitle="Digite o código que a loja enviou para entrar na equipe."
      footer={
        <Link href="/admin" className="accent-text font-semibold hover:underline">
          Ir para o painel
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <ErrorNote>{error}</ErrorNote>}
        <Field
          label="Código do convite"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="ABCD2345"
          required
        />
        <Button type="submit" loading={saving} full size="lg">
          Entrar na loja
        </Button>
      </form>
    </AuthShell>
  );
}
