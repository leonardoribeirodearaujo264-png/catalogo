"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { signIn } from "@/lib/auth";
import { isValidEmail } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { ErrorNote } from "@/components/ui/feedback";
import { AuthShell } from "@/components/auth/auth-shell";

function mapError(err: unknown): string {
  const message = err instanceof Error ? err.message : "";
  if (/invalid login credentials/i.test(message)) return "E-mail ou senha inválidos.";
  if (/email not confirmed/i.test(message)) {
    return "Confirme seu e-mail antes de entrar (ou desative 'Confirm email' no painel do Supabase).";
  }
  if (/fetch|network/i.test(message)) return "Sem conexão com o servidor. Verifique sua internet.";
  return message || "Não foi possível entrar. Tente novamente.";
}

export function LoginView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function validate() {
    const next: typeof errors = {};
    if (!email.trim()) next.email = "Informe seu e-mail.";
    else if (!isValidEmail(email)) next.email = "Digite um e-mail válido.";
    if (!password) next.password = "Informe sua senha.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      await signIn({ email, password });
      router.replace(redirectTo);
      router.refresh();
    } catch (err) {
      setFormError(mapError(err));
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Entrar no painel"
      subtitle="Acesse o painel da sua loja para gerenciar estoque, leads e o catálogo público."
      footer={
        <>
          Ainda não tem conta?{" "}
          <Link href="/register" className="accent-text font-semibold hover:underline">
            Criar loja
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        {formError && <ErrorNote>{formError}</ErrorNote>}

        <Field
          label="E-mail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          autoComplete="email"
          placeholder="voce@sualoja.com.br"
          required
        />
        <Field
          label="Senha"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          autoComplete="current-password"
          required
        />

        <Button type="submit" loading={loading} full size="lg" className="mt-2">
          Entrar
        </Button>
      </form>
    </AuthShell>
  );
}
