"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { signIn } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthField } from "@/components/auth/auth-field";
import { LockIcon, MailIcon, SpinnerIcon } from "@/components/icons";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function mapError(err: unknown): string {
  const msg = err instanceof Error ? err.message : "";
  if (/invalid login credentials/i.test(msg)) return "E-mail ou senha inválidos.";
  if (/email not confirmed/i.test(msg)) {
    return "Confirme seu e-mail antes de entrar (ou desative 'Confirm email' no painel do Supabase).";
  }
  return msg || "Não foi possível entrar. Tente novamente.";
}

export function LoginView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function validate() {
    const errors: typeof fieldErrors = {};
    if (!email.trim()) errors.email = "Informe seu e-mail.";
    else if (!EMAIL_RE.test(email)) errors.email = "Digite um e-mail válido.";
    if (!password) errors.password = "Informe sua senha.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      await signIn({ email, password });
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setFormError(mapError(err));
      setLoading(false);
    }
  }

  return (
    <AuthShell subtitle="Acesse o painel do seu catálogo">
      <h1 className="text-xl font-extrabold tracking-tight text-gray-900">Entrar</h1>
      <p className="mt-1 text-sm text-gray-500">Que bom te ver de novo.</p>

      <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-4">
        <AuthField
          label="E-mail"
          icon={<MailIcon className="h-4 w-4" />}
          type="email"
          autoComplete="email"
          placeholder="voce@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email}
        />
        <AuthField
          label="Senha"
          icon={<LockIcon className="h-4 w-4" />}
          isPassword
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
        />

        {formError && (
          <p className="animate-fade-in rounded-lg bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-600">
            {formError}
          </p>
        )}

        <Button type="submit" variant="brand" size="lg" className="w-full" disabled={loading}>
          {loading && <SpinnerIcon className="h-4 w-4 animate-spin-slow" />}
          {loading ? "Entrando..." : "Entrar"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Não possui uma conta?{" "}
        <Link href="/register" className="font-bold text-gray-900 hover:text-red-600">
          Criar conta
        </Link>
      </p>
    </AuthShell>
  );
}
