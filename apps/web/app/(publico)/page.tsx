import { Wallet } from "lucide-react";
import { Action } from "../../components/ui";
export default function Splash() {
  return (
    <main className="splash">
      <div className="splash-inner">
        <div className="stack">
          <div className="logo">
            noke <span>Brasil</span>
          </div>
          <h1>Cada centavo importa</h1>
          <p className="muted">
            Acompanhe seus gastos e encontre melhores preços para suas compras.
          </p>
          <div className="row wrap">
            <Action href="/login">Entrar</Action>
            <Action href="/cadastro" secondary>
              Criar conta
            </Action>
            <Action href="/app" secondary>
              Explorar demonstração
            </Action>
          </div>
        </div>
        <div className="brand-art" aria-hidden="true">
          <Wallet strokeWidth={1.15} />
        </div>
      </div>
    </main>
  );
}
