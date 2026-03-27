import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  CursoDetalheFrontendDto,
  CursoListaFrontendItemDto,
} from '../models/cursos-forum.models';
import { MensagemSimplesResponseDto } from '../models/aluno-area.models';
import { AuthService } from './auth.service';

const C1 = 'a1111111-1111-1111-1111-111111111111';
const C2 = 'b2222222-2222-2222-2222-222222222222';
const C3 = 'c3333333-3333-3333-3333-333333333333';

@Injectable({ providedIn: 'root' })
export class CursosService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  private url(path: string): string {
    return `${environment.apiUrl}${path}`;
  }

  /** GET /api/cursos */
  listar(): Observable<CursoListaFrontendItemDto[]> {
    if (environment.useMock) {
      return of([
        { id: C1, nome: 'Introdução ao Direito', percentualConcluido: 100 },
        { id: C2, nome: 'Profetas Maiores', percentualConcluido: 30 },
        { id: C3, nome: 'Ética Profissional', percentualConcluido: 0 },
      ]).pipe(delay(350));
    }
    return this.http.get<CursoListaFrontendItemDto[]>(this.url('/api/cursos')).pipe(
      catchError((e: HttpErrorResponse) => throwError(() => new Error(this.auth.parseApiError(e)))),
    );
  }

  /** GET /api/cursos/{id} */
  getById(id: string): Observable<CursoDetalheFrontendDto> {
    if (environment.useMock) {
      const det = mockDetalhes[id];
      if (!det) {
        return throwError(() => new Error('Curso não encontrado.'));
      }
      return of(JSON.parse(JSON.stringify(det)) as CursoDetalheFrontendDto).pipe(delay(400));
    }
    return this.http.get<CursoDetalheFrontendDto>(this.url(`/api/cursos/${encodeURIComponent(id)}`)).pipe(
      catchError((e: HttpErrorResponse) => throwError(() => new Error(this.auth.parseApiError(e)))),
    );
  }

  /** POST /api/cursos/{cursoId}/aulas/{aulaId}/concluir */
  concluirAula(cursoId: string, aulaId: string): Observable<MensagemSimplesResponseDto> {
    if (environment.useMock) {
      const curso = mockDetalhes[cursoId];
      const aula = curso?.aulas.find((a) => a.id === aulaId);
      if (aula) {
        aula.concluida = true;
        aula.percentualConcluido = 100;
        atualizarPercentualGeralCurso(curso);
      }
      return of({ mensagem: 'Aula marcada como concluída.' }).pipe(delay(400));
    }
    return this.http
      .post<MensagemSimplesResponseDto>(
        this.url(`/api/cursos/${encodeURIComponent(cursoId)}/aulas/${encodeURIComponent(aulaId)}/concluir`),
        {},
      )
      .pipe(catchError((e: HttpErrorResponse) => throwError(() => new Error(this.auth.parseApiError(e)))));
  }

  /** POST /api/cursos/{cursoId}/conteudos/{conteudoId}/concluir */
  concluirConteudo(cursoId: string, conteudoId: string): Observable<MensagemSimplesResponseDto> {
    if (environment.useMock) {
      return of({ mensagem: 'Conteúdo marcado como concluído.' }).pipe(delay(400));
    }
    return this.http
      .post<MensagemSimplesResponseDto>(
        this.url(
          `/api/cursos/${encodeURIComponent(cursoId)}/conteudos/${encodeURIComponent(conteudoId)}/concluir`,
        ),
        {},
      )
      .pipe(catchError((e: HttpErrorResponse) => throwError(() => new Error(this.auth.parseApiError(e)))));
  }
}

const mockDetalhes: Record<string, CursoDetalheFrontendDto> = {
  [C1]: {
    id: C1,
    nome: 'Introdução ao Direito',
    percentualConcluidoGeral: 100,
    sequencial: true,
    aulas: [
      {
        id: 'a1-0001-0001-0001-000000000001',
        titulo: 'Boas-vindas',
        tipo: 'video',
        urlVideo: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
        ordem: 1,
        concluida: true,
        percentualConcluido: 100,
        duracaoSegundos: 120,
        modulo: 'Módulo inicial',
      },
      {
        id: 'a1-0001-0001-0001-000000000002',
        titulo: 'Leitura complementar',
        tipo: 'leitura',
        conteudoTexto:
          'Texto de apoio da disciplina. Leia com atenção antes de avançar para a próxima aula.',
        ordem: 2,
        concluida: true,
        percentualConcluido: 100,
        modulo: 'Módulo inicial',
      },
    ],
  },
  [C2]: {
    id: C2,
    nome: 'Profetas Maiores',
    percentualConcluidoGeral: 30,
    sequencial: true,
    aulas: [
      {
        id: 'a2-0002-0002-0002-000000000001',
        titulo: 'Introdução aos Profetas Maiores',
        tipo: 'video',
        urlVideo: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
        ordem: 1,
        concluida: true,
        percentualConcluido: 100,
        duracaoSegundos: 600,
        modulo: 'Profetas Maiores',
      },
      {
        id: 'a2-0002-0002-0002-000000000002',
        titulo: 'Slides — contexto histórico',
        tipo: 'slides',
        urlSlides:
          'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        ordem: 2,
        concluida: false,
        percentualConcluido: 40,
        modulo: 'Profetas Maiores',
      },
      {
        id: 'a2-0002-0002-0002-000000000003',
        titulo: 'Tarefa — resumo escrito',
        tipo: 'tarefa',
        conteudoTexto: 'Elabore um resumo de 1 página sobre o primeiro profeta estudado.',
        ordem: 3,
        concluida: false,
        percentualConcluido: 0,
        modulo: 'Profetas Maiores',
      },
      {
        id: 'a2-0002-0002-0002-000000000004',
        titulo: 'Aula 4 — Profecia e povo',
        tipo: 'video',
        urlVideo: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
        ordem: 4,
        concluida: false,
        percentualConcluido: 0,
        duracaoSegundos: 900,
        modulo: 'Profetas Maiores',
      },
    ],
  },
  [C3]: {
    id: C3,
    nome: 'Ética Profissional',
    percentualConcluidoGeral: 0,
    sequencial: false,
    aulas: [
      {
        id: 'a3-0003-0003-0003-000000000001',
        titulo: 'Ética e conduta',
        tipo: 'video',
        urlVideo: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
        ordem: 1,
        concluida: false,
        percentualConcluido: 0,
        modulo: 'Fundamentos',
      },
    ],
  },
};

function atualizarPercentualGeralCurso(curso: CursoDetalheFrontendDto): void {
  const aulas = curso.aulas;
  if (!aulas.length) {
    curso.percentualConcluidoGeral = 0;
    return;
  }
  const sum = aulas.reduce((s, a) => s + a.percentualConcluido, 0);
  curso.percentualConcluidoGeral = Math.round(sum / aulas.length);
}
