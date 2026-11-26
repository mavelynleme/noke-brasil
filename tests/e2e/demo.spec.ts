import { expect, test } from "@playwright/test";
test("abre a homepage e navega no celular", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("link", { name: "Explorar demonstração" }).click();
  await expect(page).toHaveURL(/\/app$/);
  await expect(
    page.getByRole("heading", { name: "Olá, Lucas!" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Saldo já usado" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Esconder valor" }).click();
  await expect(
    page.getByRole("button", { name: "Mostrar valor" }),
  ).toBeVisible();
});
test("adiciona gasto, preserva e atualiza o relatório", async ({ page }) => {
  await page.goto("/app");
  await page
    .getByRole("button", { name: "Ações rápidas", exact: true })
    .click();
  await page.getByRole("link", { name: "Adicionar gasto" }).click();
  await page.getByLabel("Valor (R$)").fill("15.40");
  await page.getByLabel("Descrição (opcional)").fill("Almoço");
  await page.getByRole("button", { name: "Salvar gasto" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("link", { name: "Gastos", exact: true }).click();
  await expect(page.getByRole("button", { name: /Almoço/ })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: /Almoço/ })).toBeVisible();
});
test("cria item, busca preços e abre a rota", async ({ page }) => {
  await page.goto("/app/compras");
  await page
    .getByRole("button", { name: "Adicionar item", exact: true })
    .click();
  await page.getByLabel("Nome do item").fill("Café 500g");
  await page.getByRole("button", { name: "Salvar item" }).click();
  await expect(page.getByRole("checkbox", { name: "Café 500g" })).toBeVisible();
  await page.getByRole("link", { name: "Buscar melhores preços" }).click();
  await page.getByRole("button", { name: "Buscar melhores preços" }).click();
  await expect(
    page.getByRole("heading", { name: "Melhores resultados" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Melhor opção", exact: true }),
  ).toBeVisible();
  await expect(page.getByText(/4 encontrados/).first()).toBeVisible();
  await page.getByRole("link", { name: "Ver rota no mapa" }).click();
  await expect(
    page.getByText("Mapa ilustrativo · distância simulada"),
  ).toBeVisible();
});
