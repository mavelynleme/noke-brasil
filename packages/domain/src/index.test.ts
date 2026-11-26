import { describe, expect, it } from "vitest";
import {
  budgetUsage,
  compareStores,
  expensesInPeriod,
  fuelEstimate,
  sumExpenses,
  type Expense,
  type Store,
} from "./index";
const expenses: Expense[] = [
  "2026-11-01",
  "2026-11-15",
  "2026-11-16",
  "2026-11-19",
  "2026-12-01",
].map((date, index) => ({
  id: String(index),
  date,
  cents: 100 * (index + 1),
  category: "Casa",
  description: "",
  origin: "manual",
}));
describe("Gastos", () => {
  it("soma centavos exatos", () => expect(sumExpenses(expenses)).toBe(1500));
  it.each([
    ["day", 400],
    ["week", 700],
    ["month", 1000],
    ["year", 1500],
  ] as const)("agrega %s", (period, total) =>
    expect(sumExpenses(expensesInPeriod(expenses, period, "2026-11-19"))).toBe(
      total,
    ),
  );
  it("fecha a semana de segunda a domingo, inclusive na virada do mês", () => {
    const values: Expense[] = [
      "2026-11-29",
      "2026-11-30",
      "2026-12-06",
      "2026-12-07",
    ].map((date) => ({ ...expenses[0], id: date, date }));
    expect(
      expensesInPeriod(values, "week", "2026-12-01").map((value) => value.date),
    ).toEqual(["2026-11-30", "2026-12-06"]);
  });
});
describe("Deslocamento e compras", () => {
  it("calcula litros e arredonda os centavos", () =>
    expect(fuelEstimate(12, 10, 579)).toEqual({ liters: 1.2, cents: 695 }));
  it("recusa consumo zero", () =>
    expect(() => fuelEstimate(12, 0, 500)).toThrow(RangeError));
  const stores: Store[] = [
    { id: "far", name: "Longe", prices: { cafe: 500, oleo: 400 } },
    { id: "near", name: "Perto", prices: { cafe: 750, oleo: 450 } },
    { id: "partial", name: "Incompleto", prices: { cafe: 90 } },
  ];
  const items = [
    { id: "1", name: "Café", bought: false },
    { id: "2", name: "Óleo", bought: false },
  ];
  const options = {
    origin: "Centro",
    kmPerLiter: 10,
    priceCents: 500,
    multiple: false,
    routes: {
      route: (_: string, stops: string[]) => ({
        distanceKm: stops.includes("far") ? 20 : 2,
        simulated: true,
      }),
    },
  };
  it("ordena pelo custo efetivo após considerar cobertura da lista", () => {
    const [best, second, partial] = compareStores(items, stores, options);
    expect([
      best.id,
      best.products,
      best.fuel,
      best.effective,
      best.savings,
    ]).toEqual(["near", 1200, 100, 1300, 600]);
    expect(second.id).toBe("far");
    expect(partial.missing[0].name).toBe("Óleo");
  });
  it("compara uma opção de duas paradas", () =>
    expect(
      compareStores(items, stores, { ...options, multiple: true })[0].stops,
    ).toEqual(["near", "partial"]));
});
describe("Limites", () => {
  it.each([
    [79, "normal"],
    [80, "near"],
    [100, "reached"],
    [101, "over"],
  ])("classifica %i", (spent, status) =>
    expect(budgetUsage(spent, 100).status).toBe(status),
  );
  it("aceita alerta configurável", () =>
    expect(budgetUsage(75, 100, 0.75)).toEqual({
      fraction: 0.75,
      remaining: 25,
      status: "near",
    }));
});
