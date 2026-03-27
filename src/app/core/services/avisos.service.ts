import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AvisoDto } from '../models/aluno-area.models';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AvisosService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  private url(path: string): string {
    return `${environment.apiUrl}${path}`;
  }

  listar(): Observable<AvisoDto[]> {
    if (environment.useMock) {
      return of([
        {
          id: 1,
          titulo: 'Boas-vindas',
          mensagem: 'Bem-vindo à plataforma EAD.',
          data: new Date().toISOString(),
          lido: false,
        },
        {
          id: 2,
          titulo: 'Prova agendada',
          mensagem: 'Não esqueça da avaliação do módulo 2.',
          data: new Date().toISOString(),
          lido: true,
        },
      ]).pipe(delay(350));
    }
    return this.http.get<AvisoDto[]>(this.url('/api/avisos')).pipe(
      catchError((e: HttpErrorResponse) => throwError(() => new Error(this.auth.parseApiError(e)))),
    );
  }
}
