import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { extractRoleFromPayload, parseJwtPayload } from '../utils/jwt';
import {
  EsqueciSenhaRequestDto,
  EsqueciSenhaResponseDto,
  LoginRequestDto,
  LoginResponseDto,
  PrimeiroAcessoRequestDto,
  PrimeiroAcessoResponseDto,
  RecuperarSenhaUnificadoRequestDto,
  ResetaPrimeiroAcessoRequestDto,
  ResetaPrimeiroAcessoResponseDto,
  TrocarSenhaRequestDto,
  TrocarSenhaResponseDto,
  ValidarCodigoRequestDto,
  ValidarCodigoResponseDto,
} from '../models/auth.models';

const LS_ACCESS = 'ead_access_token';
const SS_ROLE = 'ead_user_role';
const SS_CHAVE = 'ead_chave_verificacao';
const SS_REDEF = 'ead_redefinicao_token';
const SS_PRIMEIRO_TOKEN = 'ead_primeiro_acesso_token_aux';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  private authUrl(path: string): string {
    return `${environment.apiUrl}/api/auth${path}`;
  }

  /** Token JWT após login (Bearer). */
  getAccessToken(): string | null {
    return localStorage.getItem(LS_ACCESS);
  }

  setAccessToken(token: string | null): void {
    if (token) {
      localStorage.setItem(LS_ACCESS, token);
    } else {
      localStorage.removeItem(LS_ACCESS);
    }
  }

  logout(): void {
    localStorage.removeItem(LS_ACCESS);
    sessionStorage.removeItem(SS_ROLE);
  }

  /** Role do token (mock em sessionStorage ou claim `role` do JWT). */
  getRole(): string | null {
    return sessionStorage.getItem(SS_ROLE);
  }

  isAdministrador(): boolean {
    return this.getRole() === 'Administrador';
  }

  /** Após login real com JWT — não usar em fluxo mock (role já definido no mock). */
  applyRoleFromToken(token: string): void {
    if (environment.useMock) {
      return;
    }
    const payload = parseJwtPayload(token);
    const role = payload ? extractRoleFromPayload(payload) : null;
    if (role) {
      sessionStorage.setItem(SS_ROLE, role);
    } else {
      sessionStorage.removeItem(SS_ROLE);
    }
  }

  private setSessionRole(role: string): void {
    sessionStorage.setItem(SS_ROLE, role);
  }

  setChaveVerificacao(chave: string | null): void {
    if (chave) {
      sessionStorage.setItem(SS_CHAVE, chave);
    } else {
      sessionStorage.removeItem(SS_CHAVE);
    }
  }

  getChaveVerificacao(): string | null {
    return sessionStorage.getItem(SS_CHAVE);
  }

  /** Token retornado por validar-codigo, usado em trocar-senha. */
  setRedefinicaoToken(token: string | null): void {
    if (token) {
      sessionStorage.setItem(SS_REDEF, token);
    } else {
      sessionStorage.removeItem(SS_REDEF);
    }
  }

  getRedefinicaoToken(): string | null {
    return sessionStorage.getItem(SS_REDEF);
  }

  /** Token auxiliar do fluxo primeiro acesso (se a API retornar em reseta-primeiro-acesso). */
  setPrimeiroAcessoTokenAux(token: string | null): void {
    if (token) {
      sessionStorage.setItem(SS_PRIMEIRO_TOKEN, token);
    } else {
      sessionStorage.removeItem(SS_PRIMEIRO_TOKEN);
    }
  }

  getPrimeiroAcessoTokenAux(): string | null {
    return sessionStorage.getItem(SS_PRIMEIRO_TOKEN);
  }

  clearRedefinicaoFlow(): void {
    sessionStorage.removeItem(SS_CHAVE);
    sessionStorage.removeItem(SS_REDEF);
    sessionStorage.removeItem(SS_PRIMEIRO_TOKEN);
  }

  login(body: LoginRequestDto): Observable<LoginResponseDto> {
    if (environment.useMock) {
      return this.mockLogin(body);
    }
    return this.http
      .post<LoginResponseDto>(this.authUrl('/login'), body)
      .pipe(catchError((e) => this.mapHttp(e)));
  }

  esqueciSenha(body: EsqueciSenhaRequestDto): Observable<EsqueciSenhaResponseDto> {
    if (environment.useMock) {
      return this.mockEsqueciSenha(body);
    }
    return this.http
      .post<EsqueciSenhaResponseDto>(this.authUrl('/esqueci-senha'), body)
      .pipe(catchError((e) => this.mapHttp(e)));
  }

  primeiroAcesso(body: PrimeiroAcessoRequestDto): Observable<PrimeiroAcessoResponseDto> {
    if (environment.useMock) {
      return this.mockPrimeiroAcesso(body);
    }
    return this.http
      .post<PrimeiroAcessoResponseDto>(this.authUrl('/primeiro-acesso'), body)
      .pipe(catchError((e) => this.mapHttp(e)));
  }

  validarCodigo(body: ValidarCodigoRequestDto): Observable<ValidarCodigoResponseDto> {
    if (environment.useMock) {
      return this.mockValidarCodigo(body);
    }
    return this.http
      .post<ValidarCodigoResponseDto>(this.authUrl('/validar-codigo'), body)
      .pipe(catchError((e) => this.mapHttp(e)));
  }

  trocarSenha(body: TrocarSenhaRequestDto): Observable<TrocarSenhaResponseDto> {
    if (environment.useMock) {
      return this.mockTrocarSenha(body);
    }
    return this.http
      .post<TrocarSenhaResponseDto>(this.authUrl('/trocar-senha'), body)
      .pipe(catchError((e) => this.mapHttp(e)));
  }

  /** Fluxo unificado de recuperação (backend). Não usado nos mocks atuais. */
  recuperarSenha(body: RecuperarSenhaUnificadoRequestDto): Observable<TrocarSenhaResponseDto> {
    if (environment.useMock) {
      return of({ mensagem: 'Senha alterada com sucesso.' }).pipe(delay(400));
    }
    return this.http
      .post<TrocarSenhaResponseDto>(this.authUrl('/recuperar-senha'), body)
      .pipe(catchError((e) => this.mapHttp(e)));
  }

  resetaPrimeiroAcesso(
    body: ResetaPrimeiroAcessoRequestDto,
  ): Observable<ResetaPrimeiroAcessoResponseDto> {
    if (environment.useMock) {
      return this.mockResetaPrimeiroAcesso(body);
    }
    return this.http
      .post<ResetaPrimeiroAcessoResponseDto>(this.authUrl('/reseta-primeiro-acesso'), body)
      .pipe(catchError((e) => this.mapHttp(e)));
  }

  private mapHttp(err: HttpErrorResponse): Observable<never> {
    const msg = this.parseApiError(err);
    return throwError(() => new Error(msg));
  }

  parseApiError(err: HttpErrorResponse): string {
    const b = err.error;
    if (typeof b === 'string' && b.length) {
      return b;
    }
    if (b && typeof b === 'object') {
      const d = b as {
        detalhe?: string;
        titulo?: string;
        erros?: Record<string, string[]>;
      };
      if (d.detalhe) {
        return d.detalhe;
      }
      if (d.erros) {
        const first = Object.values(d.erros)[0];
        if (first?.length) {
          return first[0];
        }
      }
      if (d.titulo) {
        return d.titulo;
      }
    }
    return err.message || 'Erro ao comunicar com o servidor.';
  }

  // --- Mocks (cenários de demonstração) ---

  private mockLogin(body: LoginRequestDto): Observable<LoginResponseDto> {
    const email = (body.email || '').trim().toLowerCase();
    const pwd = body.senha || '';
    const strong =
      pwd.length >= 8 &&
      pwd.length <= 13 &&
      /[A-Z]/.test(pwd) &&
      /[a-z]/.test(pwd) &&
      /\d/.test(pwd) &&
      /[!@#$%]/.test(pwd);

    if (!strong) {
      return of({
        token: null,
        dataHoraAcesso: null,
        mensagem: 'Senha inválida conforme regras de segurança.',
      }).pipe(delay(400));
    }

    if (email === 'pendente@teste.com') {
      return of({
        token: null,
        dataHoraAcesso: null,
        mensagem: 'Primeiro acesso pendente. Conclua o cadastro em Primeiro acesso.',
      }).pipe(delay(400));
    }

    if (email === 'aluno@teste.com' && pwd === 'Senha@123') {
      return of({
        token: 'mock-jwt-access-token',
        dataHoraAcesso: new Date().toISOString(),
        mensagem: 'Acesso concedido',
      }).pipe(
        tap(() => this.setSessionRole('Aluno')),
        delay(400),
      );
    }

    if (email === 'admin@teste.com' && pwd === 'Senha@123') {
      return of({
        token: 'mock-jwt-access-token-admin',
        dataHoraAcesso: new Date().toISOString(),
        mensagem: 'Acesso concedido (administrador)',
      }).pipe(
        tap(() => this.setSessionRole('Administrador')),
        delay(400),
      );
    }

    return of({
      token: null,
      dataHoraAcesso: null,
      mensagem: 'Credenciais inválidas.',
    }).pipe(delay(400));
  }

  private mockEsqueciSenha(body: EsqueciSenhaRequestDto): Observable<EsqueciSenhaResponseDto> {
    const email = (body.email || '').trim();
    const cpf = (body.cpf || '').replace(/\D/g, '');
    if (!email && !cpf) {
      return of({
        mensagem: 'Informe e-mail ou CPF.',
        chaveVerificacao: null,
      }).pipe(delay(400));
    }
    return of({
      mensagem: 'Se os dados existirem, você receberá um código por e-mail.',
      chaveVerificacao: 'mock-chave-esqueci-001',
    }).pipe(delay(500));
  }

  private mockPrimeiroAcesso(body: PrimeiroAcessoRequestDto): Observable<PrimeiroAcessoResponseDto> {
    const cpf = (body.cpf || '').replace(/\D/g, '');
    if (cpf.length !== 11) {
      return of({
        mensagem: 'CPF inválido.',
        chaveVerificacao: null,
      }).pipe(delay(400));
    }
    if (cpf === '11111111111') {
      return of({
        mensagem:
          'Este CPF já possui senha cadastrada. Utilize a opção "Esqueci minha senha" na tela de login.',
        chaveVerificacao: null,
      }).pipe(delay(400));
    }
    return of({
      mensagem: 'Código enviado para o e-mail cadastrado.',
      chaveVerificacao: 'mock-chave-primeiro-002',
    }).pipe(delay(500));
  }

  private mockValidarCodigo(body: ValidarCodigoRequestDto): Observable<ValidarCodigoResponseDto> {
    const c = (body.codigo || '').replace(/\D/g, '');
    if (c === '123456') {
      return of({
        token: 'mock-jwt-redefinicao-token',
        mensagem: 'Código validado.',
      }).pipe(delay(400));
    }
    if (c === '000000') {
      return of({
        token: '',
        mensagem: 'Código expirado. Solicite um novo código.',
      }).pipe(delay(400));
    }
    return of({
      token: '',
      mensagem: 'Código inválido.',
    }).pipe(delay(400));
  }

  private mockTrocarSenha(body: TrocarSenhaRequestDto): Observable<TrocarSenhaResponseDto> {
    if (!body.token) {
      return of({ mensagem: 'Token de redefinição ausente ou inválido.' }).pipe(delay(300));
    }
    if (body.senha !== body.senhaConfirmacao) {
      return of({ mensagem: 'As senhas não coincidem.' }).pipe(delay(300));
    }
    return of({ mensagem: 'Senha alterada com sucesso.' }).pipe(delay(400));
  }

  private mockResetaPrimeiroAcesso(
    _body: ResetaPrimeiroAcessoRequestDto,
  ): Observable<ResetaPrimeiroAcessoResponseDto> {
    return of({
      statusCodeResponse: 200,
      message: 'Novo código enviado. Verifique seu e-mail.',
      token: null,
    }).pipe(delay(500));
  }
}
