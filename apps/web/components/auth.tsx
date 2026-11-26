"use client";
import { useActionState, useState } from "react";
import { Action, Button, Card, ErrorState, Input, PageHeader } from "./ui";
import { authenticate } from "../lib/auth-actions";
export function AuthForm({
  kind,
  configured,
}: {
  kind: "login" | "pessoa" | "empresa";
  configured: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const [message, submit, pending] = useActionState(
    authenticate.bind(null, kind),
    "",
  );
  const [provider, setProvider] = useState("");
  const login = kind === "login";
  return (
    <main className="auth">
      <PageHeader
        title={
          login
            ? "Entrar"
            : kind === "pessoa"
              ? "Conta pessoal"
              : "Conta empresarial"
        }
        back={login ? "/" : "/cadastro"}
      />
      <Card className="stack">
        <p>
          {login ? "Que bom te ver por aqui" : "Preencha os dados da conta"}
        </p>
        {!configured && (
          <p className="muted">Demonstração. Use dados fictícios.</p>
        )}
        <form action={submit}>
          <Input
            label="E-mail"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
          {!login && (
            <>
              <Input label="Telefone" name="phone" type="tel" required />
              <Input
                label="Username"
                name="username"
                required
                minLength={3}
                maxLength={24}
              />
              {kind === "pessoa" ? (
                <>
                  <Input label="Nome" name="name" required />
                  <Input label="Sobrenome" name="surname" required />
                  <Input
                    label="Data de nascimento"
                    name="birthDate"
                    type="date"
                    required
                  />
                  <Input
                    label="Foto (opcional)"
                    name="photo"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                  />
                </>
              ) : (
                <>
                  <Input label="Nome da empresa" name="company" required />
                  <Input label="CNPJ" name="cnpj" required />
                </>
              )}
            </>
          )}
          <Input
            label="Senha"
            name="password"
            type={visible ? "text" : "password"}
            autoComplete={login ? "current-password" : "new-password"}
            required
            minLength={login ? 1 : 8}
            maxLength={72}
          />
          <button
            type="button"
            className="link"
            onClick={() => setVisible(!visible)}
          >
            {visible ? "Esconder senha" : "Mostrar senha"}
          </button>
          {message && <ErrorState>{message}</ErrorState>}
          <Button type="submit" disabled={pending}>
            {pending ? "Aguarde…" : login ? "Entrar" : "Criar conta"}
          </Button>
        </form>
        {login && (
          <>
            <button
              className="link"
              onClick={() =>
                setProvider(
                  "A recuperação por e-mail depende da configuração do Supabase Auth.",
                )
              }
            >
              Esqueci minha senha
            </button>
            <div className="grid">
              {["Google", "Apple"].map((name) => (
                <Button
                  key={name}
                  className="secondary"
                  onClick={() =>
                    setProvider(
                      name + " depende de configuração no Supabase Auth.",
                    )
                  }
                >
                  {name}
                </Button>
              ))}
            </div>
            {provider && <p role="status">{provider}</p>}
            <Action href="/cadastro" secondary>
              Criar conta
            </Action>
          </>
        )}
      </Card>
    </main>
  );
}
