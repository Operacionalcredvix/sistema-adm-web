# Sistema ADM 0.6.1 — Design System base

## Direção

O Sistema ADM deve parecer ferramenta operacional interna, não apresentação interativa.

Regras:
- amarelo = navegação ativa, ação principal ou destaque de atenção;
- vermelho = vencido, erro ou risco real;
- cinza = estrutura, informação neutra e segundo plano;
- glow = pontual, nunca decoração permanente.

## Arquivos

- `app/product-system.css`: nova camada visual do produto.
- `components/ui/apis-page-header.tsx`
- `components/ui/apis-panel.tsx`
- `components/ui/apis-notice.tsx`
- `components/ui/apis-status-badge.tsx`

## Regra de manutenção

Evitar novos blocos grandes no fim de `globals.css`.
Novos refinamentos globais entram em `app/product-system.css`.
Refinamentos específicos devem virar componente ou CSS local por tela.

## Próximas etapas

1. 0.6.2 — Unidades como fila operacional.
2. 0.6.3 — Central de pendências como fila de execução.
3. 0.6.4 — Ficha da unidade como registro operacional.
4. 0.6.5 — Modais e formulários.
5. 0.6.6 — Usuários e acessos.
