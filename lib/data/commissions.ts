export type CommissionOrigin = "BMG";

export type CommissionStatus =
  | "OK_PRODUCAO_E_COMISSAO"
  | "OK_COM_DIVERGENCIA_VALOR"
  | "SO_PRODUCAO"
  | "SO_COMISSAO"
  | "EXCLUIDA_COMPETENCIA_CLIENTE"
  | "PENDENTE_VALIDACAO";

export type CommissionPerfil =
  | "consultor"
  | "supervisor"
  | "coordenador"
  | "gerencia"
  | "admin";

export type CommissionUserAccess = {
  email: string;
  perfil: CommissionPerfil;
  perfilLabel: string;
  pessoaId?: string;
  pessoaNome?: string;
  supervisorNome?: string;
  coordenadorNome?: string;
};

export type PreviaFrontRow = {
  competencia: string;
  origem: CommissionOrigin;
  pessoa_id: string;
  pessoa_nome: string;
  perfil: CommissionPerfil;
  loja_id: string;
  loja_nome: string;
  supervisor_nome: string;
  coordenador_nome: string;
  qtd_propostas: number;
  producao_bmg: number;
  base_comissao_bmg: number;
  comissao_liquida_bmg: number;
  status_fechamento: CommissionStatus;
  ultima_atualizacao: string;
};

export type DetalhePropostaRow = {
  competencia: string;
  origem: CommissionOrigin;
  proposta: string;
  cliente: string;
  consultor: string;
  consultor_id: string;
  loja: string;
  loja_id: string;
  supervisor: string;
  coordenador: string;
  grupo_produto: string;
  produto: string;
  valor_producao: number;
  valor_base_comissao: number;
  valor_liquido_comissao: number;
  situacao: CommissionStatus;
  pagamento_cliente: string;
  pagamento_comissao: string;
  arquivo_origem: string;
  observacao: string;
};

export type DashboardResumo = {
  competencia: string;
  origem: CommissionOrigin;
  producaoTotalBmg: number;
  qtdPropostas: number;
  baseComissaoBmg: number;
  comissaoLiquidaBmg: number;
  pendenciasValidacao: number;
  ultimaAtualizacao: string;
};

export type MinhaPreviaResumo = {
  pessoaNome: string;
  lojaNome: string;
  producaoBmg: number;
  qtdPropostas: number;
  baseComissaoBmg: number;
  comissaoLiquidaBmg: number;
  pendencias: number;
};

export type ProdutoResumo = {
  produto: string;
  grupoProduto: string;
  qtdPropostas: number;
  producaoBmg: number;
  baseComissaoBmg: number;
  comissaoLiquidaBmg: number;
};

export type LojaResumo = {
  lojaId: string;
  lojaNome: string;
  supervisorNome: string;
  coordenadorNome: string;
  qtdPropostas: number;
  producaoBmg: number;
  baseComissaoBmg: number;
  comissaoLiquidaBmg: number;
  pendencias: number;
};

export type HierarquiaResumo = {
  coordenadorNome: string;
  supervisorNome: string;
  lojas: LojaResumo[];
  produtos: ProdutoResumo[];
  qtdPropostas: number;
  producaoBmg: number;
  baseComissaoBmg: number;
  comissaoLiquidaBmg: number;
  pendencias: number;
};

const COMPETENCIA_ATUAL = "Abril/2026";
const ORIGEM_ATUAL: CommissionOrigin = "BMG";
const ULTIMA_ATUALIZACAO = "2026-04-30T18:42:00";

const profileLabels: Record<CommissionPerfil, string> = {
  consultor: "Consultor",
  supervisor: "Supervisor",
  coordenador: "Coordenador",
  gerencia: "Gerência",
  admin: "Admin",
};

