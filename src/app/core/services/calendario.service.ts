import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { EventoCalendarioDto } from '../models/aluno-area.models';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class CalendarioService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  private url(path: string): string {
    return `${environment.apiUrl}${path}`;
  }

  listarEventos(): Observable<EventoCalendarioDto[]> {
    if (environment.useMock) {
      const start = new Date();
      const end = new Date(start);
      end.setHours(end.getHours() + 2);
      return of([
        {
          id: 1,
          title: 'Live — Dúvidas do módulo 1',
          start: start.toISOString(),
          end: end.toISOString(),
          backgroundColor: '#1565c0',
        },
        {
          id: 2,
          title: 'Entrega de atividade',
          start: new Date(start.getTime() + 86400000).toISOString(),
          end: null,
          backgroundColor: '#5c6bc0',
        },
      ]).pipe(delay(300));
    }
    return this.http.get<EventoCalendarioDto[]>(this.url('/api/calendario/eventos')).pipe(
      catchError((e: HttpErrorResponse) => throwError(() => new Error(this.auth.parseApiError(e)))),
    );
  }
}
