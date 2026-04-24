# Sistema ADM

Sistema web para gestão administrativa das fichas de unidades do Grupo APIS.

O sistema substitui uma rotina baseada em planilha improvisada por uma base organizada de unidades, itens da ficha, anexos, vencimentos, pendências e alertas operacionais.

## Objetivo do produto

O Sistema ADM tem como objetivo centralizar, por unidade, as informações administrativas necessárias para acompanhamento operacional.

O foco do MVP é simples:

- consultar unidades;
- abrir a ficha da unidade;
- editar dados da unidade;
- editar itens da ficha;
- anexar documentos;
- abrir anexos;
- remover anexos da ficha com segurança;
- acompanhar alertas operacionais;
- acompanhar pendências de cadastro.

A diretriz principal do projeto é manter simplicidade. Não adicionar robustez desnecessária antes de validar uso real.

## Stack atual

- Frontend: Next.js
- Linguagem: TypeScript
- Autenticação: Supabase Auth
- Banco de dados: Supabase/PostgreSQL
- Storage de anexos: Supabase Storage
- Deploy: Vercel
- Repositório: GitHub

## Ambientes

### Produção

URL pública:

```txt
https://sistema-adm-web.vercel.app
```

### Local

Caminho local atual no Windows:

```txt
C:\Users\Operacional\Documents\Credvix\08_entregas_principais\SISTEMA ADM\sistema-adm-web
```

Comando para rodar localmente:

```bash
npm run dev
```

URL local padrão:

```txt
http://localhost:3000
```

## Fluxo correto de alteração

Toda alteração deve seguir este fluxo:

1. Rodar localmente com `npm run dev`.
2. Aplicar a alteração no código.
3. Testar localmente.
4. Conferir arquivos alterados com `git status`.
5. Fazer commit.
6. Fazer push.
7. Aguardar deploy automático da Vercel.
8. Testar a URL pública.

Comandos padrão:

```bash
git status
git add .
git commit -m "Mensagem objetiva da alteracao"
git push
```

Para alterações pequenas, prefira adicionar arquivos específicos em vez de `git add .`.

Exemplo:

```bash
git add app/login/page.tsx components/app/admin-topbar.tsx
git commit -m "Ajusta acesso controlado"
git push
```

## Variáveis de ambiente

O projeto depende das variáveis do Supabase.

Arquivo local esperado:

```txt
.env.local
```

Variáveis usadas:

```txt
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Essas variáveis também precisam existir na Vercel.

Nunca commitar `.env.local` nem chaves do Supabase no GitHub.

O `.gitignore` deve manter `.env*` ignorado.

## Módulos atuais

### Login

Permite acesso de usuários autorizados.

O cadastro público pela interface foi bloqueado. Novos usuários devem ser criados/liberados pelo administrador no painel do Supabase.

### Unidades

Tela principal de consulta das unidades.

Mostra:

- total de unidades;
- unidades com vencidos;
- unidades com vencimentos próximos;
- unidades com pendências;
- busca por nome, razão social ou CNPJ;
- cards de acesso à ficha.

### Ficha da unidade

Tela de detalhe da unidade.

Mostra:

- dados principais da unidade;
- resumo de alertas;
- seções da ficha;
- itens por seção;
- dados preenchidos por item;
- anexos por item;
- alertas por item.

### Anexos

Cada item da ficha pode receber anexos.

Regra atual de upload:

```txt
Formatos permitidos:
- PDF
- PNG
- JPG
- JPEG