const mockedProfiles: Record<string, CommissionUserAccess> = {
  "mayara.souza@credvix.com.br": {
    email: "mayara.souza@credvix.com.br",
    perfil: "consultor",
    perfilLabel: profileLabels.consultor,
    pessoaId: "pessoa-mayara",
    pessoaNome: "MAYARA SOUZA",
  },
  "renata.almeida@credvix.com.br": {
    email: "renata.almeida@credvix.com.br",
    perfil: "supervisor",
    perfilLabel: profileLabels.supervisor,
    supervisorNome: "RENATA ALMEIDA",
  },
  "carlos.mendes@credvix.com.br": {
    email: "carlos.mendes@credvix.com.br",
    perfil: "coordenador",
    perfilLabel: profileLabels.coordenador,
    coordenadorNome: "CARLOS MENDES",
  },
  "gerencia@credvix.com.br": {
    email: "gerencia@credvix.com.br",
    perfil: "gerencia",
    perfilLabel: profileLabels.gerencia,
  },
  "admin@credvix.com.br": {
    email: "admin@credvix.com.br",
    perfil: "admin",
    perfilLabel: profileLabels.admin,
  },
};

export const mockDetalhePropostas: DetalhePropostaRow[] = [
  {
    competencia: COMPETENCIA_ATUAL,
    origem: ORIGEM_ATUAL,
    proposta: "BMG-0426-001",
    cliente: "Cliente Fictício 001",
    consultor: "MAYARA SOUZA",
    consultor_id: "pessoa-mayara",
    loja: "53744 - HELP! - ES - CACHOEIRO - CENTRO",
    loja_id: "loja-53744",
    supervisor: "RENATA ALMEIDA",
    coordenador: "CARLOS MENDES",
    grupo_produto: "Conta e crédito",
    produto: "Crédito na Conta",
    valor_producao: 18500,
    valor_base_comissao: 17850,
    valor_liquido_comissao: 535.5,
    situacao: "OK_PRODUCAO_E_COMISSAO",
    pagamento_cliente: "2026-04-04",
    pagamento_comissao: "2026-04-10",
    arquivo_origem: "mock_bmg_abril_2026.csv",
    observacao: "Proposta conciliada entre produção e comissão BMG.",
  },
  {
    competencia: COMPETENCIA_ATUAL,
    origem: ORIGEM_ATUAL,
    proposta: "BMG-0426-002",
    cliente: "Cliente Fictício 002",
    consultor: "MAYARA SOUZA",
    consultor_id: "pessoa-mayara",
    loja: "53744 - HELP! - ES - CACHOEIRO - CENTRO",
    loja_id: "loja-53744",
    supervisor: "RENATA ALMEIDA",
    coordenador: "CARLOS MENDES",
    grupo_produto: "Cartão",
    produto: "Cartão Benefício",
    valor_producao: 9200,
    valor_base_comissao: 9200,
    valor_liquido_comissao: 184,
    situacao: "OK_PRODUCAO_E_COMISSAO",
    pagamento_cliente: "2026-04-06",
    pagamento_comissao: "2026-04-12",
    arquivo_origem: "mock_bmg_abril_2026.csv",
    observacao: "Sem divergência encontrada no mock.",
  },
  {
    competencia: COMPETENCIA_ATUAL,
    origem: ORIGEM_ATUAL,
    proposta: "BMG-0426-003",
    cliente: "Cliente Fictício 003",
    consultor: "MAYARA SOUZA",
    consultor_id: "pessoa-mayara",
    loja: "53744 - HELP! - ES - CACHOEIRO - CENTRO",
    loja_id: "loja-53744",
    supervisor: "RENATA ALMEIDA",
    coordenador: "CARLOS MENDES",
    grupo_produto: "Conta e crédito",
    produto: "Crédito na Conta",
    valor_producao: 14300,
    valor_base_comissao: 13800,
    valor_liquido_comissao: 414,
    situacao: "OK_COM_DIVERGENCIA_VALOR",
    pagamento_cliente: "2026-04-09",
    pagamento_comissao: "2026-04-15",
    arquivo_origem: "mock_bmg_abril_2026.csv",
    observacao: "Diferença pequena entre valor produzido e base de comissão. Revisar antes do fechamento final.",
  },
  {
    competencia: COMPETENCIA_ATUAL,
    origem: ORIGEM_ATUAL,
    proposta: "BMG-0426-004",
    cliente: "Cliente Fictício 004",
    consultor: "MAYARA SOUZA",
    consultor_id: "pessoa-mayara",
    loja: "53744 - HELP! - ES - CACHOEIRO - CENTRO",
    loja_id: "loja-53744",
    supervisor: "RENATA ALMEIDA",
    coordenador: "CARLOS MENDES",
    grupo_produto: "Saque",
    produto: "Saque Complementar",
    valor_producao: 7200,
    valor_base_comissao: 0,
    valor_liquido_comissao: 0,
    situacao: "SO_PRODUCAO",
    pagamento_cliente: "2026-04-11",
    pagamento_comissao: "",
    arquivo_origem: "mock_bmg_abril_2026.csv",
    observacao: "Consta na produção, mas ainda não foi encontrada na base de comissão BMG.",
  },
  {
    competencia: COMPETENCIA_ATUAL,
    origem: ORIGEM_ATUAL,
    proposta: "BMG-0426-005",
    cliente: "Cliente Fictício 005",
    consultor: "JOÃO PEREIRA",
    consultor_id: "pessoa-joao",
    loja: "53745 - HELP! - ES - VILA VELHA - GLÓRIA",
    loja_id: "loja-53745",
    supervisor: "RENATA ALMEIDA",
    coordenador: "CARLOS MENDES",
    grupo_produto: "Conta e crédito",
    produto: "Crédito na Conta",
    valor_producao: 26100,
    valor_base_comissao: 25300,
    valor_liquido_comissao: 759,
    situacao: "OK_PRODUCAO_E_COMISSAO",
    pagamento_cliente: "2026-04-13",
    pagamento_comissao: "2026-04-18",
    arquivo_origem: "mock_bmg_abril_2026.csv",
    observacao: "Proposta considerada na competência de abril pelo pagamento ao cliente.",
  },
  {
    competencia: COMPETENCIA_ATUAL,
    origem: ORIGEM_ATUAL,
    proposta: "BMG-0426-006",
    cliente: "Cliente Fictício 006",
    consultor: "JOÃO PEREIRA",
    consultor_id: "pessoa-joao",
    loja: "53745 - HELP! - ES - VILA VELHA - GLÓRIA",
    loja_id: "loja-53745",
    supervisor: "RENATA ALMEIDA",
    coordenador: "CARLOS MENDES",
    grupo_produto: "Cartão",
    produto: "Cartão Benefício",
    valor_producao: 0,
    valor_base_comissao: 8600,
    valor_liquido_comissao: 172,
    situacao: "SO_COMISSAO",
    pagamento_cliente: "",
    pagamento_comissao: "2026-04-19",
    arquivo_origem: "mock_bmg_abril_2026.csv",
    observacao: "Comissão localizada sem correspondente na produção. Precisa validação operacional.",
  },
  {
    competencia: COMPETENCIA_ATUAL,
    origem: ORIGEM_ATUAL,
    proposta: "BMG-0426-007",
    cliente: "Cliente Fictício 007",
    consultor: "ANA LIMA",
    consultor_id: "pessoa-ana",
    loja: "53746 - HELP! - ES - LINHARES - CENTRO",
    loja_id: "loja-53746",
    supervisor: "PAULA ROCHA",
    coordenador: "CARLOS MENDES",
    grupo_produto: "Conta e crédito",
    produto: "Crédito na Conta",
    valor_producao: 31000,
    valor_base_comissao: 31000,
    valor_liquido_comissao: 930,
    situacao: "OK_PRODUCAO_E_COMISSAO",
    pagamento_cliente: "2026-04-16",
    pagamento_comissao: "2026-04-22",
    arquivo_origem: "mock_bmg_abril_2026.csv",
    observacao: "Sem pendência de conciliação.",
  },
  {
    competencia: COMPETENCIA_ATUAL,
    origem: ORIGEM_ATUAL,
    proposta: "BMG-0426-008",
    cliente: "Cliente Fictício 008",
    consultor: "ANA LIMA",
    consultor_id: "pessoa-ana",
    loja: "53746 - HELP! - ES - LINHARES - CENTRO",
    loja_id: "loja-53746",
    supervisor: "PAULA ROCHA",
    coordenador: "CARLOS MENDES",
    grupo_produto: "Saque",
    produto: "Saque Complementar",
    valor_producao: 11200,
    valor_base_comissao: 10800,
    valor_liquido_comissao: 216,
    situacao: "PENDENTE_VALIDACAO",
    pagamento_cliente: "2026-04-18",
    pagamento_comissao: "2026-04-25",
    arquivo_origem: "mock_bmg_abril_2026.csv",
    observacao: "Registro mantido como pendente até conferência final da base tratada.",
  },
  {
    competencia: COMPETENCIA_ATUAL,
    origem: ORIGEM_ATUAL,
    proposta: "BMG-0426-009",
    cliente: "Cliente Fictício 009",
    consultor: "ANA LIMA",
    consultor_id: "pessoa-ana",
    loja: "53746 - HELP! - ES - LINHARES - CENTRO",
    loja_id: "loja-53746",
    supervisor: "PAULA ROCHA",
    coordenador: "CARLOS MENDES",
    grupo_produto: "Conta e crédito",
    produto: "Crédito na Conta",
    valor_producao: 19800,
    valor_base_comissao: 19800,
    valor_liquido_comissao: 594,
    situacao: "EXCLUIDA_COMPETENCIA_CLIENTE",
    pagamento_cliente: "2026-03-29",
    pagamento_comissao: "2026-04-05",
    arquivo_origem: "mock_bmg_abril_2026.csv",
    observacao: "Comissão apareceu em abril, mas o pagamento ao cliente ocorreu em março. Deve ficar excluída da campanha de abril.",
  },
  {
    competencia: COMPETENCIA_ATUAL,
    origem: ORIGEM_ATUAL,
    proposta: "BMG-0426-010",
    cliente: "Cliente Fictício 010",
    consultor: "BRUNO COSTA",
    consultor_id: "pessoa-bruno",
    loja: "53747 - HELP! - ES - COLATINA - CENTRO",
    loja_id: "loja-53747",
    supervisor: "MARCOS SILVA",
    coordenador: "FERNANDA MOTA",
    grupo_produto: "Conta e crédito",
    produto: "Crédito na Conta",
    valor_producao: 22100,
    valor_base_comissao: 22100,
    valor_liquido_comissao: 663,
    situacao: "OK_PRODUCAO_E_COMISSAO",
    pagamento_cliente: "2026-04-21",
    pagamento_comissao: "2026-04-27",
    arquivo_origem: "mock_bmg_abril_2026.csv",
    observacao: "Proposta conciliada.",
  },
  {
    competencia: COMPETENCIA_ATUAL,
    origem: ORIGEM_ATUAL,
    proposta: "BMG-0426-011",
    cliente: "Cliente Fictício 011",
    consultor: "BRUNO COSTA",
    consultor_id: "pessoa-bruno",
    loja: "53747 - HELP! - ES - COLATINA - CENTRO",
    loja_id: "loja-53747",
    supervisor: "MARCOS SILVA",
    coordenador: "FERNANDA MOTA",
    grupo_produto: "Cartão",
    produto: "Cartão Benefício",
    valor_producao: 6300,
    valor_base_comissao: 6300,
    valor_liquido_comissao: 126,
    situacao: "OK_PRODUCAO_E_COMISSAO",
    pagamento_cliente: "2026-04-22",
    pagamento_comissao: "2026-04-28",
    arquivo_origem: "mock_bmg_abril_2026.csv",
    observacao: "Sem divergência encontrada no mock.",
  },
  {
    competencia: COMPETENCIA_ATUAL,
    origem: ORIGEM_ATUAL,
    proposta: "BMG-0426-012",
    cliente: "Cliente Fictício 012",
    consultor: "LARISSA NUNES",
    consultor_id: "pessoa-larissa",
    loja: "53748 - HELP! - ES - SERRA - LARANJEIRAS",
    loja_id: "loja-53748",
    supervisor: "MARCOS SILVA",
    coordenador: "FERNANDA MOTA",
    grupo_produto: "Saque",
    produto: "Saque Complementar",
    valor_producao: 15400,
    valor_base_comissao: 15100,
    valor_liquido_comissao: 302,
    situacao: "OK_COM_DIVERGENCIA_VALOR",
    pagamento_cliente: "2026-04-25",
    pagamento_comissao: "2026-04-30",
    arquivo_origem: "mock_bmg_abril_2026.csv",
    observacao: "Diferença controlada para demonstração visual da tela de exceções.",
  },
];

