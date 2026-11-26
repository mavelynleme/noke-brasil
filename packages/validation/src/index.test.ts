import { expect, it } from "vitest";
import { isCnpj, username } from "./index";
it("valida os dígitos verificadores do CNPJ", () => {
  expect(isCnpj("11.222.333/0001-81")).toBe(true);
  expect(isCnpj("11.222.333/0001-82")).toBe(false);
  expect(isCnpj("00.000.000/0000-00")).toBe(false);
});
it("normaliza username e recusa caracteres fora do padrão", () => {
  expect(username.parse(" Lucas_01 ")).toBe("lucas_01");
  expect(username.safeParse("lucas.01").success).toBe(false);
});
