# Noke Brasil

Cada centavo importa. O Noke Brasil ajuda a acompanhar despesas, organizar listas de compras e comparar preços incluindo o custo do deslocamento. O escopo funcional e a referência visual estão em [escopo-noke-brasil.docx](docs/escopo-noke-brasil.docx).

## Requisitos e início

- Node.js 24 LTS e pnpm 12.21.0.
- Para testes E2E, instale o Chromium com `pnpm exec playwright install chromium`.
- Para validar o banco localmente, use Supabase CLI e Docker.

```sh
pnpm install
pnpm dev:web
```

Abra [a aplicação local](http://localhost:3000) e selecione **Explorar demonstração**. O modo padrão é `mock`. As alterações ficam no armazenamento deste navegador, com o catálogo e os deslocamentos fictícios. Excluir a chave `noke-demo-v1` no armazenamento local restaura os dados iniciais.

## Workspace

| Caminho                  | Responsabilidade                                            |
| ------------------------ | ----------------------------------------------------------- |
| `apps/web`               | Next.js 16, React 19 e Tailwind CSS 4                       |
| `apps/mobile`            | Expo SDK 58, React Native 0.88 e Expo Router                |
| `packages/domain`        | Tipos, cálculos, formatação pt-BR e contratos de integração |
| `packages/design-tokens` | Paleta, tipografia, espaçamento e dimensões                 |
| `packages/validation`    | Esquemas Zod e validações de domínio                        |
| `packages/config`        | Configuração TypeScript compartilhada                       |
| `supabase`               | Migrations, configuração e seed local                       |

## Comandos

| Comando           | Uso                                             |
| ----------------- | ----------------------------------------------- |
| `pnpm dev`        | Inicia web e Expo pelo Turbo                    |
| `pnpm dev:web`    | Inicia Next.js                                  |
| `pnpm dev:mobile` | Inicia Metro para o Expo                        |
| `pnpm build`      | Build web e exportação de bundles Expo          |
| `pnpm lint`       | ESLint                                          |
| `pnpm typecheck`  | TypeScript em modo strict                       |
| `pnpm test`       | Testes unitários Vitest                         |
| `pnpm test:e2e`   | Testes Chromium em servidor local na porta 3010 |
| `pnpm format`     | Prettier                                        |
| `pnpm check`      | Lint, typecheck e testes unitários              |

## Supabase

Copie `.env.example` para `apps/web/.env.local`. A configuração local pode usar `supabase start` e `supabase db reset` na raiz, em uma instância descartável. Preencha a URL e a chave publicável. Com `APP_DATA_MODE=supabase`, o login por e-mail usa o cliente SSR e as páginas internas verificam a sessão. A área autenticada mostra o estado de configuração enquanto o repositório persistente e o provisionamento de perfis aguardam integração. Mantenha `APP_DATA_MODE=mock` para navegar no MVP. Provedores Google e Apple e recuperação de senha exigem configuração e integração adicionais.

Os buckets de imagens são privados. Consulte as [políticas e camadas](docs/ARCHITECTURE.md) antes de integrar uploads ou persistência.

## Aplicativo mobile

Execute `pnpm dev:mobile` e siga os atalhos do Expo para emuladores. Também é possível abrir o destino web do Expo durante desenvolvimento. O app traz splash, tela de login, Home e as abas Compras, Gastos e Perfil. A exportação do Expo verifica os bundles JavaScript. Builds nativos assinados exigem os toolchains das plataformas.

A área gráfica da splash web usa um ícone provisório. O logotipo e a mascote oficiais podem ser adicionados em `apps/web/public/brand/`, com versão mobile em `apps/mobile/assets/brand/`.
