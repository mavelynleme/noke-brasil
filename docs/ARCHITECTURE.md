# Arquitetura

Os apps importam o domínio, os tokens e a validação. O domínio é independente de frameworks e define os contratos de OCR, rota e mapas. A validação depende do domínio para respeitar as categorias e origens aceitas. A web mantém componentes React DOM e a app usa componentes React Native.

No modo de demonstração, o layout de produto injeta um repositório para o estado local com dados pequenos e previsíveis. As funções de domínio calculam totais, limites e opções de compra. O catálogo combina preços de exemplo e registros locais. Datas da amostra são relativas ao dia em que ela é inicializada para manter a demonstração visível no período corrente.

No modo Supabase, os clientes de browser e servidor usam a chave publicável. O Proxy atualiza os cookies, e a checagem de sessão usa `getClaims()`. O modo Supabase ainda tem uma tela de configuração aguardando provisionamento de perfis e conexão das operações persistentes.

## Banco e acesso

- Perfis pessoais, veículos, endereços, orçamentos, listas, lançamentos de preço e comprovantes possuem políticas de proprietário.
- Listas e itens de nota herdam o acesso do registro pai.
- Grupos definem proprietário diretamente e armazenam os demais papéis no vínculo. Membros podem ler os gastos do grupo. Proprietários administram membros e despesas do grupo. Colaboradores podem criar e gerenciar seus lançamentos enquanto mantêm a permissão.
- Empresas administram as lojas e ofertas vinculadas à própria conta. A relação entre loja e empresa é validada por chave estrangeira composta. Verificação e plano têm grants reservados para futuras operações privilegiadas.
- Produtos e lojas públicos usam flags explícitas. Ofertas públicas dependem de publicação e do catálogo público. Notificações são individuais.
- Avatares, comprovantes e imagens de oferta usam buckets privados com prefixo por usuário, tipos de imagem permitidos e limite de 8 MB. A próxima integração deve conferir o conteúdo binário no servidor e emitir URLs assinadas após autorização.

O seed local registra categorias e produtos. Gastos, orçamentos, usuários e lojas demonstrativos vêm do repositório local da aplicação.

O roteiro `supabase/tests/access.sql` cobre isolamento entre usuários, os papéis viewer e contributor, o namespace privado de comprovantes e a proibição de autoverificação empresarial. Execute-o com uma conexão administrativa de teste após as migrations e o seed. O script termina com rollback.
