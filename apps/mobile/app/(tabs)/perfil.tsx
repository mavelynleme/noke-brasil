import { Action, Card, Screen, TextLine } from "../../src/ui";
export default function Perfil() {
  return (
    <Screen title="Perfil">
      <Card>
        <TextLine>Lucas</TextLine>
        <TextLine>@lucas</TextLine>
      </Card>
      <Action href="/">Sair da demonstração</Action>
    </Screen>
  );
}
