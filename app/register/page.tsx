"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { signUp } from "@/lib/auth";
import { isValidEmail } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { ErrorNote } from "@/components/ui/feedback";
import { AuthShell } from "@/components/auth/auth-shell";

type FieldErrors = {
  fullName?: string;
  storeName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

function mapError(err: unknown): string {
  const message = err instanceof Error ? err.message : "";
  if (/already registered|already exists/i.test(message)) return "Esse e-mail já está cadastrado. Tente entrar.";
  if (/password/i.test(message) && /(least|short|6)/i.test(message)) {
    return "A senha precisa ter pelo menos 6 caracteres.";
  }
  if (/invalid email/i.test(message)) return "Digite um e-mail válido.";
  return message || "Não foi possível criar sua conta. Tente novamente.";
}

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [storeName, setStoreName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  function validate(): boolean {
    const next: FieldErrors = {};
    if (!fullName.trim()) next.fullName = "Informe seu nome.";
    if (!storeName.trim()) next.storeName = "Informe o nome da loja.";
    if (!email.trim()) next.email = "Informe seu e-mail.";
    else if (!isValidEmail(email)) next.email = "Digite um e-mail válido.";
    if (!password) next.password = "Crie uma senha.";
    else if (password.length < 6) next.password = "Mínimo de 6 caracteres.";
    if (confirmPassword !== password) next.confirmPassword = "As senhas não coincidem.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      const data = await signUp({ email, password, storeName, fullName });
      if (!data.session) {
        // "Confirm email" ligado no Supabase: não há sessão para seguir.
        setNeedsConfirmation(true);
        setLoading(false);
        return;
      }
      router.replace("/onboarding");
      router.refresh();
    } catch (err) {
      setFormError(mapError(err));
      setLoading(false);
    }
  }

  if (needsConfirmation) {
    return (
      <AuthShell
        title="Confirme seu e-mail"
        subtitle={`Enviamos um link de confirmação para ${email}. Depois de confirmar, entre com seu e-mail e senha.`}
        footer={
          <Link href="/login" className="accent-text font-semibold hover:underline">
            Ir para o login
          </Link>
        }
      >
        <p className="text-[13.5px] leading-relaxed text-mute">
          Se você é quem administra o projeto Supabase e prefere login imediato, desative
          <span className="text-cream"> Authentication → Providers → Email → Confirm email</span>.
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Criar sua loja"
      subtitle="Em poucos minutos seu catálogo de veículos está no ar com link próprio."
      footer={
        <>
          Já tem conta?{" "}
          <Link href="/login" className="accent-text font-semibold hover:underline">
            Entrar
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        {formError && <ErrorNote>{formError}</ErrorNote>}

        <Field
          label="Seu nome"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          error={errors.fullName}
          autoComplete="name"
          required
        />
        <Field
          label="Nome da loja"
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
          error={errors.storeName}
          placeholder="Prime Veículos"
          hint="Você ajusta o link público no próximo passo."
          required
        />
        <Field
          label="E-mail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          autoComplete="email"
          required
        />
        <Field
          label="Senha"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          autoComplete="new-password"
          required
        />
        <Field
          label="Confirmar senha"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
          autoComplete="new-password"
          required
        />

        <Button type="submit" loading={loading} full size="lg" className="mt-2">
          Criar conta
        </Button>
      </form>
    </AuthShell>
  );
}