export function getCommissionUserAccess(userEmail: string): CommissionUserAccess {
  const normalizedEmail = userEmail.trim().toLowerCase();
  const mockedProfile = mockedProfiles[normalizedEmail];

  if (mockedProfile) return mockedProfile;

  return {
    email: normalizedEmail,
    perfil: "admin",
    perfilLabel: "Admin mock",
  };
}

function isPendente(status: CommissionStatus) {
  return status !== "OK_PRODUCAO_E_COMISSAO";
}

function isConsideradaNaCompetencia(proposta: DetalhePropostaRow) {
  return proposta.situacao !== "EXCLUIDA_COMPETENCIA_CLIENTE";
}

function sumBy<T>(rows: T[], getValue: (row: T) => number) {
  return rows.reduce((total, row) => total + getValue(row), 0);
}

function groupBy<T>(rows: T[], getKey: (row: T) => string) {
  return rows.reduce<Record<string, T[]>>((acc, row) => {
    const key = getKey(row);
    if (!acc[key]) acc[key] = [];
    acc[key].push(row);
    return acc;
  }, {});
}

function toProdutoResumo(rows: DetalhePropostaRow[]): ProdutoResumo[] {
  const grouped = groupBy(rows, (row) => row.produto);

  return Object.entries(grouped)
    .map(([produto, propostas]) => ({
      produto,
      grupoProduto: propostas[0]?.grupo_produto ?? "Produto",
      qtdPropostas: propostas.length,
      producaoBmg: sumBy(propostas, (row) => row.valor_producao),
      baseComissaoBmg: sumBy(propostas, (row) => row.valor_base_comissao),
      comissaoLiquidaBmg: sumBy(propostas, (row) => row.valor_liquido_comissao),
    }))
    .sort((a, b) => b.producaoBmg - a.producaoBmg);
}

