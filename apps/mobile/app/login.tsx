import { useState } from "react";
import { Action, Card, Field, Screen, TextLine } from "../src/ui";
export default function Login() {
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState("");
  return (
    <Screen title="Entrar">
      <Card>
        <TextLine>Que bom te ver por aqui</TextLine>
        <Field
          label="E-mail"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <Field
          label="Senha"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TextLine>
          A autenticação mobile depende da integração com Supabase Auth.
        </TextLine>
      </Card>
      <Action href="/home">Entrar na demonstração</Action>
      <Action href="/">Voltar</Action>
    </Screen>
  );
}
