import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  EntregarTarefaRequestDto,
  MensagemSimplesResponseDto,
  TarefaPendenteFrontendDto,
} from '../models/aluno-area.models';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class TarefasService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  private url(path: string): string {
    return `${environment.apiUrl}${path}`;
  }

  listarPendentes(): Observable<TarefaPendenteFrontendDto[]> {
    if (environment.useMock) {
      const limite = new Date();
      limite.setDate(limite.getDate() + 3);
      return of([
        {
          id: 1,
          titulo: 'Questionário — Unidade 2',
          descricao: 'Responder todas as questões com nota mínima 7.',
          dataLimite: limite.toISOString(),
          concluida: false,
        },
        {
          id: 2,
          titulo: 'Upload — Trabalho parcial',
          descricao: 'Enviar PDF com capa e referências.',
          dataLimite: new Date().toISOString(),
          concluida: false,
        },
      ]).pipe(delay(350));
    }
    return this.http.get<TarefaPendenteFrontendDto[]>(this.url('/api/tarefas/pendentes')).pipe(
      catchError((e: HttpErrorResponse) => throwError(() => new Error(this.auth.parseApiError(e)))),
    );
  }

  entregar(conteudoId: number, body: EntregarTarefaRequestDto): Observable<MensagemSimplesResponseDto> {
    if (environment.useMock) {
      return of({ mensagem: 'Entrega registrada com sucesso.' }).pipe(delay(400));
    }
    return this.http
      .post<MensagemSimplesResponseDto>(this.url(`/api/tarefas/${conteudoId}/entregar`), body)
      .pipe(
        catchError((e: HttpErrorResponse) => throwError(() => new Error(this.auth.parseApiError(e)))),
      );
  }
}
