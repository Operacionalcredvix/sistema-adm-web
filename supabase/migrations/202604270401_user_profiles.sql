-- Sistema ADM 0.4.1
-- Estrutura minima de perfis de acesso.
-- Baixo risco: cria uma tabela nova e permite apenas leitura do proprio perfil.
-- Nao bloqueia telas, nao altera anexos e nao muda policies das tabelas existentes.

create extension if not exists pgcrypto;

create table if not exists public.usuario_perfil (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  email text,
  perfil text not null default 'consulta',
  nome_exibicao text,
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  constraint usuario_perfil_auth_user_id_unique unique (auth_user_id),
  constraint usuario_perfil_perfil_check check (
    perfil in ('super_admin', 'admin_adm', 'operacao_adm', 'consulta')
  )
);

comment on table public.usuario_perfil is
  'Vincula usuarios do Supabase Auth a perfis internos do Sistema ADM.';

comment on column public.usuario_perfil.perfil is
  'Perfil inicial: super_admin, admin_adm, operacao_adm ou consulta.';

create or replace function public.set_usuario_perfil_atualizado_em()
returns trigger
language plpgsql
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

drop trigger if exists trg_usuario_perfil_atualizado_em on public.usuario_perfil;

create trigger trg_usuario_perfil_atualizado_em
before update on public.usuario_perfil
for each row
execute function public.set_usuario_perfil_atualizado_em();

alter table public.usuario_perfil enable row level security;

drop policy if exists "usuario_perfil_select_own" on public.usuario_perfil;

create policy "usuario_perfil_select_own"
on public.usuario_perfil
for select
to authenticated
using (auth.uid() = auth_user_id);

create index if not exists usuario_perfil_auth_user_id_idx
on public.usuario_perfil (auth_user_id);

create index if not exists usuario_perfil_perfil_idx
on public.usuario_perfil (perfil)
where ativo = true;

-- Diagnostico opcional apos criar a tabela:
-- select id, email, created_at, last_sign_in_at
-- from auth.users
-- order by created_at desc;

-- Modelo de vinculo manual para o primeiro administrador:
-- Troque o e-mail abaixo pelo e-mail real do usuario administrador.
-- insert into public.usuario_perfil (auth_user_id, email, perfil, nome_exibicao)
-- select id, email, 'super_admin', coalesce(raw_user_meta_data->>'name', email)
-- from auth.users
-- where email = 'SEU_EMAIL_ADMIN@EMPRESA.COM'
-- on conflict (auth_user_id) do update set
--   email = excluded.email,
--   perfil = excluded.perfil,
--   nome_exibicao = excluded.nome_exibicao,
--   ativo = true;

-- Modelo para vincular usuarios operacionais depois:
-- insert into public.usuario_perfil (auth_user_id, email, perfil, nome_exibicao)
-- select id, email, 'operacao_adm', coalesce(raw_user_meta_data->>'name', email)
-- from auth.users
-- where email = 'USUARIO@EMPRESA.COM'
-- on conflict (auth_user_id) do update set
--   email = excluded.email,
--   perfil = excluded.perfil,
--   nome_exibicao = excluded.nome_exibicao,
--   ativo = true;
