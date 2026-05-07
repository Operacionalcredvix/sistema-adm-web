# Sistema ADM 0.6.3 — Organização da tela de Unidades

## Objetivo

Reorganizar a tela de Unidades sem criar menu novo e sem alterar regra de negócio.

A tela anterior estava visualmente mais confortável depois do 0.6.2, mas ainda parecia empilhada:
topbar, métricas, busca, filtros, cards grandes, badges, mensagens e botão competiam ao mesmo tempo.

## Mudanças

- Troca o cabeçalho da tela de Unidades por um header próprio mais limpo.
- Agrupa o resumo operacional em um painel mais claro.
- Junta busca e filtros em uma barra operacional compacta.
- Reduz os cards de unidade.
- Remove a caixa grande de "Próxima ação" dentro do card.
- Troca prioridade técnica por linguagem mais amigável:
  - Alta prioridade
  - Atenção
  - Acompanhar
  - Rotina
- Mantém a ficha acessível clicando no card.
- Mantém cache, Supabase, filtros e regras existentes.

## O que não muda

- Banco
- Supabase
- Cache
- Anexos
- Regras de alerta
- Menu lateral
- Permissões
