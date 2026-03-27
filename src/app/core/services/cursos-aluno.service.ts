import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { CursoAlunoDto } from '../models/aluno-area.models';
import { AuthService } from './auth.service';

/**
 * Lista de cursos do aluno (percentual concluído).
 * Path proposto: GET /api/cursos/meus — confirmar no backend.
 */
@Injectable({ providedIn: 'root' })
export class CursosAlunoService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  private url(path: string): string {
    return `${environment.apiUrl}${path}`;
  }

  meusCursos(): Observable<CursoAlunoDto[]> {
    if (environment.useMock) {
      return of([
        { id: 1, nomeCurso: 'Introdução ao Direito', percentualConcluido: 100 },
        { id: 2, nomeCurso: 'Metodologia da Pesquisa', percentualConcluido: 45 },
        { id: 3, nomeCurso: 'Ética Profissional', percentualConcluido: 0 },
      ]).pipe(delay(350));
    }
    return this.http.get<CursoAlunoDto[]>(this.url('/api/cursos/meus')).pipe(
      catchError((e: HttpErrorResponse) => throwError(() => new Error(this.auth.parseApiError(e)))),
    );
  }
}
