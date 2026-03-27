/** Contratos da área logada (aluno / admin). JSON em camelCase. */

/** GET /api/avisos */
export interface AvisoDto {
  id: number;
  titulo: string;
  mensagem: string;
  data: string;
  lido: boolean;
}

/** GET /api/financeiro */
export type FinanceiroStatus = 'pago' | 'pendente' | 'atrasado' | 'cancelado';

export interface FinanceiroItemDto {
  id: number;
  cursoId: number;
  nomeCurso: string;
  status: FinanceiroStatus;
}

/** GET /api/calendario/eventos */
export interface EventoCalendarioDto {
  id: number;
  title: string;
  start: string;
  end?: string | null;
  backgroundColor?: string | null;
}

/** POST /api/tarefas/{conteudoId}/entregar */
export interface EntregarTarefaRequestDto {
  texto?: string | null;
  urlArquivo?: string | null;
}

export interface MensagemSimplesResponseDto {
  mensagem: string;
}

/** GET /api/tarefas/pendentes */
export interface TarefaPendenteFrontendDto {
  id: number;
  titulo: string;
  descricao: string;
  dataLimite: string;
  concluida: boolean;
}

/** GET /api/solicitacoes-academicas/meus-dados */
export interface DadosAlunoSolicitacaoDto {
  nome: string;
  email: string;
  dataSolicitacao: string;
}

/** GET /api/solicitacoes-academicas/tipos */
export interface TipoSolicitacaoDto {
  id: number;
  descricao: string;
}

/** POST /api/solicitacoes-academicas */
export interface SolicitacaoAcademicaRequestDto {
  tipoSolicitacaoId: number;
  descricao: string;
}

export interface SolicitacaoAcademicaResponseDto {
  id: number;
  mensagem: string;
}

