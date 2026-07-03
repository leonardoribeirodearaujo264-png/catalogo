"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { signUp } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";

function mapError(err: unknown): string {
  const msg = err instanceof Error ? err.message : "";
  if (/already registered|already exists/i.test(msg)) return "Esse e-mail já está cadastrado. Tente entrar.";
  if (/password/i.test(msg) && /(least|short|6)/i.test(msg)) return "A senha precisa ter pelo menos 6 caracteres.";
  if (/invalid email/i.test(msg)) return "Digite um e-mail válido.";
  return msg || "Não foi possível criar sua conta. Tente novamente.";
}

export default function RegisterPage() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await signUp({ email, password, businessName });
      if (data.session) {
        router.push("/admin");
        router.refresh();
      } else {
        setNeedsConfirmation(true);
      }
    } catch (err) {
      setError(mapError(err));
    } finally {
      setLoading(false);
    }
  }

  if (needsConfirmation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
        <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 text-center sm:p-8">
          <span className="text-4xl">📩</span>
          <h1 className="mt-3 text-lg font-extrabold text-gray-900">Confirme seu e-mail</h1>
          <p className="mt-2 text-sm text-gray-500">
            Sua conta foi criada, mas o projeto Supabase está exigindo confirmação por e-mail. Confirme pelo link
            enviado e depois faça login — ou, para pular essa etapa nos testes, desative <strong>Confirm email</strong>{" "}
            em Authentication → Providers → Email no painel do Supabase.
          </p>
          <Link href="/login" className="mt-6 inline-block text-sm font-semibold text-brand-accent">
            Ir para o login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <Link href="/" className="mb-6 text-lg font-extrabold text-gray-900">
        Catálogo Digital Universal
      </Link>

      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
        <h1 className="text-xl font-extrabold text-gray-900">Criar sua conta</h1>
        <p className="mt-1 text-sm text-gray-500">Cadastre seu negócio e comece a montar seu catálogo agora.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Field label="Nome do negócio">
            <Input
              required
              autoComplete="organization"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Ex: Salão da Ana, Loja do João..."
            />
          </Field>
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
          <Field label="Senha" hint="Mínimo de 6 caracteres.">
            <Input
              required
              type="password"
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </Field>

          {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? "Criando conta..." : "Criar conta"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Já tem conta?{" "}
          <Link href="/login" className="font-semibold text-brand-accent">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
