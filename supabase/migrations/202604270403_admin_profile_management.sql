-- Sistema ADM 0.4.3
-- Gestao minima de perfis pelo painel.
-- Baixo risco: cria funcao controlada para super_admin atualizar vinculos.
-- Nao cria usuarios, nao altera senhas, nao muda RLS das fichas e nao bloqueia modulos.

create table if not exists public.usuario_perfil_auditoria (
  id uuid primary key default gen_random_uuid(),
  alterado_por_auth_user_id uuid references auth.users(id) on delete set null,
  alterado_por_email text,
  alvo_auth_user_id uuid not null references auth.users(id) on delete cascade,
  alvo_email text,
  perfil_anterior text,
  perfil_novo text not null,
  ativo_anterior boolean,
  ativo_novo boolean not null,
  criado_em timestamptz not null default now()
);

comment on table public.usuario_perfil_auditoria is
  'Auditoria simples de alteracoes de perfil feitas pela administracao do Sistema ADM.';

alter table public.usuario_perfil_auditoria enable row level security;

create index if not exists usuario_perfil_auditoria_alvo_idx
on public.usuario_perfil_auditoria (alvo_auth_user_id, criado_em desc);

create index if not exists usuario_perfil_auditoria_alterado_por_idx
on public.usuario_perfil_auditoria (alterado_por_auth_user_id, criado_em desc);

create or replace function public.admin_atualizar_usuario_perfil(
  p_auth_user_id uuid,
  p_perfil text,
  p_ativo boolean default true
)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_actor_id uuid := auth.uid();
  v_actor_email text;
  v_target_email text;
  v_target_nome text;
  v_perfil_anterior text;
  v_ativo_anterior boolean;
begin
  if v_actor_id is null then
    raise exception 'Usuário autenticado não identificado.';
  end if;

  if p_auth_user_id is null then
    raise exception 'Usuário alvo não informado.';
  end if;

  if p_perfil not in ('super_admin', 'admin_adm', 'operacao_adm', 'consulta') then
    raise exception 'Perfil inválido: %', p_perfil;
  end if;

  if not exists (
    select 1
    from public.usuario_perfil perfil_atual
    where perfil_atual.auth_user_id = v_actor_id
      and perfil_atual.perfil = 'super_admin'
      and perfil_atual.ativo = true
  ) then
    raise exception 'Apenas super_admin ativo pode alterar perfis.';
  end if;

  if p_auth_user_id = v_actor_id and (p_perfil <> 'super_admin' or p_ativo = false) then
    raise exception 'Proteção ativa: não é permitido remover o próprio acesso de super_admin.';
  end if;

  select usuario.email::text
    into v_actor_email
  from auth.users usuario
  where usuario.id = v_actor_id;

  select
    usuario.email::text,
    coalesce(nullif(usuario.raw_user_meta_data->>'name', ''), usuario.email)::text
    into v_target_email, v_target_nome
  from auth.users usuario
  where usuario.id = p_auth_user_id;

  if v_target_email is null then
    raise exception 'Usuário alvo não encontrado no Supabase Auth.';
  end if;

  select perfil_usuario.perfil, perfil_usuario.ativo
    into v_perfil_anterior, v_ativo_anterior
  from public.usuario_perfil perfil_usuario
  where perfil_usuario.auth_user_id = p_auth_user_id;

  insert into public.usuario_perfil (
    auth_user_id,
    email,
    perfil,
    nome_exibicao,
    ativo
  ) values (
    p_auth_user_id,
    v_target_email,
    p_perfil,
    v_target_nome,
    p_ativo
  )
  on conflict (auth_user_id) do update set
    email = excluded.email,
    perfil = excluded.perfil,
    nome_exibicao = excluded.nome_exibicao,
    ativo = excluded.ativo;

  insert into public.usuario_perfil_auditoria (
    alterado_por_auth_user_id,
    alterado_por_email,
    alvo_auth_user_id,
    alvo_email,
    perfil_anterior,
    perfil_novo,
    ativo_anterior,
    ativo_novo
  ) values (
    v_actor_id,
    v_actor_email,
    p_auth_user_id,
    v_target_email,
    v_perfil_anterior,
    p_perfil,
    v_ativo_anterior,
    p_ativo
  );
end;
$$;

revoke all on function public.admin_atualizar_usuario_perfil(uuid, text, boolean) from public;
revoke all on function public.admin_atualizar_usuario_perfil(uuid, text, boolean) from anon;
grant execute on function public.admin_atualizar_usuario_perfil(uuid, text, boolean) to authenticated;

comment on function public.admin_atualizar_usuario_perfil(uuid, text, boolean) is
  'Permite que apenas super_admin ativo vincule ou atualize perfis de usuarios existentes.';

-- Conferencia manual apos aplicar:
-- select * from public.admin_diagnostico_usuarios_perfis();
-- select * from public.usuario_perfil_auditoria order by criado_em desc limit 20;
