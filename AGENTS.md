# Noke Brasil

O escopo funcional e visual original está em `docs/escopo-noke-brasil.docx`. O workspace usa pnpm e Turbo. Trabalhe na raiz em vez de criar um segundo diretório do projeto.

- `apps/web`: Next.js App Router. As rotas públicas e de produto têm grupos de layout. As mutações demo passam pelo repositório local.
- `apps/mobile`: Expo Router e StyleSheet. Compartilhe tipos, regras e tokens, mantendo apresentação nativa.
- `packages/domain`: valores monetários em centavos, datas de despesas `YYYY-MM-DD`, regra de período e comparação de compras.
- `packages/validation`: validação reutilizável em formulários e fronteiras de servidor.
- `supabase/migrations`: fonte de verdade do esquema, grants, RLS e Storage.

Execute `pnpm check`, `pnpm build` e `pnpm test:e2e` na raiz. Prefira `pnpm dev:web` ou `pnpm dev:mobile` para iterar em um app.

O MVP roda em modo demo. Identifique OCR e rotas simuladas na interface. Preserve o texto “Saldo já usado”. Mantenha segredos fora do repositório e autorize operações persistentes por sessão e por recurso. Adicione migrations com RLS e testes de isolamento ao evoluir o banco. Deploy e serviços externos exigem solicitação própria.

A próxima etapa é validar as migrations no stack Supabase local e ligar os repositórios autenticados. Consulte [o roadmap](docs/ROADMAP.md).
