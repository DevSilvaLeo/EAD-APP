import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs';
import { FinanceiroItemDto, FinanceiroStatus } from '../../core/models/aluno-area.models';
import { FinanceiroService } from '../../core/services/financeiro.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-financeiro-page',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './financeiro-page.component.html',
  styleUrl: './financeiro-page.component.css',
})
export class FinanceiroPageComponent implements OnInit {
  private readonly financeiro = inject(FinanceiroService);
  private readonly toast = inject(ToastrService);

  loading = true;
  lista: FinanceiroItemDto[] = [];

  ngOnInit(): void {
    this.financeiro
      .listar()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (rows) => (this.lista = rows),
        error: (e: Error) => this.toast.error(e.message),
      });
  }

  labelStatus(s: FinanceiroStatus): string {
    const map: Record<FinanceiroStatus, string> = {
      pago: 'Pago',
      pendente: 'Pendente',
      atrasado: 'Atrasado',
      cancelado: 'Cancelado',
    };
    return map[s] ?? s;
  }

  classeStatus(s: FinanceiroStatus): string {
    return `fin-status fin-status--${s}`;
  }

  acessar(_item: FinanceiroItemDto): void {
    this.toast.info('Portal financeiro será integrado na próxima etapa.');
  }
}
