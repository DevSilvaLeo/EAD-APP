import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { CodigoValidacaoComponent } from '../../shared/components/codigo-validacao/codigo-validacao.component';
import { TrocaSenhaComponent } from '../../shared/components/troca-senha/troca-senha.component';
import { cpfSomenteValidator } from '../../shared/validators/email-cpf.validators';
import { ToastrService } from 'ngx-toastr';

type PaStep = 'cpf' | 'codigo' | 'senha';

@Component({
  selector: 'app-primeiro-acesso-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    CodigoValidacaoComponent,
    TrocaSenhaComponent,
  ],
  templateUrl: './primeiro-acesso-page.component.html',
  styleUrl: './primeiro-acesso-page.component.css',
})
export class PrimeiroAcessoPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastrService);

  step: PaStep = 'cpf';
  loading = false;
  chaveVerificacao: string | null = null;

  form = this.fb.nonNullable.group({
    cpf: ['', [Validators.required, cpfSomenteValidator()]],
  });

  enviar(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.toast.warning('Informe um CPF válido com 11 dígitos.');
      return;
    }
    const cpf = this.form.controls.cpf.value.replace(/\D/g, '');
    this.loading = true;
    this.auth
      .primeiroAcesso({ cpf })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          this.toast.info(res.mensagem);
          if (res.chaveVerificacao) {
            this.chaveVerificacao = res.chaveVerificacao;
            this.auth.setChaveVerificacao(res.chaveVerificacao);
            this.step = 'codigo';
          }
        },
        error: (e: Error) => this.toast.error(e.message),
      });
  }

  onCodigoValidado(): void {
    this.step = 'senha';
  }

  onTrocaConcluida(): void {
    void this.router.navigate(['/login']);
  }

  voltarLogin(): void {
    void this.router.navigate(['/login']);
  }
}