function toLojaResumo(rows: DetalhePropostaRow[]): LojaResumo[] {
  const grouped = groupBy(rows, (row) => row.loja_id);

  return Object.entries(grouped)
    .map(([lojaId, propostas]) => ({
      lojaId,
      lojaNome: propostas[0]?.loja ?? lojaId,
      supervisorNome: propostas[0]?.supervisor ?? "Não informado",
      coordenadorNome: propostas[0]?.coordenador ?? "Não informado",
      qtdPropostas: propostas.length,
      producaoBmg: sumBy(propostas, (row) => row.valor_producao),
      baseComissaoBmg: sumBy(propostas, (row) => row.valor_base_comissao),
      comissaoLiquidaBmg: sumBy(propostas, (row) => row.valor_liquido_comissao),
      pendencias: propostas.filter((row) => isPendente(row.situacao)).length,
    }))
    .sort((a, b) => b.producaoBmg - a.producaoBmg);
}

function filterRowsByAccess(rows: DetalhePropostaRow[], userEmail: string, perfil?: CommissionPerfil) {
  const access = getCommissionUserAccess(userEmail);
  const activePerfil = perfil ?? access.perfil;

  if (activePerfil === "consultor" && access.pessoaId) {
    return rows.filter((row) => row.consultor_id === access.pessoaId);
  }

  if (activePerfil === "supervisor" && access.supervisorNome) {
    return rows.filter((row) => row.supervisor === access.supervisorNome);
  }

  if (activePerfil === "coordenador" && access.coordenadorNome) {
    return rows.filter((row) => row.coordenador === access.coordenadorNome);
  }

  return rows;
}

