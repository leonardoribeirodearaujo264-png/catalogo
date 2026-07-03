"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { signUp } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthField } from "@/components/auth/auth-field";
import { LockIcon, MailIcon, SpinnerIcon, UserIcon } from "@/components/icons";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

function mapError(err: unknown): string {
  const msg = err instanceof Error ? err.message : "";
  if (/already registered|already exists/i.test(msg)) return "Esse e-mail já está cadastrado. Tente entrar.";
  if (/password/i.test(msg) && /(least|short|6)/i.test(msg)) return "A senha precisa ter pelo menos 6 caracteres.";
  if (/invalid email/i.test(msg)) return "Digite um e-mail válido.";
  return msg || "Não foi possível criar sua conta. Tente novamente.";
}

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  function validate(): boolean {
    const errors: FieldErrors = {};
    if (!name.trim()) errors.name = "Informe seu nome.";
    if (!email.trim()) errors.email = "Informe seu e-mail.";
    else if (!EMAIL_RE.test(email)) errors.email = "Digite um e-mail válido.";
    if (!password) errors.password = "Crie uma senha.";
    else if (password.length < 6) errors.password = "Mínimo de 6 caracteres.";
    if (!confirmPassword) errors.confirmPassword = "Confirme sua senha.";
    else if (confirmPassword !== password) errors.confirmPassword = "As senhas não coincidem.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      const data = await signUp({ email, password, businessName: name });
      if (data.session) {
        router.push("/admin");
        router.refresh();
      } else {
        setNeedsConfirmation(true);
        setLoading(false);
      }
    } catch (err) {
      setFormError(mapError(err));
      setLoading(false);
    }
  }

  if (needsConfirmation) {
    return (
      <AuthShell subtitle="Falta um passo">
        <div className="text-center">
          <span className="text-4xl">📩</span>
          <h1 className="mt-3 text-lg font-extrabold text-gray-900">Confirme seu e-mail</h1>
          <p className="mt-2 text-sm text-gray-500">
            Sua conta foi criada, mas o projeto Supabase está exigindo confirmação por e-mail. Confirme pelo link
            enviado e depois faça login — ou, para pular essa etapa, desative <strong>Confirm email</strong> em
            Authentication → Providers → Email no painel do Supabase.
          </p>
          <Link href="/login" className="mt-6 inline-block text-sm font-bold text-gray-900 hover:text-red-600">
            Ir para o login
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell subtitle="Crie seu catálogo digital em minutos">
      <h1 className="text-xl font-extrabold tracking-tight text-gray-900">Criar conta</h1>
      <p className="mt-1 text-sm text-gray-500">Comece a montar seu catálogo agora.</p>

      <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-4">
        <AuthField
          label="Nome"
          icon={<UserIcon className="h-4 w-4" />}
          autoComplete="name"
          placeholder="Seu nome ou nome do negócio"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={fieldErrors.name}
        />
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
          autoComplete="new-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
        />
        <AuthField
          label="Confirmar senha"
          icon={<LockIcon className="h-4 w-4" />}
          isPassword
          autoComplete="new-password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={fieldErrors.confirmPassword}
        />

        {formError && (
          <p className="animate-fade-in rounded-lg bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-600">
            {formError}
          </p>
        )}

        <Button type="submit" variant="brand" size="lg" className="w-full" disabled={loading}>
          {loading && <SpinnerIcon className="h-4 w-4 animate-spin-slow" />}
          {loading ? "Criando conta..." : "Criar conta"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Já tem conta?{" "}
        <Link href="/login" className="font-bold text-gray-900 hover:text-red-600">
          Entrar
        </Link>
      </p>
    </AuthShell>
  );
}
