-- Sistema ADM 0.4.2
-- Diagnostico de usuarios e perfis.
-- Baixo risco: cria uma funcao somente leitura para super_admin.
-- Nao altera permissao das tabelas atuais, nao altera anexos e nao bloqueia fluxo operacional.

create or replace function public.admin_diagnostico_usuarios_perfis()
returns table (
  auth_user_id uuid,
  email text,
  nome_exibicao text,
  perfil text,
  perfil_label text,
  ativo boolean,
  auth_criado_em timestamptz,
  ultimo_login_em timestamptz,
  status_vinculo text
)
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not exists (
    select 1
    from public.usuario_perfil perfil_atual
    where perfil_atual.auth_user_id = auth.uid()
      and perfil_atual.perfil = 'super_admin'
      and perfil_atual.ativo = true
  ) then
    return;
  end if;

  return query
  select
    usuario.id::uuid as auth_user_id,
    usuario.email::text as email,
    coalesce(
      nullif(perfil_usuario.nome_exibicao, ''),
      nullif(usuario.raw_user_meta_data->>'name', ''),
      usuario.email
    )::text as nome_exibicao,
    perfil_usuario.perfil::text as perfil,
    case perfil_usuario.perfil
      when 'super_admin' then 'Super admin'
      when 'admin_adm' then 'Admin ADM'
      when 'operacao_adm' then 'Operação ADM'
      when 'consulta' then 'Consulta'
      else 'Sem perfil vinculado'
    end::text as perfil_label,
    coalesce(perfil_usuario.ativo, false)::boolean as ativo,
    usuario.created_at::timestamptz as auth_criado_em,
    usuario.last_sign_in_at::timestamptz as ultimo_login_em,
    case
      when perfil_usuario.auth_user_id is null then 'sem_perfil'
      when perfil_usuario.ativo = false then 'perfil_inativo'
      else 'perfil_ativo'
    end::text as status_vinculo
  from auth.users usuario
  left join public.usuario_perfil perfil_usuario
    on perfil_usuario.auth_user_id = usuario.id
  order by
    case
      when perfil_usuario.auth_user_id is null then 1
      when perfil_usuario.ativo = false then 2
      else 3
    end,
    usuario.created_at desc;
end;
$$;

revoke all on function public.admin_diagnostico_usuarios_perfis() from public;
grant execute on function public.admin_diagnostico_usuarios_perfis() to authenticated;

comment on function public.admin_diagnostico_usuarios_perfis() is
  'Lista usuarios do Supabase Auth e seus perfis internos apenas para super_admin ativo.';

-- Conferencia manual apos aplicar:
-- select * from public.admin_diagnostico_usuarios_perfis();
