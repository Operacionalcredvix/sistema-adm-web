-- Sistema ADM 0.4.6
-- Campos estruturados para acesso de contas em itens da ficha.
-- Escopo básico: onde achar e login.

alter table public.item_ficha
  add column if not exists onde_achar text null,
  add column if not exists login_acesso text null;

comment on column public.item_ficha.onde_achar is
  'URL, site, aplicativo ou local onde a conta/documento pode ser acessado.';

comment on column public.item_ficha.login_acesso is
  'Login usado para acessar a conta/documento.';
