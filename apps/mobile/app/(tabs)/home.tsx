import { money } from "@noke/domain";
import { Action, Card, Screen, TextLine } from "../../src/ui";
export default function Home() {
  return (
    <Screen title="Olá, Lucas!">
      <TextLine>Vamos economizar hoje?</TextLine>
      <Card>
        <TextLine>Saldo já usado hoje</TextLine>
        <TextLine>{money(8960)}</TextLine>
        <Action href="/gastos">Ver relatório</Action>
      </Card>
      <Action href="/compras">Compras</Action>
    </Screen>
  );
}
