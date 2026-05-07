# Sistema ADM 0.6.3.1 — Aproveitamento de largura da tela

## Objetivo

Reduzir o espaço vazio à direita em telas largas, especialmente na tela de Unidades.

## Observação

A imagem enviada ainda parece mostrar a estrutura anterior à 0.6.3, porque nela aparecem o topo antigo, o bloco "Mapa operacional" e cards grandes com "Próxima ação" dentro do card.

A 0.6.3 reorganiza essa tela. Esta 0.6.3.1 complementa a 0.6.3, aproveitando melhor a largura disponível.

## O que muda

- Aumenta a largura útil do conteúdo.
- Em telas largas, permite que a tela de Unidades respire melhor horizontalmente.
- Na estrutura compacta da 0.6.3, permite 3 colunas de unidades.
- Mantém limite máximo para não ficar exageradamente esticado.
- Não altera banco, Supabase, cache ou regras.

## Arquivo alterado

- `app/product-system.css`
