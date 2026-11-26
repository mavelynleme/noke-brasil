"use client";
import Link from "next/link";
import {
  Bell,
  Calculator,
  ScanLine,
  Fuel,
  Search,
  MapPin,
  Wallet,
  Eye,
  EyeOff,
  ShoppingBasket,
} from "lucide-react";
import { useState } from "react";
import { expensesInPeriod, sumExpenses, type Period } from "@noke/domain";
import { useDemo } from "../lib/state";
import { Action, Card, Money, PageHeader, PeriodSelector } from "./ui";
const actions = [
  ["Calculadora", "calculadora", Calculator, "Acompanhe seus gastos"],
  ["Escanear nota", "escanear-nota", ScanLine, "Some seus gastos com uma foto"],
  ["Combustível", "combustivel-rota", Fuel, "Estime o custo do deslocamento"],
  ["Buscar preços", "buscar-precos", Search, "Compare o valor da sua lista"],
  [
    "Mapas/Rota",
    "combustivel-rota",
    MapPin,
    "Confira uma rota de demonstração",
  ],
  ["Limite de gastos", "limites", Wallet, "Defina e acompanhe seus limites"],
] as const;
export function Home() {
  const [period, setPeriod] = useState<Period>("month"),
    [visible, setVisible] = useState(true);
  const { state } = useDemo();
  const total = sumExpenses(expensesInPeriod(state.expenses, period));
  return (
    <>
      <div className="row between">
        <div className="row">
          <div className="avatar">L</div>
          <div>
            <h1>Olá, Lucas!</h1>
            <p className="muted">Vamos economizar hoje?</p>
          </div>
        </div>
        <Link
          href="/app/notificacoes"
          className="icon"
          aria-label="Notificações"
        >
          <Bell size={21} />
        </Link>
      </div>
      <Card className="hero stack">
        <div className="row between wrap">
          <h2>Saldo já usado</h2>
          <PeriodSelector value={period} onChange={setPeriod} />
        </div>
        <div className="row between">
          <p className="stat">{visible ? <Money cents={total} /> : "••••••"}</p>
          <button
            className="icon"
            aria-label={visible ? "Esconder valor" : "Mostrar valor"}
            onClick={() => setVisible(!visible)}
          >
            {visible ? <Eye size={20} /> : <EyeOff size={20} />}
          </button>
        </div>
        <div>
          <Action href={"/app/gastos?periodo=" + period} secondary>
            Ver relatório
          </Action>
        </div>
      </Card>
      <div className="stack">
        <div className="row between wrap">
          <h2>Ações rápidas</h2>
          <Link href="/app/ferramentas" className="link">
            Ver ferramentas
          </Link>
        </div>
        <div className="actions">
          {actions.map(([label, href, Icon]) => (
            <Link className="card" key={label} href={"/app/" + href}>
              <Icon size={24} strokeWidth={1.6} />
              {label}
            </Link>
          ))}
        </div>
      </div>
      <Card className="soft">
        <div className="row between wrap">
          <div className="row">
            <ShoppingBasket className="accent" />
            <h2>Encontre os melhores preços perto de você</h2>
          </div>
          <Action href="/app/buscar-precos">Buscar agora</Action>
        </div>
      </Card>
    </>
  );
}
export function Tools() {
  return (
    <>
      <PageHeader title="Ferramentas" back="/app" />
      {actions
        .filter(([, href], index) => href !== "combustivel-rota" || index === 2)
        .map(([label, href, Icon, detail]) => (
          <Link key={label} className="card row" href={"/app/" + href}>
            <Icon className="accent" />
            <div>
              <strong>{label}</strong>
              <p className="muted">{detail}</p>
            </div>
          </Link>
        ))}
      <Link className="card" href="/app/compartilhamentos">
        Compartilhamento financeiro
      </Link>
    </>
  );
}
