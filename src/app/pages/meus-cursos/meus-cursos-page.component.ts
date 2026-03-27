import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs';
import { CursoAlunoDto } from '../../core/models/aluno-area.models';
import { CursosAlunoService } from '../../core/services/cursos-aluno.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-meus-cursos-page',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './meus-cursos-page.component.html',
  styleUrl: './meus-cursos-page.component.css',
})
export class MeusCursosPageComponent implements OnInit {
  private readonly cursos = inject(CursosAlunoService);
  private readonly toast = inject(ToastrService);

  loading = true;
  lista: CursoAlunoDto[] = [];

  ngOnInit(): void {
    this.cursos
      .meusCursos()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (rows) => (this.lista = rows),
        error: (e: Error) => this.toast.error(e.message),
      });
  }

  acessar(_curso: CursoAlunoDto): void {
    this.toast.info('Abertura do curso será integrada na próxima etapa.');
  }
}
