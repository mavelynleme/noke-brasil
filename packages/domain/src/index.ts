export const periods = ["day", "week", "month", "year"] as const;
export type Period = (typeof periods)[number];
export const periodLabels = {
  day: "Dia",
  week: "Semana",
  month: "Mês",
  year: "Ano",
};
export const categories = [
  "Alimentação",
  "Transporte",
  "Casa",
  "Outros",
] as const;
export const origins = ["manual", "receipt", "shared"] as const;
export const originLabels = {
  manual: "Manual",
  receipt: "Nota fiscal",
  shared: "Compartilhado",
};
export type Expense = {
  id: string;
  cents: number;
  category: (typeof categories)[number];
  date: string;
  description: string;
  origin: (typeof origins)[number];
  groupId?: string;
};
export const money = (cents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    cents / 100,
  );
export const dateLabel = (date: string) =>
  new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(
    new Date(date + "T12:00:00Z"),
  );
export function dateKey(date = new Date()) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}
export function expensesInPeriod(
  expenses: Expense[],
  period: Period,
  reference = dateKey(),
) {
  const [year, month, day] = reference.split("-").map(Number);
  const start = new Date(Date.UTC(year, month - 1, day));
  const end = new Date(start);
  if (period === "week") {
    start.setUTCDate(day - ((start.getUTCDay() + 6) % 7));
    end.setTime(start.getTime());
    end.setUTCDate(start.getUTCDate() + 7);
  } else if (period === "month") {
    start.setUTCDate(1);
    end.setUTCDate(1);
    end.setUTCMonth(month);
  } else if (period === "year") {
    start.setUTCMonth(0, 1);
    end.setUTCFullYear(year + 1, 0, 1);
  } else {
    end.setUTCDate(day + 1);
  }
  const lower = start.toISOString().slice(0, 10),
    upper = end.toISOString().slice(0, 10);
  return expenses.filter(
    (expense) => expense.date >= lower && expense.date < upper,
  );
}
export const sumExpenses = (expenses: Expense[]) =>
  expenses.reduce((sum, expense) => sum + expense.cents, 0);
export function budgetUsage(spent: number, limit: number, threshold = 0.8) {
  const fraction = limit > 0 ? spent / limit : 0;
  return {
    fraction,
    remaining: Math.max(0, limit - spent),
    status:
      limit <= 0
        ? "unset"
        : spent > limit
          ? "over"
          : spent === limit
            ? "reached"
            : fraction >= threshold
              ? "near"
              : "normal",
  };
}
export function fuelEstimate(
  distanceKm: number,
  kmPerLiter: number,
  priceCents: number,
) {
  if (
    ![distanceKm, kmPerLiter, priceCents].every(Number.isFinite) ||
    distanceKm < 0 ||
    kmPerLiter <= 0 ||
    priceCents < 0
  )
    throw new RangeError("Informe distância, consumo e preço válidos.");
  const liters = distanceKm / kmPerLiter;
  return { liters, cents: Math.round(liters * priceCents) };
}
export type Route = { distanceKm: number; simulated: boolean };
export interface RouteProvider {
  route(origin: string, stops: string[]): Route;
}
export interface MapProvider {
  caption(route: Route): string;
}
export type ReceiptScan = {
  merchant: string;
  total: number;
  date: string;
  items: { name: string; cents: number }[];
  confidence: number;
  imagePath?: string;
};
export interface ReceiptOcrProvider {
  read(image: Blob): Promise<ReceiptScan>;
}
export type Store = {
  id: string;
  name: string;
  prices: Record<string, number>;
};
export type ShoppingItem = { id: string; name: string; bought: boolean };
export type ShoppingList = {
  id: string;
  name: string;
  status: "draft" | "ready" | "completed";
  items: ShoppingItem[];
};
export type Offer = {
  storeId: string;
  store: string;
  name: string;
  cents: number;
};
export type PurchaseOption = {
  id: string;
  name: string;
  stops: string[];
  items: { id: string; name: string; store: string; cents: number }[];
  missing: ShoppingItem[];
  products: number;
  distanceKm: number;
  fuel: number;
  effective: number;
  savings: number;
};
export const productKey = (name: string) =>
  name
    .trim()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
export function compareStores(
  items: ShoppingItem[],
  stores: Store[],
  options: {
    origin: string;
    multiple: boolean;
    kmPerLiter: number;
    priceCents: number;
    routes: RouteProvider;
  },
): PurchaseOption[] {
  const groups = stores.map((store) => [store]);
  if (options.multiple) {
    for (const [index, store] of stores.entries()) {
      for (const next of stores.slice(index + 1)) groups.push([store, next]);
    }
  }
  const results = groups
    .map((group) => {
      const found: PurchaseOption["items"] = [],
        missing: ShoppingItem[] = [];
      for (const item of items) {
        const candidates = group
          .flatMap((store) => {
            const key = productKey(item.name);
            const cents = Object.hasOwn(store.prices, key)
              ? store.prices[key]
              : undefined;
            return cents === undefined
              ? []
              : [{ id: item.id, name: item.name, store: store.name, cents }];
          })
          .sort((a, b) => a.cents - b.cents);
        const best = candidates[0];
        if (best) found.push(best);
        else missing.push(item);
      }
      const stops = group.map((store) => store.id);
      const products = found.reduce((total, item) => total + item.cents, 0);
      const { distanceKm } = options.routes.route(options.origin, stops);
      const fuel = fuelEstimate(
        distanceKm,
        options.kmPerLiter,
        options.priceCents,
      ).cents;
      return {
        id: stops.join("+"),
        name: group.map((store) => store.name).join(" + "),
        stops,
        items: found,
        missing,
        products,
        distanceKm,
        fuel,
        effective: products + fuel,
        savings: 0,
      };
    })
    .sort(
      (a, b) =>
        a.missing.length - b.missing.length ||
        a.effective - b.effective ||
        a.id.localeCompare(b.id),
    );
  return results.map((result) => {
    const peers = results.filter(
      (other) =>
        other.missing.map((item) => item.id).join() ===
        result.missing.map((item) => item.id).join(),
    );
    return {
      ...result,
      savings:
        Math.max(...peers.map((peer) => peer.effective)) - result.effective,
    };
  });
}
export const groupRoles = ["owner", "viewer", "contributor"] as const;
export type GroupRole = (typeof groupRoles)[number];
export type FinanceGroup = {
  id: string;
  name: string;
  role: GroupRole;
  members: { username: string; role: GroupRole }[];
};
export type Notice = {
  id: string;
  kind: "budget" | "shared" | "offer" | "price" | "account";
  title: string;
  date: string;
  href?: string;
};
