import {
  dateKey,
  productKey,
  type Expense,
  type FinanceGroup,
  type MapProvider,
  type Notice,
  type Offer,
  type ReceiptOcrProvider,
  type ReceiptScan,
  type RouteProvider,
  type ShoppingList,
  type Store,
} from "@noke/domain";

export const demoRoute: RouteProvider = {
  route(origin, stops) {
    const distances: Record<string, number> = {
      vale: 8,
      praca: 4,
      estacao: 12,
    };
    const offset = origin === "Centro" ? 0 : 2;
    return {
      distanceKm:
        Math.max(0, ...stops.map((stop) => distances[stop] ?? 8)) +
        (stops.length > 1 ? 2 : 0) +
        offset,
      simulated: true,
    };
  },
};
export const demoMap: MapProvider = {
  caption: (route) =>
    route.simulated ? "Mapa ilustrativo · distância simulada" : "Mapa da rota",
};
export const demoOcr: ReceiptOcrProvider = {
  async read(image) {
    if (!image.size) throw new Error("A imagem está vazia.");
    await new Promise((resolve) => setTimeout(resolve, 550));
    return {
      merchant: "Mercado da Praça",
      total: 8960,
      date: dateKey(),
      items: [],
      confidence: 0,
    };
  },
};
export const demoVehicle = { name: "Meu carro", kmPerLiter: 11 };
export const demoLocations = ["Centro", "Jardim Itália"];
export const demoProducts = [
  "Nescau 200g",
  "Óleo 1L",
  "Pão de forma",
  "Café 500g",
];
const stores: Store[] = [
  {
    id: "vale",
    name: "Mercado Vale Verde",
    prices: {
      "nescau 200g": 1090,
      "oleo 1l": 729,
      "pao de forma": 1090,
      "cafe 500g": 2790,
    },
  },
  {
    id: "praca",
    name: "Mercado da Praça",
    prices: {
      "nescau 200g": 1149,
      "oleo 1l": 649,
      "pao de forma": 999,
      "cafe 500g": 2990,
    },
  },
  {
    id: "estacao",
    name: "Supermercado Estação",
    prices: { "nescau 200g": 899, "oleo 1l": 699, "pao de forma": 1049 },
  },
];
export function catalog(offers: Offer[]) {
  return stores.map((store) => ({
    ...store,
    prices: {
      ...store.prices,
      ...Object.fromEntries(
        offers
          .filter((offer) => offer.storeId === store.id)
          .map((offer) => [productKey(offer.name), offer.cents]),
      ),
    },
  }));
}
export const storeList = stores.map(({ id, name }) => ({ id, name }));
export type DemoState = {
  expenses: Expense[];
  receipts: (ReceiptScan & { expenseId: string })[];
  lists: ShoppingList[];
  limits: Record<"day" | "week" | "month", number>;
  offers: Offer[];
  groups: FinanceGroup[];
  notices: Notice[];
};
export function initialState(): DemoState {
  const today = dateKey();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return {
    receipts: [],
    expenses: [
      {
        id: "market",
        date: today,
        cents: 4520,
        category: "Alimentação",
        description: "Compras de mercado",
        origin: "manual",
      },
      {
        id: "ride",
        date: today,
        cents: 2000,
        category: "Transporte",
        description: "Transporte",
        origin: "manual",
      },
      {
        id: "house",
        date: today,
        cents: 1540,
        category: "Casa",
        description: "Itens para casa",
        origin: "receipt",
      },
      {
        id: "other",
        date: today,
        cents: 900,
        category: "Outros",
        description: "Outros gastos",
        origin: "manual",
      },
      {
        id: "previous",
        date: dateKey(yesterday),
        cents: 3810,
        category: "Alimentação",
        description: "Compras da família",
        origin: "shared",
        groupId: "family",
      },
    ],
    lists: [
      {
        id: "weekly",
        name: "Compras da semana",
        status: "draft",
        items: demoProducts
          .slice(0, 3)
          .map((name, index) => ({ id: String(index), name, bought: false })),
      },
    ],
    limits: { day: 15000, week: 40000, month: 160000 },
    offers: [
      {
        storeId: "praca",
        store: "Mercado da Praça",
        name: "Café 500g",
        cents: 2790,
      },
    ],
    groups: [
      {
        id: "family",
        name: "Família",
        role: "owner",
        members: [
          { username: "lucas", role: "owner" },
          { username: "marina", role: "contributor" },
        ],
      },
    ],
    notices: [
      {
        id: "prices",
        kind: "price",
        title: "Compare preços da sua lista de compras",
        date: today,
        href: "/app/buscar-precos",
      },
      {
        id: "family",
        kind: "shared",
        title: "Confira os gastos compartilhados da família",
        date: dateKey(yesterday),
        href: "/app/compartilhamentos",
      },
    ],
  };
}
export interface DemoRepository {
  load(): DemoState;
  save(state: DemoState): void;
}
export const demoRepository: DemoRepository = {
  load() {
    const saved = localStorage.getItem("noke-demo-v1");
    if (saved) {
      try {
        return {
          ...initialState(),
          ...(JSON.parse(saved) as Partial<DemoState>),
        };
      } catch {
        return initialState();
      }
    }
    return initialState();
  },
  save(state) {
    localStorage.setItem("noke-demo-v1", JSON.stringify(state));
  },
};
