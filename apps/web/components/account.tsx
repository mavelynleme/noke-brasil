"use client";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import {
  Bell,
  ChevronRight,
  LogOut,
  MapPin,
  Shield,
  UserRound,
  Car,
  Users,
} from "lucide-react";
import {
  budgetUsage,
  expensesInPeriod,
  sumExpenses,
  dateLabel,
  type GroupRole,
  type Notice,
} from "@noke/domain";
import { itemName, username } from "@noke/validation";
import { demoLocations, demoVehicle } from "../lib/demo";
import { useDemo } from "../lib/state";
import { OfferForm } from "./shopping";
import {
  Action,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Input,
  Money,
  PageHeader,
  Sheet,
} from "./ui";
export function Profile({ business = false }: { business?: boolean }) {
  const [detail, setDetail] = useState("");
  const rows = business
    ? ([
        ["Dados da empresa", UserRound, ""],
        ["Produtos/Promoções", Bell, "/empresa/ofertas"],
        ["Plano", Shield, ""],
        ["Publicações/Ofertas", ChevronRight, "/empresa/ofertas"],
        ["Sair", LogOut, "/"],
      ] as const)
    : ([
        ["Dados da conta", UserRound, ""],
        ["Veículos", Car, ""],
        ["Localizações salvas", MapPin, ""],
        ["Notificações", Bell, "/app/notificacoes"],
        ["Compartilhamentos", Users, "/app/compartilhamentos"],
        ["Privacidade e Segurança", Shield, ""],
        ["Sair", LogOut, "/"],
      ] as const);
  const descriptions: Record<string, string> = {
    "Dados da conta": "Lucas · @lucas",
    Veículos:
      demoVehicle.name +
      " · Consumo informado de " +
      demoVehicle.kmPerLiter +
      " km/l",
    "Localizações salvas": demoLocations.join(" · "),
    "Privacidade e Segurança":
      "Os dados da demonstração ficam neste navegador.",
    "Dados da empresa": "Mercado da Praça · Verificação pendente",
    Plano: "Plano empresarial em preparação.",
  };
  return (
    <>
      <PageHeader
        title={business ? "Perfil da empresa" : "Perfil"}
        back={business ? "/empresa" : "/app"}
      />
      <Card className="row">
        <div className="avatar">{business ? "M" : "L"}</div>
        <div>
          <h2>{business ? "Mercado da Praça" : "Lucas"}</h2>
          <p className="muted">{business ? "@mercadodapraca" : "@lucas"}</p>
        </div>
      </Card>
      <Card className="stack">
        {rows.map(([label, Icon, href]) =>
          href ? (
            <Link key={label} className="menu-row row" href={href}>
              <Icon size={20} />
              {label}
              <ChevronRight size={18} />
            </Link>
          ) : (
            <button
              key={label}
              type="button"
              className="menu-row row"
              onClick={() => setDetail(label)}
            >
              <Icon size={20} />
              {label}
              <ChevronRight size={18} />
            </button>
          ),
        )}
      </Card>
      {detail && (
        <Sheet title={detail} close={() => setDetail("")}>
          <p>{descriptions[detail]}</p>
        </Sheet>
      )}
    </>
  );
}
export function Notices() {
  const { state } = useDemo();
  const usage = budgetUsage(
    sumExpenses(expensesInPeriod(state.expenses, "month")),
    state.limits.month,
  );
  const date = state.expenses
    .map((expense) => expense.date)
    .sort()
    .at(-1);
  const notices: Notice[] = [...state.notices];
  if (date && ["near", "reached", "over"].includes(usage.status))
    notices.unshift({
      id: "budget",
      kind: "budget",
      title:
        usage.status === "near"
          ? "Você está quase batendo seu limite mensal."
          : "Confira seu limite mensal de gastos.",
      date,
      href: "/app/limites",
    });
  return (
    <>
      <PageHeader title="Notificações" back="/app" />
      {!notices.length && <EmptyState>Nenhuma notificação.</EmptyState>}
      {notices
        .sort((a, b) => b.date.localeCompare(a.date))
        .map((notice) => (
          <Card key={notice.id}>
            <div className="row">
              <Bell className="accent" size={20} />
              <div>
                {notice.href ? (
                  <Link className="link" href={notice.href}>
                    {notice.title}
                  </Link>
                ) : (
                  notice.title
                )}
                <p className="muted">{dateLabel(notice.date)}</p>
              </div>
            </div>
          </Card>
        ))}
    </>
  );
}
export function Sharing() {
  const { state, update } = useDemo();
  const [groupId, setGroupId] = useState(""),
    [mode, setMode] = useState<"group" | "invite" | null>(null),
    [error, setError] = useState("");
  const active = state.groups.find((group) => group.id === groupId);
  const roleLabels = {
    owner: "Responsável",
    viewer: "Somente visualização",
    contributor: "Pode registrar gastos",
  };
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    if (mode === "group") {
      const value = itemName.safeParse(fields.get("name"));
      if (!value.success) {
        setError(value.error.issues[0].message);
        return;
      }
      const id = crypto.randomUUID();
      update((current) => ({
        ...current,
        groups: [
          ...current.groups,
          {
            id,
            name: value.data,
            role: "owner",
            members: [{ username: "lucas", role: "owner" }],
          },
        ],
      }));
    } else if (active?.role === "owner") {
      const value = username.safeParse(fields.get("name"));
      if (
        !value.success ||
        active.members.some((member) => member.username === value.data)
      ) {
        setError("Informe um username válido e que ainda não esteja no grupo.");
        return;
      }
      const role =
        fields.get("role") === "contributor" ? "contributor" : "viewer";
      update((current) => ({
        ...current,
        groups: current.groups.map((group) =>
          group.id === active.id
            ? {
                ...group,
                members: [...group.members, { username: value.data, role }],
              }
            : group,
        ),
      }));
    }
    setMode(null);
  }
  function changeMember(id: string, name: string, role?: GroupRole) {
    update((current) => ({
      ...current,
      groups: current.groups.map((group) =>
        group.id !== id || group.role !== "owner"
          ? group
          : {
              ...group,
              members: group.members.flatMap((member) =>
                member.username !== name || member.role === "owner"
                  ? [member]
                  : role
                    ? [{ ...member, role }]
                    : [],
              ),
            },
      ),
    }));
  }
  return (
    <>
      <PageHeader title="Compartilhamento financeiro" back="/app" />
      <p className="muted">Grupos e convites demonstrativos neste navegador.</p>
      <Button
        onClick={() => {
          setError("");
          setMode("group");
        }}
      >
        Criar grupo
      </Button>
      {state.groups.map((group) => (
        <Card key={group.id} className="stack">
          <div className="row between wrap">
            <h2>{group.name}</h2>
            <strong>
              <Money
                cents={sumExpenses(
                  state.expenses.filter(
                    (expense) => expense.groupId === group.id,
                  ),
                )}
              />
            </strong>
          </div>
          <p>Gastos compartilhados · {roleLabels[group.role]}</p>
          {group.members.map((member) => (
            <div key={member.username} className="row between wrap">
              <span>
                @{member.username} · {roleLabels[member.role]}
              </span>
              {group.role === "owner" && member.role !== "owner" && (
                <div className="row wrap">
                  <Button
                    className="secondary"
                    onClick={() =>
                      changeMember(
                        group.id,
                        member.username,
                        member.role === "viewer" ? "contributor" : "viewer",
                      )
                    }
                  >
                    Alterar permissão
                  </Button>
                  <Button
                    className="secondary"
                    onClick={() => changeMember(group.id, member.username)}
                  >
                    Remover
                  </Button>
                </div>
              )}
            </div>
          ))}
          {group.role === "owner" ? (
            <Button
              className="secondary"
              onClick={() => {
                setGroupId(group.id);
                setError("");
                setMode("invite");
              }}
            >
              Adicionar pessoa
            </Button>
          ) : (
            <Button
              className="secondary"
              onClick={() =>
                update((current) => ({
                  ...current,
                  groups: current.groups.filter(
                    (entry) => entry.id !== group.id,
                  ),
                }))
              }
            >
              Sair do grupo
            </Button>
          )}
        </Card>
      ))}
      {mode && (
        <Sheet
          title={mode === "group" ? "Criar grupo" : "Adicionar pessoa"}
          close={() => setMode(null)}
        >
          <form onSubmit={submit}>
            <Input
              label={mode === "group" ? "Nome do grupo" : "Username"}
              name="name"
              required
            />
            {mode === "invite" && (
              <label>
                Permissão
                <select name="role">
                  <option value="viewer">Somente visualização</option>
                  <option value="contributor">Pode registrar gastos</option>
                </select>
              </label>
            )}
            {error && <ErrorState>{error}</ErrorState>}
            <Button type="submit">Salvar</Button>
          </form>
        </Sheet>
      )}
    </>
  );
}
export function BusinessHome() {
  return (
    <>
      <PageHeader title="Área da empresa" back="/" />
      <Card className="soft stack">
        <h2>Mercado da Praça</h2>
        <p>Verificação pendente</p>
      </Card>
      <div className="grid">
        <Action href="/empresa/ofertas">Produtos e ofertas</Action>
        <Action href="/empresa/perfil" secondary>
          Perfil da empresa
        </Action>
      </div>
    </>
  );
}
export function BusinessOffers() {
  const { state } = useDemo(),
    [adding, setAdding] = useState(false);
  return (
    <>
      <PageHeader title="Produtos e ofertas" back="/empresa" />
      <Button onClick={() => setAdding(true)}>Registrar preço</Button>
      <Card className="stack">
        <h2>Publicações locais</h2>
        {state.offers.length === 0 && (
          <EmptyState>Nenhuma oferta registrada na demonstração.</EmptyState>
        )}
        {state.offers.map((offer) => (
          <p key={offer.storeId + offer.name}>
            {offer.name} · {offer.store} · <Money cents={offer.cents} /> ·
            Rascunho local
          </p>
        ))}
      </Card>
      {adding && (
        <Sheet title="Registrar preço" close={() => setAdding(false)}>
          <OfferForm done={() => setAdding(false)} />
        </Sheet>
      )}
    </>
  );
}
