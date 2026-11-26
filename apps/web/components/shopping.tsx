"use client";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  compareStores,
  fuelEstimate,
  productKey,
  type PurchaseOption,
  type ShoppingList,
} from "@noke/domain";
import { itemName, positiveMoney } from "@noke/validation";
import {
  catalog,
  demoLocations,
  demoMap,
  demoProducts,
  demoRoute,
  demoVehicle,
  storeList,
} from "../lib/demo";
import { useDemo } from "../lib/state";
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
const statusLabels = {
  draft: "Em montagem",
  ready: "Pronta",
  completed: "Concluída",
};
export function Shopping({ newItem = false }: { newItem?: boolean }) {
  const { state, update } = useDemo();
  const [active, setActive] = useState(state.lists[0]?.id),
    [edit, setEdit] = useState<{ id?: string; name: string } | null>(
      newItem ? { name: "" } : null,
    ),
    [creating, setCreating] = useState(false),
    [error, setError] = useState("");
  const list =
    state.lists.find((entry) => entry.id === active) ?? state.lists[0];
  function changeList(change: (current: ShoppingList) => ShoppingList) {
    update((current) => ({
      ...current,
      lists: current.lists.map((entry) =>
        entry.id === list?.id ? change(entry) : entry,
      ),
    }));
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = itemName.safeParse(
      new FormData(event.currentTarget).get("name"),
    );
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    if (creating) {
      const id = crypto.randomUUID();
      update((current) => ({
        ...current,
        lists: [
          ...current.lists,
          { id, name: parsed.data, status: "draft", items: [] },
        ],
      }));
      setActive(id);
    } else if (edit?.id) {
      changeList((current) => ({
        ...current,
        items: current.items.map((item) =>
          item.id === edit.id ? { ...item, name: parsed.data } : item,
        ),
      }));
    } else {
      const id = crypto.randomUUID();
      changeList((current) => ({
        ...current,
        items: [...current.items, { id, name: parsed.data, bought: false }],
      }));
    }
    setEdit(null);
    setCreating(false);
  }
  return (
    <>
      <PageHeader title="Compras" back="/app" />
      <Card className="stack">
        <div className="row between wrap">
          <h2>Listas de compras</h2>
          <Button
            className="secondary"
            onClick={() => {
              setError("");
              setCreating(true);
            }}
          >
            Nova lista
          </Button>
        </div>
        {state.lists.map((entry) => (
          <Button
            className={list?.id === entry.id ? "" : "secondary"}
            key={entry.id}
            onClick={() => setActive(entry.id)}
          >
            {entry.name} · {entry.items.length} itens ·{" "}
            {statusLabels[entry.status]}
          </Button>
        ))}
      </Card>
      {list && (
        <Card className="stack">
          <h2>{list.name}</h2>
          <label>
            Situação
            <select
              value={list.status}
              onChange={(event) => {
                const status = event.target.value as ShoppingList["status"];
                changeList((current) => ({ ...current, status }));
              }}
            >
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          {list.items.length === 0 && (
            <EmptyState>Adicione os produtos da sua lista.</EmptyState>
          )}
          {list.items.map((item) => (
            <div className="row between wrap" key={item.id}>
              <label className="row">
                <input
                  type="checkbox"
                  checked={item.bought}
                  onChange={() =>
                    changeList((current) => ({
                      ...current,
                      items: current.items.map((row) =>
                        row.id === item.id
                          ? { ...row, bought: !row.bought }
                          : row,
                      ),
                    }))
                  }
                />
                {item.name}
              </label>
              <div className="row">
                <button
                  type="button"
                  className="link"
                  aria-label={"Editar " + item.name}
                  onClick={() => {
                    setError("");
                    setEdit(item);
                  }}
                >
                  Editar
                </button>
                <button
                  type="button"
                  className="link"
                  aria-label={"Remover " + item.name}
                  onClick={() =>
                    changeList((current) => ({
                      ...current,
                      items: current.items.filter((row) => row.id !== item.id),
                    }))
                  }
                >
                  Remover
                </button>
              </div>
            </div>
          ))}
          <Button
            className="secondary"
            onClick={() => {
              setError("");
              setEdit({ name: "" });
            }}
          >
            Adicionar item
          </Button>
          <Action
            href={"/app/buscar-precos?lista=" + encodeURIComponent(list.id)}
          >
            Buscar melhores preços
          </Action>
          {list.status === "completed" && (
            <div className="row wrap">
              <Action href="/app/calculadora?novo=1" secondary>
                Registrar valor real
              </Action>
              <Action href="/app/escanear-nota" secondary>
                Escanear nota
              </Action>
            </div>
          )}
        </Card>
      )}
      {(edit || creating) && (
        <Sheet
          title={
            creating
              ? "Nova lista"
              : edit?.id
                ? "Editar item"
                : "Adicionar item"
          }
          close={() => {
            setEdit(null);
            setCreating(false);
          }}
        >
          <form onSubmit={submit}>
            <Input
              label={creating ? "Nome da lista" : "Nome do item"}
              name="name"
              defaultValue={edit?.name}
              maxLength={100}
              required
            />
            {error && <ErrorState>{error}</ErrorState>}
            <Button type="submit">
              {creating ? "Criar lista" : "Salvar item"}
            </Button>
          </form>
        </Sheet>
      )}
    </>
  );
}
export function SearchPrices({
  listId,
  newOffer = false,
}: {
  listId?: string;
  newOffer?: boolean;
}) {
  const { state } = useDemo(),
    router = useRouter();
  const list =
    state.lists.find((entry) => entry.id === listId) ?? state.lists[0];
  const [editedItems, setItems] = useState<string[]>();
  const items = editedItems ?? list?.items.map((item) => item.name) ?? [];
  const [added, setAdded] = useState(""),
    [offer, setOffer] = useState(newOffer),
    [error, setError] = useState("");
  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget),
      consumption = Number(values.get("consumo")),
      price = positiveMoney.safeParse(values.get("preco"));
    if (
      !items.length ||
      items.length > 50 ||
      !price.success ||
      !Number.isFinite(consumption) ||
      consumption <= 0
    ) {
      setError("Informe os itens, o consumo e o preço do combustível.");
      return;
    }
    const params = new URLSearchParams({
      origem: String(values.get("origem")),
      preco: String(price.data),
      consumo: String(consumption),
      modo: String(values.get("modo")),
      veiculo: String(values.get("veiculo")),
    });
    for (const item of items) params.append("item", item);
    router.push("/app/resultados?" + params);
  }
  return (
    <>
      <PageHeader title="Buscar preços" back="/app" />
      <Card className="stack">
        <h2>Sua lista</h2>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const name = itemName.safeParse(added);
            if (!name.success) {
              setError(name.error.issues[0].message);
              return;
            }
            setError("");
            if (items.length >= 50) {
              setError("A busca permite até 50 itens.");
              return;
            }
            if (!items.includes(name.data)) setItems([...items, name.data]);
            setAdded("");
          }}
        >
          <Input
            label="Produto"
            value={added}
            onChange={(event) => setAdded(event.target.value)}
            placeholder="Ex.: Nescau 200g"
            list="catalogo"
          />
          <datalist id="catalogo">
            {demoProducts.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
          <Button type="submit" className="secondary">
            Adicionar à busca
          </Button>
        </form>
        {items.map((item, index) => (
          <div className="row between" key={index}>
            {item}
            <button
              type="button"
              className="link"
              aria-label={"Remover " + item}
              onClick={() =>
                setItems(items.filter((_, position) => index !== position))
              }
            >
              Remover
            </button>
          </div>
        ))}
      </Card>
      <Card>
        <form onSubmit={search}>
          <h2>Deslocamento</h2>
          <label>
            Localização
            <select name="origem">
              {demoLocations.map((location) => (
                <option key={location}>{location}</option>
              ))}
            </select>
          </label>
          <Input
            label="Veículo"
            name="veiculo"
            defaultValue={demoVehicle.name}
            maxLength={60}
            required
          />
          <Input
            label="Consumo médio (km/l)"
            name="consumo"
            type="number"
            min=".1"
            max="100"
            step=".1"
            defaultValue={demoVehicle.kmPerLiter}
            required
          />
          <Input
            label="Preço do combustível (R$/l)"
            name="preco"
            type="number"
            min=".01"
            step=".01"
            defaultValue="5.79"
            required
          />
          <label>
            Estabelecimentos
            <select name="modo">
              <option value="unico">Apenas um supermercado</option>
              <option value="multi">Aceito mais de uma parada</option>
            </select>
          </label>
          {error && <ErrorState>{error}</ErrorState>}
          <Button type="submit">Buscar melhores preços</Button>
        </form>
      </Card>
      <Button className="secondary" onClick={() => setOffer(true)}>
        Informar preço/promoção
      </Button>
      {offer && (
        <Sheet title="Informar preço/promoção" close={() => setOffer(false)}>
          <OfferForm done={() => setOffer(false)} />
        </Sheet>
      )}
    </>
  );
}
export function OfferForm({ done }: { done: () => void }) {
  const { update } = useDemo();
  const [error, setError] = useState("");
  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget),
      name = itemName.safeParse(fields.get("product")),
      value = positiveMoney.safeParse(fields.get("price"));
    const store = storeList.find((entry) => entry.id === fields.get("store"));
    if (!name.success || !value.success || !store) {
      setError("Informe produto, valor e estabelecimento válidos.");
      return;
    }
    const offer = {
      storeId: store.id,
      store: store.name,
      name: name.data,
      cents: Math.round(value.data * 100),
    };
    update((current) => ({
      ...current,
      offers: [
        ...current.offers.filter(
          (entry) =>
            entry.storeId !== offer.storeId ||
            productKey(entry.name) !== productKey(offer.name),
        ),
        offer,
      ],
    }));
    done();
  }
  return (
    <form onSubmit={save}>
      <Input label="Produto" name="product" required />
      <Input
        label="Preço (R$)"
        name="price"
        type="number"
        min=".01"
        step=".01"
        required
      />
      <label>
        Estabelecimento
        <select name="store">
          {storeList.map((store) => (
            <option value={store.id} key={store.id}>
              {store.name}
            </option>
          ))}
        </select>
      </label>
      {error && <ErrorState>{error}</ErrorState>}
      <Button type="submit">Salvar preço</Button>
    </form>
  );
}
export type Query = Record<string, string | string[] | undefined>;
const scalar = (value: Query[string]) =>
  typeof value === "string" ? value : "";
