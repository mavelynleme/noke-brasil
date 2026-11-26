import { money } from "@noke/domain";
import { Card, Screen, TextLine } from "../../src/ui";
export default function Gastos() {
  return (
    <Screen title="Gastos">
      <Card>
        <TextLine>Total de hoje · {money(8960)}</TextLine>
        {[
          ["Alimentação", 4520],
          ["Transporte", 2000],
          ["Casa", 1540],
          ["Outros", 900],
        ].map(([name, value]) => (
          <TextLine key={name}>
            {name} · {money(Number(value))}
          </TextLine>
        ))}
      </Card>
    </Screen>
  );
}
