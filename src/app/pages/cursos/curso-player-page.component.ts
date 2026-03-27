import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { CursoDetalheFrontendDto } from '../../core/models/cursos-forum.models';
import { CursosService } from '../../core/services/cursos.service';
import { CursoPlayerComponent } from '../../features/cursos/curso-player/curso-player.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-curso-player-page',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    CursoPlayerComponent,
  ],
  templateUrl: './curso-player-page.component.html',
  styleUrl: './curso-player-page.component.css',
})
export class CursoPlayerPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly cursos = inject(CursosService);
  private readonly toast = inject(ToastrService);

  loading = true;
  erro: string | null = null;
  curso: CursoDetalheFrontendDto | null = null;

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    const id = this.route.snapshot.paramMap.get('cursoId');
    if (!id) {
      this.erro = 'Identificador do curso inválido.';
      this.loading = false;
      return;
    }
    this.loading = true;
    this.erro = null;
    this.cursos
      .getById(id)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (c) => (this.curso = c),
        error: (e: Error) => {
          this.erro = e.message;
          this.toast.error(e.message);
        },
      });
  }
}
