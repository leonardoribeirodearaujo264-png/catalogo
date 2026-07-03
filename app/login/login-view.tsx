"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { signIn } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signIn({ email, password });
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError(mapError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <Link href="/" className="mb-6 text-lg font-extrabold text-gray-900">
        Catálogo Digital Universal
      </Link>

      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
        <h1 className="text-xl font-extrabold text-gray-900">Entrar</h1>
        <p className="mt-1 text-sm text-gray-500">Acesse o painel do seu catálogo.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Field label="E-mail">
            <Input
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com"
            />
          </Field>
          <Field label="Senha">
            <Input
              required
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </Field>

          {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Ainda não tem conta?{" "}
          <Link href="/register" className="font-semibold text-brand-accent">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}