export function getDashboardResumo(): DashboardResumo {
  const propostasConsideradas = mockDetalhePropostas.filter(isConsideradaNaCompetencia);

  return {
    competencia: COMPETENCIA_ATUAL,
    origem: ORIGEM_ATUAL,
    producaoTotalBmg: sumBy(propostasConsideradas, (row) => row.valor_producao),
    qtdPropostas: propostasConsideradas.length,
    baseComissaoBmg: sumBy(propostasConsideradas, (row) => row.valor_base_comissao),
    comissaoLiquidaBmg: sumBy(propostasConsideradas, (row) => row.valor_liquido_comissao),
    pendenciasValidacao: mockDetalhePropostas.filter((row) => isPendente(row.situacao)).length,
    ultimaAtualizacao: ULTIMA_ATUALIZACAO,
  };
}

export function getMinhaPrevia(userEmail: string) {
  const access = getCommissionUserAccess(userEmail);
  const pessoaId = access.pessoaId ?? "pessoa-mayara";
  const propostas = mockDetalhePropostas.filter((row) => row.consultor_id === pessoaId);
  const propostasConsideradas = propostas.filter(isConsideradaNaCompetencia);

  return {
    access,
    resumo: {
      pessoaNome: propostas[0]?.consultor ?? access.pessoaNome ?? "MAYARA SOUZA",
      lojaNome: propostas[0]?.loja ?? "53744 - HELP! - ES - CACHOEIRO - CENTRO",
      producaoBmg: sumBy(propostasConsideradas, (row) => row.valor_producao),
      qtdPropostas: propostasConsideradas.length,
      baseComissaoBmg: sumBy(propostasConsideradas, (row) => row.valor_base_comissao),
      comissaoLiquidaBmg: sumBy(propostasConsideradas, (row) => row.valor_liquido_comissao),
      pendencias: propostas.filter((row) => isPendente(row.situacao)).length,
    } satisfies MinhaPreviaResumo,
    produtos: toProdutoResumo(propostasConsideradas),
    propostas,
  };
}