Limite:
- 10 MB
```

Regra atual de remoção:

- o anexo é removido da ficha marcando `ativo=false`;
- o arquivo físico não é apagado do Storage;
- isso reduz risco de perda real de documentos.

### Alertas

O módulo de alertas separa duas leituras:

#### Alertas operacionais

Usado na rotina diária.

Inclui:

- vencidos;
- vencem em breve.

#### Pendências de cadastro

Usado para saneamento da base.

Inclui:

- cadastro incompleto;
- sem anexo.

Essa separação evita confundir pendência de implantação com urgência operacional.

## Estrutura técnica principal

Pastas mais relevantes:

```txt
app/
components/
lib/
public/
```

Arquivos importantes:

```txt
lib/supabase.ts
app/login/page.tsx
app/register/page.tsx
app/unidades/page.tsx
app/unidades/[id]/page.tsx
app/alertas/page.tsx
components/app/admin-shell.tsx
components/app/admin-sidebar.tsx
components/app/admin-topbar.tsx
components/unidades/item-edit-modal.tsx
components/unidades/item-attachments-modal.tsx
components/unidades/section-edit-modal.tsx
```

## Supabase

O sistema usa Supabase para:

- autenticação;
- banco de dados;
- storage de anexos.

Tabelas/views usadas pelo frontend:

```txt
unidade
item_ficha
anexo
vw_unidades_lista
vw_ficha_unidade
vw_alertas_unidade_tela
```

Bucket de anexos:

```txt
anexos-ficha
```

Atenção: a segurança real do sistema depende das regras do Supabase, principalmente RLS e policies do Storage.

## Como criar/liberar usuário

Modelo atual: acesso controlado por administrador.

Passo a passo:

1. Entrar no painel do Supabase.
2. Abrir o projeto do Sistema ADM.
3. Ir em `Authentication`.
4. Entrar em `Users`.
5. Clicar em `Add user` ou `Invite user`, conforme opção disponível.
6. Informar o e-mail da pessoa.
7. Criar usuário com senha temporária ou enviar convite.
8. Orientar a pessoa a acessar:

```txt
https://sistema-adm-web.vercel.app/login
```

9. A pessoa entra com e-mail e senha.

Importante: manter cadastro público desabilitado ou controlado no Supabase.

## Checklist antes de subir alteração

Antes de qualquer commit/push:

```txt
[ ] Rodei npm run dev localmente
[ ] Login funcionou
[ ] Listagem de unidades abriu
[ ] Ficha da unidade abriu
[ ] Não apareceu erro no terminal
[ ] Não apareceu erro grave no navegador
[ ] A alteração foi testada no fluxo real
[ ] Rodei git status
[ ] Sei quais arquivos serão commitados
```

## Checklist específico de anexos

Antes de subir alteração envolvendo anexos:

```txt
[ ] Testei upload de PDF pequeno
[ ] Testei upload de imagem JPG/PNG pequena
[ ] Testei bloqueio de arquivo inválido
[ ] Testei bloqueio de arquivo grande, se possível
[ ] Testei abrir anexo enviado
[ ] Testei remover anexo de teste
[ ] Confirmei que anexos reais/importantes não foram usados no teste
```

## Checklist depois do push

Depois de `git push`:

```txt
[ ] Aguardei deploy da Vercel
[ ] Abri a URL pública
[ ] Forcei atualização com Ctrl + F5
[ ] Testei login
[ ] Testei unidade
[ ] Testei ficha
[ ] Testei a funcionalidade alterada
[ ] Rodei git status localmente
[ ] Confirmei working tree clean
```

## Comandos úteis

Rodar projeto:

```bash
npm run dev
```

Ver alterações:

```bash
git status
```

Adicionar arquivos específicos:

```bash
git add caminho/do/arquivo.tsx
```

Commit:

```bash
git commit -m "Mensagem objetiva"
```

Push:

```bash
git push
```

Apagar arquivo solto de pacote:

```bash
del LEIA-ME.txt
```

Limpar scripts temporários de pacote:

```bash
del aplicar-patch-0.2.3.bat
rmdir /s /q scripts
```

## Problemas comuns

### `Invalid Refresh Token`

Mensagem comum:

```txt
AuthApiError: Invalid Refresh Token: Refresh Token Not Found
```

Normalmente é sessão antiga do navegador.

Solução prática:

1. sair e entrar novamente;
2. se persistir, limpar dados do site no navegador;
3. testar em aba anônima.

### Aviso de múltiplos package-lock

Mensagem possível:

```txt
Next.js inferred your workspace root...
Detected additional lockfiles...
```

Isso indica que existe outro `package-lock.json` fora da pasta do projeto, por exemplo:

```txt
C:\Users\Operacional\package-lock.json
```

Não costuma impedir o sistema de rodar, mas pode confundir o Turbopack. Deve ser revisado com cuidado antes de apagar qualquer arquivo fora do projeto.

### Botão apagado em modal

Foi criado ajuste visual para destacar CTAs principais em amarelo/brilhante.

Arquivo relacionado:

```txt
app/cta-overrides.css
```

## Decisões atuais do MVP

- Não reconstruir o sistema do zero.
- Não adicionar backend pesado sem necessidade.
- Não criar módulos novos antes de estabilizar segurança e uso real.
- Não apagar fisicamente anexos ao remover da ficha.
- Não permitir cadastro público pela interface.
- Manter evolução por pacotes pequenos e testáveis.

## Roadmap curto

### 0.2 — Produção controlada

- cadastro público bloqueado;
- validação de anexos;
- remoção segura de anexos;
- README real;
- checklist de deploy;
- revisão de Supabase Auth, RLS e Storage policies.

### 0.3 — Operação assistida

- melhorar fila de pendências;
- priorizar itens com alerta dentro da ficha;
- melhorar mensagens amigáveis;
- refinar labels dos campos;
- padronizar feedback visual.

### 0.4 — Governança leve

- histórico simples de alterações;
- identificar quem alterou dados;
- registrar envio/remoção de anexo;
- preparar perfis de acesso.

## Observação final

Este projeto já está em uso real. Portanto, qualquer alteração deve ser pequena, testada localmente e subida com cautela.

A prioridade não é criar mais funcionalidades. A prioridade é manter o sistema confiável, simples e seguro para a operação.
