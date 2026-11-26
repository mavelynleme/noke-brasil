"use client";
import { useEffect, useState, type FormEvent } from "react";
import { ScanLine } from "lucide-react";
import { dateKey, type ReceiptScan } from "@noke/domain";
import { expenseSchema, validImage } from "@noke/validation";
import { demoOcr } from "../lib/demo";
import { useDemo } from "../lib/state";
import {
  Action,
  Button,
  Card,
  ErrorState,
  Input,
  LoadingState,
  PageHeader,
} from "./ui";
type Stage =
  "idle" | "capturing" | "processing" | "review" | "error" | "success";
export function Receipt() {
  const { update } = useDemo();
  const [stage, setStage] = useState<Stage>("idle"),
    [file, setFile] = useState<File>(),
    [preview, setPreview] = useState(""),
    [scan, setScan] = useState<ReceiptScan>(),
    [error, setError] = useState("");
  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  async function process() {
    if (!file) return;
    setStage("processing");
    try {
      setScan(await demoOcr.read(file));
      setStage("review");
    } catch {
      setError(
        "Não foi possível ler a nota. Tente novamente ou preencha manualmente.",
      );
      setStage("error");
    }
  }
  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = expenseSchema.safeParse({
      ...Object.fromEntries(new FormData(event.currentTarget)),
      category: "Alimentação",
      origin: "receipt",
    });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    const { value, date, description, category, origin } = result.data;
    const expenseId = crypto.randomUUID();
    const cents = Math.round(value * 100);
    update((current) => ({
      ...current,
      receipts: [
        ...current.receipts,
        {
          expenseId,
          merchant: description,
          total: cents,
          date,
          items: scan?.items ?? [],
          confidence: scan?.confidence ?? 0,
        },
      ],
      expenses: [
        ...current.expenses,
        {
          id: expenseId,
          cents,
          date,
          description,
          category,
          origin,
        },
      ],
    }));
    setStage("success");
    setFile(undefined);
  }
  return (
    <>
      <PageHeader title="Escanear nota" back="/app" />
      <Card className="stack">
        <p className="muted">
          Leitura demonstrativa. O total sugerido é um exemplo e deve ser
          conferido antes de salvar.
        </p>
        {stage !== "success" && (
          <>
            <div className="receipt-frame">
              {preview && stage !== "error" ? (
                <img
                  className="preview"
                  src={preview}
                  alt="Imagem selecionada da nota"
                />
              ) : (
                <ScanLine size={64} strokeWidth={1.2} />
              )}
            </div>
            {["idle", "capturing", "error"].includes(stage) && (
              <>
                <Input
                  label="Selecionar ou tirar foto"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  capture="environment"
                  onChange={(event) => {
                    const next = event.target.files?.[0];
                    if (!next) return;
                    if (!validImage(next)) {
                      setFile(undefined);
                      setError("Use JPEG, PNG ou WebP de até 8 MB.");
                      setStage("error");
                      return;
                    }
                    setFile(next);
                    setError("");
                    setStage("capturing");
                  }}
                />
                {file && <Button onClick={process}>Processar imagem</Button>}
                <Button
                  className="secondary"
                  onClick={() => {
                    setScan(undefined);
                    setError("");
                    setStage("review");
                  }}
                >
                  Preencher manualmente
                </Button>
              </>
            )}
            {stage === "processing" && (
              <LoadingState>Processando imagem…</LoadingState>
            )}
            {stage === "review" && (
              <form onSubmit={save}>
                <h2>Conferir total</h2>
                <Input
                  label="Total (R$)"
                  name="value"
                  type="number"
                  step=".01"
                  min=".01"
                  defaultValue={scan ? scan.total / 100 : undefined}
                  required
                />
                <Input
                  label="Estabelecimento"
                  name="description"
                  defaultValue={scan?.merchant}
                />
                <Input
                  label="Data"
                  name="date"
                  type="date"
                  defaultValue={scan?.date ?? dateKey()}
                  required
                />
                <Button type="submit">Confirmar e salvar</Button>
                <Button
                  className="secondary"
                  onClick={() => {
                    setStage("idle");
                    setFile(undefined);
                    setError("");
                  }}
                >
                  Tirar nova foto
                </Button>
              </form>
            )}
            {error && <ErrorState>{error}</ErrorState>}
          </>
        )}
        {stage === "success" && (
          <>
            <p role="status">Gasto salvo com sucesso.</p>
            <Action href="/app/gastos">Ver gastos</Action>
          </>
        )}
      </Card>
    </>
  );
}
