import { DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { TipoSolicitacaoDto } from '../../core/models/aluno-area.models';
import { SolicitacoesAcademicasService } from '../../core/services/solicitacoes-academicas.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-solicitacoes-academicas-page',
  standalone: true,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './solicitacoes-academicas-page.component.html',
  styleUrl: './solicitacoes-academicas-page.component.css',
})
export class SolicitacoesAcademicasPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly solic = inject(SolicitacoesAcademicasService);
  private readonly toast = inject(ToastrService);

  loading = true;
  enviando = false;
  tipos: TipoSolicitacaoDto[] = [];

  nomeAluno = '';
  emailAluno = '';
  dataSolicitacao: string | null = null;

  form = this.fb.nonNullable.group({
    tipoSolicitacaoId: [null as number | null, Validators.required],
    descricao: ['', [Validators.required, Validators.minLength(10)]],
  });

  ngOnInit(): void {
    forkJoin({
      dados: this.solic.meusDados().pipe(catchError(() => of(null))),
      tipos: this.solic.tipos(),
    })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: ({ dados, tipos: t }) => {
          this.tipos = t;
          if (dados) {
            this.nomeAluno = dados.nome;
            this.emailAluno = dados.email;
            this.dataSolicitacao = dados.dataSolicitacao;
          }
        },
        error: (e: Error) => this.toast.error(e.message),
      });
  }

  enviar(): void {
    this.form.markAllAsTouched();
    const tipoId = this.form.controls.tipoSolicitacaoId.value;
    if (this.form.invalid || tipoId == null) {
      this.toast.warning('Preencha o tipo e a descrição (mín. 10 caracteres).');
      return;
    }
    this.enviando = true;
    this.solic
      .enviar({
        tipoSolicitacaoId: tipoId,
        descricao: this.form.controls.descricao.value.trim(),
      })
      .pipe(finalize(() => (this.enviando = false)))
      .subscribe({
        next: (res) => {
          this.toast.success(res.mensagem);
          this.form.reset({ tipoSolicitacaoId: null, descricao: '' });
        },
        error: (e: Error) => this.toast.error(e.message),
      });
  }
}
