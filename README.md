# Patch - Refinos de UX da ficha da unidade

Este patch corrige três pontos:
1. botões apagados na ficha e no modal de seção
2. excesso de textos internos / explicações que não interessam ao usuário final
3. organização visual da página da unidade para ficar mais intuitiva

## O que muda
- botão da seção fica forte e amarelo
- botão `Anexos` dentro de `Abrir seção` fica forte e amarelo
- textos de dev notes saem da interface
- a área de seções da ficha fica mais clara e direta
- a área de alertas fica mais objetiva

## Arquivos incluídos
- `components/unidades/section-edit-modal.tsx`
- `app/unidades/[id]/page.tsx`
- `app/globals.css`

## Como aplicar
1. pare o `npm run dev`
2. extraia este zip
3. copie o conteúdo para dentro da raiz do projeto `sistema-adm-web`
4. aceite substituir os arquivos
5. rode `npm run dev`
