import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs';
import { CursoListaFrontendItemDto } from '../../core/models/cursos-forum.models';
import { CursosService } from '../../core/services/cursos.service';
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
  private readonly cursos = inject(CursosService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastrService);

  loading = true;
  lista: CursoListaFrontendItemDto[] = [];

  ngOnInit(): void {
    this.cursos
      .listar()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (rows) => (this.lista = rows),
        error: (e: Error) => this.toast.error(e.message),
      });
  }

  acessar(curso: CursoListaFrontendItemDto): void {
    void this.router.navigate(['/home/cursos', curso.id]);
  }
}
