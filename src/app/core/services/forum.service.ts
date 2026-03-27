import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  ForumPostRequestDto,
  ForumThreadResponseDto,
  ForumTipoRota,
} from '../models/cursos-forum.models';

function randomId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
import { MensagemSimplesResponseDto } from '../models/aluno-area.models';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ForumService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  private readonly mockThreads = new Map<string, ForumThreadResponseDto>();

  private url(tipo: ForumTipoRota, id: string): string {
    const t = tipo.toLowerCase();
    return `${environment.apiUrl}/api/forum/${encodeURIComponent(t)}/${encodeURIComponent(id)}`;
  }

  private key(tipo: ForumTipoRota, id: string): string {
    return `${tipo}:${id}`;
  }

  /** GET /api/forum/{tipo}/{id} */
  getThread(tipo: ForumTipoRota, referenciaId: string): Observable<ForumThreadResponseDto> {
    if (environment.useMock) {
      const k = this.key(tipo, referenciaId);
      let thread = this.mockThreads.get(k);
      if (!thread) {
        thread = {
          id: `forum-${k}`,
          tipo,
          referenciaId,
          entradas: [],
        };
        this.mockThreads.set(k, thread);
      }
      return of(JSON.parse(JSON.stringify(thread)) as ForumThreadResponseDto).pipe(delay(250));
    }
    return this.http.get<ForumThreadResponseDto>(this.url(tipo, referenciaId)).pipe(
      catchError((e: HttpErrorResponse) => throwError(() => new Error(this.auth.parseApiError(e)))),
    );
  }

  /** POST /api/forum/{tipo}/{id} */
  post(
    tipo: ForumTipoRota,
    referenciaId: string,
    body: ForumPostRequestDto,
  ): Observable<MensagemSimplesResponseDto> {
    if (environment.useMock) {
      const k = this.key(tipo, referenciaId);
      let thread = this.mockThreads.get(k);
      if (!thread) {
        thread = { id: `forum-${k}`, tipo, referenciaId, entradas: [] };
        this.mockThreads.set(k, thread);
      }
      const now = new Date().toISOString();
      if (body.parentEntradaId) {
        const parent = thread.entradas.find((e) => e.id === body.parentEntradaId);
        if (parent) {
          parent.respostas.push({
            id: randomId(),
            mensagem: body.mensagem,
            criadoEm: now,
            alunoId: 0,
          });
        }
      } else {
        thread.entradas.push({
          id: randomId(),
          alunoId: 1,
          mensagem: body.mensagem,
          criadoEm: now,
          respostas: [],
        });
      }
      return of({ mensagem: 'Mensagem publicada.' }).pipe(delay(350));
    }
    return this.http
      .post<MensagemSimplesResponseDto>(this.url(tipo, referenciaId), body)
      .pipe(catchError((e: HttpErrorResponse) => throwError(() => new Error(this.auth.parseApiError(e)))));
  }
}
