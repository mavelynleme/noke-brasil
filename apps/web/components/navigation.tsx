"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  ShoppingCart,
  Plus,
  ReceiptText,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { Action, Sheet } from "./ui";
const tabs = [
  { label: "Início", href: "/app", Icon: House },
  { label: "Compras", href: "/app/compras", Icon: ShoppingCart },
  { label: "Gastos", href: "/app/gastos", Icon: ReceiptText },
  { label: "Perfil", href: "/app/perfil", Icon: UserRound },
];
export function BottomNavigation() {
  const path = usePathname();
  const [opened, setOpened] = useState(false);
  return (
    <>
      <nav className="nav" aria-label="Navegação principal">
        <div>
          {tabs.map(({ href, label, Icon }, index) => (
            <div key={href} className="contents">
              {index === 2 && (
                <button
                  className="plus"
                  type="button"
                  aria-label="Ações rápidas"
                  onClick={() => setOpened(true)}
                >
                  <Plus size={26} />
                </button>
              )}
              <Link
                href={href}
                aria-current={path === href ? "page" : undefined}
              >
                <Icon size={20} />
                {label}
              </Link>
            </div>
          ))}
        </div>
      </nav>
      {opened && (
        <Sheet title="Adicionar" close={() => setOpened(false)}>
          <div className="stack" onClick={() => setOpened(false)}>
            <Action href="/app/calculadora?novo=1" secondary>
              Adicionar gasto
            </Action>
            <Action href="/app/escanear-nota" secondary>
              Escanear nota
            </Action>
            <Action href="/app/compras?novo=1" secondary>
              Adicionar item à lista
            </Action>
            <Action href="/app/buscar-precos?oferta=1" secondary>
              Informar preço/promoção
            </Action>
          </div>
        </Sheet>
      )}
    </>
  );
}
