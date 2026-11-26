import { Action, Card, Screen, TextLine } from "../src/ui";
export default function Splash() {
  return (
    <Screen title="Noke Brasil">
      <Card>
        <TextLine>Cada centavo importa</TextLine>
      </Card>
      <Action href="/login">Entrar</Action>
      <Action href="/home">Explorar demonstração</Action>
    </Screen>
  );
}
