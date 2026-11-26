"use client";
import { useState, type FormEvent } from "react";
import {
  budgetUsage,
  categories,
  dateKey,
  dateLabel,
  expensesInPeriod,
  originLabels,
  sumExpenses,
  type Expense,
  type FinanceGroup,
  type Period,
} from "@noke/domain";
import { expenseSchema, positiveMoney } from "@noke/validation";
import { useDemo } from "../lib/state";
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  Input,
  Money,
  PageHeader,
  PeriodSelector,
  ProgressBar,
  Sheet,
} from "./ui";
export function Expenses({
  report = false,
  initial = "month",
  newExpense = false,
}: {
  report?: boolean;
  initial?: Period;
  newExpense?: boolean;
}) {
  const { state, update } = useDemo();
  const [period, setPeriod] = useState(initial),
    [adding, setAdding] = useState(newExpense),
    [selected, setSelected] = useState<Expense>();
  const entries = expensesInPeriod(state.expenses, period).sort((a, b) =>
    b.date.localeCompare(a.date),
  );
  const total = sumExpenses(entries);
  const breakdown = categories.map((category) => ({
    category,
    total: sumExpenses(
      entries.filter((expense) => expense.category === category),
    ),
  }));
  return (
    <>
      <PageHeader
        title={report ? "Gastos / Relatórios" : "Calculadora de gastos"}
        back="/app"
      />
      <PeriodSelector value={period} onChange={setPeriod} />
      <Card className="stack">
        <h2>Total do período</h2>
        <p className="stat accent">
          <Money cents={total} />
        </p>
        <div className="chart" aria-label="Gastos por categoria">
          {breakdown.map(({ category, total: amount }) => (
            <div key={category}>
              <progress value={amount} max={total || 1} aria-label={category} />
              <span>{category}</span>
            </div>
          ))}
        </div>
      </Card>
      <Card className="stack">
        <h2>Categorias</h2>
        {breakdown.map(({ category, total }) => (
          <p className="row between" key={category}>
            {category}
            <strong>
              <Money cents={total} />
            </strong>
          </p>
        ))}
        <Button onClick={() => setAdding(true)}>Adicionar gasto</Button>
      </Card>
      {report && (
        <Card className="stack">
          <h2>Histórico</h2>
          {entries.length === 0 && (
            <EmptyState>Nenhum gasto registrado neste período.</EmptyState>
          )}
          {entries.map((entry) => (
            <button
              type="button"
              className="row between"
              key={entry.id}
              onClick={() => setSelected(entry)}
            >
              <span>
                {entry.description || entry.category}
                <br />
                <small>
                  {dateLabel(entry.date)} · {originLabels[entry.origin]}
                </small>
              </span>
              <strong>
                <Money cents={entry.cents} />
              </strong>
            </button>
          ))}
        </Card>
      )}
      {adding && (
        <Sheet title="Adicionar gasto" close={() => setAdding(false)}>
          <ExpenseForm
            groups={state.groups.filter((group) => group.role !== "viewer")}
            save={(expense) => {
              update((current) => ({
                ...current,
                expenses: [...current.expenses, expense],
              }));
              setAdding(false);
            }}
          />
        </Sheet>
      )}
      {selected && (
        <Sheet
          title={selected.description || selected.category}
          close={() => setSelected(undefined)}
        >
          <p>
            {selected.category} · {dateLabel(selected.date)}
          </p>
          <p>
            {originLabels[selected.origin]} ·{" "}
            {selected.groupId ? "Gasto compartilhado" : "Gasto pessoal"}
          </p>
          <p className="stat">
            <Money cents={selected.cents} />
          </p>
        </Sheet>
      )}
    </>
  );
}
function ExpenseForm({
  groups,
  save,
}: {
  groups: FinanceGroup[];
  save: (expense: Expense) => void;
}) {
  const [error, setError] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const groupId = groups.find((group) => group.id === data.get("group"))?.id;
    const result = expenseSchema.safeParse({
      ...Object.fromEntries(data),
      origin: groupId ? "shared" : "manual",
    });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    const { value, category, date, description, origin } = result.data;
    save({
      id: crypto.randomUUID(),
      cents: Math.round(value * 100),
      category,
      date,
      description,
      origin,
      groupId,
    });
  }
  return (
    <form onSubmit={submit}>
      <Input
        label="Valor (R$)"
        name="value"
        type="number"
        step=".01"
        min=".01"
        required
      />
      <label>
        Categoria
        <select name="category">
          {categories.map((category) => (
            <option key={category}>{category}</option>
          ))}
        </select>
      </label>
      <Input
        label="Data"
        name="date"
        type="date"
        defaultValue={dateKey()}
        required
      />
      <Input label="Descrição (opcional)" name="description" maxLength={160} />
      <label>
        Registrar em
        <select name="group">
          <option value="">Gastos pessoais</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
      </label>
      {error && <ErrorState>{error}</ErrorState>}
      <Button type="submit">Salvar gasto</Button>
    </form>
  );
}
export function Limits() {
  const { state, update } = useDemo();
  const [period, setPeriod] = useState<"day" | "week" | "month">("month");
  const [edit, setEdit] = useState(false),
    [error, setError] = useState("");
  const limit = state.limits[period],
    spent = sumExpenses(expensesInPeriod(state.expenses, period));
  const { status, fraction, remaining } = budgetUsage(spent, limit);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = positiveMoney.safeParse(
      new FormData(event.currentTarget).get("limit"),
    );
    if (!result.success) {
      setError("Informe um limite válido.");
      return;
    }
    update((current) => ({
      ...current,
      limits: { ...current.limits, [period]: Math.round(result.data * 100) },
    }));
    setEdit(false);
  }
  return (
    <>
      <PageHeader title="Limite de gastos" back="/app" />
      <PeriodSelector
        value={period}
        onChange={(value) => {
          if (value !== "year") setPeriod(value);
        }}
        budget
      />
      <Card className="stack">
        <div className="row between">
          <h2>Seu limite</h2>
          <Button
            className="secondary"
            onClick={() => {
              setError("");
              setEdit(true);
            }}
          >
            Editar
          </Button>
        </div>
        <p className="stat">
          <Money cents={limit} />
        </p>
        <ProgressBar fraction={fraction} label="Limite utilizado" />
        <div className="row between">
          <p>
            Gasto: <Money cents={spent} />
          </p>
          <p>{Math.round(fraction * 100)}%</p>
        </div>
        <p>
          Restante: <Money cents={remaining} />
        </p>
      </Card>
      {["near", "reached", "over"].includes(status) && (
        <Card className="warning">
          <p role="status">
            {status === "near" ? (
              <>
                Você está quase batendo seu limite, faltam{" "}
                <Money cents={remaining} />.
              </>
            ) : status === "reached" ? (
              "Você atingiu seu limite."
            ) : (
              "Você ultrapassou seu limite."
            )}
          </p>
        </Card>
      )}
      {edit && (
        <Sheet title="Editar limite" close={() => setEdit(false)}>
          <form onSubmit={submit}>
            <Input
              label="Novo limite (R$)"
              name="limit"
              type="number"
              step=".01"
              min=".01"
              defaultValue={limit / 100}
              required
            />
            {error && <ErrorState>{error}</ErrorState>}
            <Button type="submit">Salvar limite</Button>
          </form>
        </Sheet>
      )}
    </>
  );
}
