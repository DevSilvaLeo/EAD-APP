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
import { emailOuCpfValidator } from '../../shared/validators/email-cpf.validators';
import { ToastrService } from 'ngx-toastr';

type EsqueciStep = 'email' | 'codigo' | 'senha';

@Component({
  selector: 'app-esqueci-senha-page',
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
  templateUrl: './esqueci-senha-page.component.html',
  styleUrl: './esqueci-senha-page.component.css',
})
export class EsqueciSenhaPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastrService);

  step: EsqueciStep = 'email';
  loading = false;
  chaveVerificacao: string | null = null;

  form = this.fb.nonNullable.group({
    identificador: ['', [Validators.required, emailOuCpfValidator()]],
  });

  enviar(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.toast.warning('Informe um e-mail válido ou CPF com 11 dígitos.');
      return;
    }
    const raw = this.form.controls.identificador.value.trim();
    const digits = raw.replace(/\D/g, '');
    const body = raw.includes('@')
      ? { email: raw, cpf: null as string | null }
      : { email: null, cpf: digits };

    this.loading = true;
    this.auth
      .esqueciSenha(body)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          this.toast.success(res.mensagem);
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