export function getLojasResumo(userEmail: string, perfil?: CommissionPerfil) {
  const rows = filterRowsByAccess(mockDetalhePropostas, userEmail, perfil).filter(isConsideradaNaCompetencia);
  return toLojaResumo(rows);
}

export function getHierarquiaResumo(userEmail: string, perfil?: CommissionPerfil): HierarquiaResumo[] {
  const rows = filterRowsByAccess(mockDetalhePropostas, userEmail, perfil).filter(isConsideradaNaCompetencia);
  const grouped = groupBy(rows, (row) => `${row.coordenador}|||${row.supervisor}`);

  return Object.entries(grouped)
    .map(([key, propostas]) => {
      const [coordenadorNome, supervisorNome] = key.split("|||");

      return {
        coordenadorNome,
        supervisorNome,
        lojas: toLojaResumo(propostas),
        produtos: toProdutoResumo(propostas),
        qtdPropostas: propostas.length,
        producaoBmg: sumBy(propostas, (row) => row.valor_producao),
        baseComissaoBmg: sumBy(propostas, (row) => row.valor_base_comissao),
        comissaoLiquidaBmg: sumBy(propostas, (row) => row.valor_liquido_comissao),
        pendencias: propostas.filter((row) => isPendente(row.situacao)).length,
      };
    })
    .sort((a, b) => b.producaoBmg - a.producaoBmg);
}

export function getExcecoes() {
  return mockDetalhePropostas.filter((row) => row.situacao !== "OK_PRODUCAO_E_COMISSAO");
}

export function getPropostaDetalhe(proposta: string) {
  return mockDetalhePropostas.find((row) => row.proposta === proposta) ?? null;
}

export function getProdutosDisponiveis(rows = mockDetalhePropostas) {
  return Array.from(new Set(rows.map((row) => row.produto))).sort();
}

export function getLojasDisponiveis(rows = mockDetalhePropostas) {
  return Array.from(new Set(rows.map((row) => row.loja))).sort();
}

export function getStatusLabel(status: CommissionStatus) {
  const labels: Record<CommissionStatus, string> = {
    OK_PRODUCAO_E_COMISSAO: "OK",
    OK_COM_DIVERGENCIA_VALOR: "Divergência",
    SO_PRODUCAO: "Só produção",
    SO_COMISSAO: "Só comissão",
    EXCLUIDA_COMPETENCIA_CLIENTE: "Excluída da competência",
    PENDENTE_VALIDACAO: "Pendente",
  };

  return labels[status];
}

export function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  });
}

export function formatDateTimeBR(value: string) {
  if (!value) return "Não informado";

  return new Date(value).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export function formatDateBR(value: string) {
  if (!value) return "Não informado";
  return new Date(`${value}T00:00:00`).toLocaleDateString("pt-BR");
}
