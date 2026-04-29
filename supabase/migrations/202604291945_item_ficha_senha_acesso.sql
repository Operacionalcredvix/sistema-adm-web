-- Sistema ADM 0.4.8
-- Complemento dos campos de acesso de contas.
-- Adiciona senha_acesso como campo nulo.

alter table public.item_ficha
  add column if not exists senha_acesso text null;

comment on column public.item_ficha.senha_acesso is
  'Senha usada para acessar a conta/documento. Dado sensível: não exibir aberta diretamente em cards.';
