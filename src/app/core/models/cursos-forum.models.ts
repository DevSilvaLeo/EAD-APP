/** GET /api/cursos */
export interface CursoListaFrontendItemDto {
  id: string;
  nome: string;
  percentualConcluido: number;
}

/** GET /api/cursos/{id} */
export interface CursoDetalheFrontendDto {
  id: string;
  nome: string;
  percentualConcluidoGeral: number;
  sequencial: boolean;
  aulas: AulaFrontendDto[];
}

/** Tipos de aula — alinhar com o backend (case-insensitive no front). */
export type AulaTipoFrontend = 'video' | 'leitura' | 'slides' | 'tarefa' | string;

export interface AulaFrontendDto {
  id: string;
  titulo: string;
  tipo: AulaTipoFrontend;
  urlVideo?: string | null;
  urlSlides?: string | null;
  conteudoTexto?: string | null;
  ordem: number;
  concluida: boolean;
  percentualConcluido: number;
  duracaoSegundos?: number | null;
  /** Opcional — agrupamento visual (ex.: “Profetas Maiores”). */
  modulo?: string | null;
}

/** Calculado no front para UI (sequência). */
export interface AulaComBloqueio extends AulaFrontendDto {
  bloqueada: boolean;
}

/** POST conclusões */
export interface ForumPostRequestDto {
  mensagem: string;
  parentEntradaId?: string | null;
}

export interface ForumRespostaDto {
  id: string;
  mensagem: string;
  criadoEm: string;
  alunoId?: number;
}

export interface ForumEntradaDto {
  id: string;
  alunoId: number;
  mensagem: string;
  criadoEm: string;
  respostas: ForumRespostaDto[];
}

export interface ForumThreadResponseDto {
  id: string;
  tipo: string;
  referenciaId: string;
  entradas: ForumEntradaDto[];
}

export type ForumTipoRota = 'disciplina' | 'conteudo';