function getNumber(
  value: Query[string],
  fallback: number,
  min: number,
  max = 10000,
) {
  const input = scalar(value).trim();
  if (!input) return fallback;
  const numeric = Number(input);
  return Number.isFinite(numeric) && numeric >= min && numeric <= max
    ? numeric
    : fallback;
}
export function Results({ query }: { query: Query }) {
  const { state } = useDemo();
  const names = (Array.isArray(query.item) ? query.item : [scalar(query.item)])
    .slice(0, 50)
    .flatMap((item) => {
      const parsed = itemName.safeParse(item);
      return parsed.success ? [parsed.data] : [];
    });
  const [selected, setSelected] = useState<string>();
  const origin = scalar(query.origem) || "Centro",
    kmPerLiter = getNumber(query.consumo, 11, 0.1),
    priceCents = Math.round(100 * getNumber(query.preco, 5.79, 0.01));
  const options = names.length
    ? compareStores(
        names.map((name, index) => ({
          id: String(index),
          name,
          bought: false,
        })),
        catalog(state.offers),
        {
          origin,
          kmPerLiter,
          priceCents,
          multiple: query.modo === "multi",
          routes: demoRoute,
        },
      )
    : [];
  const best = options[0],
    detail = options.find((entry) => entry.id === selected) ?? best;
  return (
    <>
      <PageHeader title="Melhores resultados" back="/app/buscar-precos" />
      <p className="muted">
        Preços e distâncias de demonstração. A ordem prioriza listas mais
        completas e o menor custo efetivo.
      </p>
      {!best || !detail ? (
        <Card>
          <EmptyState>
            Adicione produtos para comparar os supermercados.
          </EmptyState>
        </Card>
      ) : (
        <>
          <Card className="soft stack">
            <h2>Melhor opção</h2>
            <strong>{best.name}</strong>
            <ResultSummary option={best} />
          </Card>
          <Card className="stack">
            <h2>Comparar supermercados</h2>
            {options.map((option) => (
              <Button
                key={option.id}
                className={option.id === detail.id ? "" : "secondary"}
                aria-pressed={option.id === detail.id}
                onClick={() => setSelected(option.id)}
              >
                {option.name} · <Money cents={option.effective} /> ·{" "}
                {option.distanceKm} km
              </Button>
            ))}
          </Card>
          <Card className="stack">
            <h2>{detail.name}</h2>
            <ResultSummary option={detail} />
            {detail.items.map((item) => (
              <div key={item.id} className="row between">
                <span>
                  {item.name}
                  <br />
                  <small>{item.store}</small>
                </span>
                <Money cents={item.cents} />
              </div>
            ))}
            {detail.missing.length > 0 && (
              <p className="error">
                Itens faltantes:{" "}
                {detail.missing.map((item) => item.name).join(", ")}
              </p>
            )}
            <Action
              href={
                "/app/combustivel-rota?" +
                new URLSearchParams({
                  destino: detail.name,
                  distancia: String(detail.distanceKm),
                  preco: String(priceCents / 100),
                  consumo: String(kmPerLiter),
                  origem: origin,
                  veiculo: scalar(query.veiculo),
                })
              }
            >
              Ver rota no mapa
            </Action>
          </Card>
        </>
      )}
    </>
  );
}
function ResultSummary({ option }: { option: PurchaseOption }) {
  return (
    <div className="stack">
      <p>
        Custo efetivo{" "}
        <strong>
          <Money cents={option.effective} />
        </strong>
      </p>
      <p>
        Produtos <Money cents={option.products} /> · Combustível{" "}
        <Money cents={option.fuel} />
      </p>
      <p>
        {option.distanceKm} km ida e volta · {option.items.length} encontrados ·{" "}
        {option.missing.length} faltantes
      </p>
      <p>
        Economia estimada <Money cents={option.savings} />
      </p>
    </div>
  );
}
export function FuelRoute({ query }: { query: Query }) {
  const [distance, setDistance] = useState(
    String(getNumber(query.distancia, 8, 0)),
  );
  const [consumption, setConsumption] = useState(
    String(getNumber(query.consumo, 11, 0.1)),
  );
  const [price, setPrice] = useState(
    String(getNumber(query.preco, 5.79, 0.01)),
  );
  const [roundTrip, setRoundTrip] = useState(true);
  const destination = scalar(query.destino) || "Mercado da Praça";
  const origin = scalar(query.origem) || "Centro";
  const valid =
    distance !== "" &&
    Number(distance) >= 0 &&
    Number(consumption) > 0 &&
    price !== "" &&
    Number(price) >= 0;
  const route = {
    distanceKm: Number(distance) * (roundTrip ? 1 : 0.5),
    simulated: true,
  };
  const estimate = valid
    ? fuelEstimate(
        route.distanceKm,
        Number(consumption),
        Math.round(Number(price) * 100),
      )
    : null;
  return (
    <>
      <PageHeader title="Combustível e rota" back="/app" />
      <Card className="stack">
        <Input
          label="Veículo"
          defaultValue={scalar(query.veiculo) || demoVehicle.name}
        />
        <div className="grid">
          <Input
            label="Consumo informado (km/l)"
            type="number"
            min=".1"
            step=".1"
            value={consumption}
            onChange={(event) => setConsumption(event.target.value)}
          />
          <Input
            label="Preço do combustível (R$/l)"
            type="number"
            min="0"
            step=".01"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
          />
          <Input
            label="Distância de ida e volta (km)"
            type="number"
            min="0"
            step=".1"
            value={distance}
            onChange={(event) => setDistance(event.target.value)}
          />
        </div>
        <label className="row">
          <input
            type="checkbox"
            checked={roundTrip}
            onChange={(event) => setRoundTrip(event.target.checked)}
          />
          Incluir volta
        </label>
      </Card>
      <Card className="soft stack">
        <h2>Gasto estimado de combustível</h2>
        {estimate ? (
          <>
            <p className="stat">
              <Money cents={estimate.cents} />
            </p>
            <p>
              {estimate.liters.toFixed(2).replace(".", ",")} L ·{" "}
              {route.distanceKm} km
            </p>
          </>
        ) : (
          <ErrorState>Informe valores válidos para estimar o custo.</ErrorState>
        )}
      </Card>
      <Link className="button" href="#mapa">
        Ver rota no mapa
      </Link>
      <section id="mapa" className="card map-preview stack">
        <h2>{demoMap.caption(route)}</h2>
        <div className="row between wrap">
          <span>{origin}</span>
          <strong>············</strong>
          <span>{destination}</span>
        </div>
      </section>
    </>
  );
}
