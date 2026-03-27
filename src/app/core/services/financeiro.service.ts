import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { FinanceiroItemDto } from '../models/aluno-area.models';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class FinanceiroService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  private url(path: string): string {
    return `${environment.apiUrl}${path}`;
  }

  listar(): Observable<FinanceiroItemDto[]> {
    if (environment.useMock) {
      const mock: FinanceiroItemDto[] = [
        { id: 1, cursoId: 10, nomeCurso: 'Introdução ao Direito', status: 'pago' },
        { id: 2, cursoId: 11, nomeCurso: 'Metodologia da Pesquisa', status: 'pendente' },
        { id: 3, cursoId: 12, nomeCurso: 'Ética Profissional', status: 'atrasado' },
        { id: 4, cursoId: 13, nomeCurso: 'Curso cancelado (exemplo)', status: 'cancelado' },
      ];
      return of(mock).pipe(delay(350));
    }
    return this.http.get<FinanceiroItemDto[]>(this.url('/api/financeiro')).pipe(
      catchError((e: HttpErrorResponse) => throwError(() => new Error(this.auth.parseApiError(e)))),
    );
  }
}
