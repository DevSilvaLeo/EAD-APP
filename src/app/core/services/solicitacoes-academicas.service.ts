import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  DadosAlunoSolicitacaoDto,
  SolicitacaoAcademicaRequestDto,
  SolicitacaoAcademicaResponseDto,
  TipoSolicitacaoDto,
} from '../models/aluno-area.models';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class SolicitacoesAcademicasService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  private url(path: string): string {
    return `${environment.apiUrl}${path}`;
  }

  meusDados(): Observable<DadosAlunoSolicitacaoDto> {
    if (environment.useMock) {
      return of({
        nome: 'Aluno Demonstração',
        email: 'aluno@teste.com',
        dataSolicitacao: new Date().toISOString(),
      }).pipe(delay(300));
    }
    return this.http.get<DadosAlunoSolicitacaoDto>(this.url('/api/solicitacoes-academicas/meus-dados')).pipe(
      catchError((e: HttpErrorResponse) => throwError(() => new Error(this.auth.parseApiError(e)))),
    );
  }

  tipos(): Observable<TipoSolicitacaoDto[]> {
    if (environment.useMock) {
      return of([
        { id: 1, descricao: 'Declaração de matrícula' },
        { id: 2, descricao: 'Histórico parcial' },
        { id: 3, descricao: 'Reabertura de prazo' },
      ]).pipe(delay(300));
    }
    return this.http.get<TipoSolicitacaoDto[]>(this.url('/api/solicitacoes-academicas/tipos')).pipe(
      catchError((e: HttpErrorResponse) => throwError(() => new Error(this.auth.parseApiError(e)))),
    );
  }

  enviar(body: SolicitacaoAcademicaRequestDto): Observable<SolicitacaoAcademicaResponseDto> {
    if (environment.useMock) {
      return of({ id: 99, mensagem: 'Solicitação registrada com sucesso.' }).pipe(delay(500));
    }
    return this.http
      .post<SolicitacaoAcademicaResponseDto>(this.url('/api/solicitacoes-academicas'), body)
      .pipe(
        catchError((e: HttpErrorResponse) => throwError(() => new Error(this.auth.parseApiError(e)))),
      );
  }
}
