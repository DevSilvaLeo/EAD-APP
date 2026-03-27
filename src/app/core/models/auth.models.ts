/** Propriedades em camelCase — alinhado ao JSON padrão do ASP.NET Core (System.Text.Json). */

/** POST /api/auth/login */
export interface LoginRequestDto {
  email: string;
  senha: string;
}

export interface LoginResponseDto {
  token: string | null;
  dataHoraAcesso: string | null;
  mensagem: string;
}

/** POST /api/auth/esqueci-senha */
export interface EsqueciSenhaRequestDto {
  email?: string | null;
  cpf?: string | null;
}

export interface EsqueciSenhaResponseDto {
  mensagem: string;
  chaveVerificacao?: string | null;
}

/** POST /api/auth/primeiro-acesso */
export interface PrimeiroAcessoRequestDto {
  cpf: string;
}

export interface PrimeiroAcessoResponseDto {
  mensagem: string;
  chaveVerificacao?: string | null;
}

/** POST /api/auth/validar-codigo */
export interface ValidarCodigoRequestDto {
  codigo: string;
  chaveVerificacao?: string | null;
}

export interface ValidarCodigoResponseDto {
  token: string;
  mensagem: string;
}

/** POST /api/auth/trocar-senha */
export interface TrocarSenhaRequestDto {
  senha: string;
  senhaConfirmacao: string;
  token: string;
}

export interface TrocarSenhaResponseDto {
  mensagem: string;
}

/** POST /api/auth/recuperar-senha (fluxo unificado) */
export interface RecuperarSenhaUnificadoRequestDto {
  recuperaSenhaToken?: string | null;
  code?: string | null;
  novaSenha?: string | null;
}

/** POST /api/auth/reseta-primeiro-acesso */
export interface ResetaPrimeiroAcessoRequestDto {
  chaveVerificacao?: string | null;
  tokenAcesso?: string | null;
}

export interface ResetaPrimeiroAcessoResponseDto {
  statusCodeResponse: number;
  message: string;
  token?: string | null;
}

/** Erro padrão do middleware */
export interface ApiErrorBody {
  titulo?: string;
  detalhe?: string;
  erros?: Record<string, string[]>;
}
