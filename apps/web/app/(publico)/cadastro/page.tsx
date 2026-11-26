import { Action, Card, PageHeader } from "../../../components/ui";
export default function Page() {
  return (
    <main className="auth">
      <PageHeader title="Criar conta" back="/" />
      <Card className="stack">
        <h2>Qual é o tipo de conta?</h2>
        <Action href="/cadastro/pessoa">Pessoa</Action>
        <Action href="/cadastro/empresa" secondary>
          Empresa
        </Action>
      </Card>
    </main>
  );
}
