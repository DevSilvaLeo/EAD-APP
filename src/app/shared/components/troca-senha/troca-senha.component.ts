import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { loginPasswordValidator, matchFieldValidator } from '../../validators/password.validators';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-troca-senha',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './troca-senha.component.html',
  styleUrl: './troca-senha.component.css',
})
export class TrocaSenhaComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastrService);

  /** Se omitido, usa token de redefinição no sessionStorage. */
  @Input() tokenRedefinicao: string | null = null;
  @Output() concluido = new EventEmitter<void>();

  loading = false;

  form = this.fb.group({
    senha: ['', [Validators.required, loginPasswordValidator()]],
    senhaConfirmacao: ['', [Validators.required, matchFieldValidator('senha')]],
  });

  constructor() {
    this.form.get('senha')?.valueChanges.subscribe(() => {
      this.form.get('senhaConfirmacao')?.updateValueAndValidity({ emitEvent: false });
    });
  }

  enviar(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.toast.warning('Corrija os campos antes de continuar.');
      return;
    }
    const token = this.tokenRedefinicao ?? this.auth.getRedefinicaoToken();
    if (!token) {
      this.toast.error('Sessão de redefinição inválida. Refaça a validação do código.');
      return;
    }
    const { senha, senhaConfirmacao } = this.form.getRawValue();
    this.loading = true;
    this.auth
      .trocarSenha({
        senha: senha!,
        senhaConfirmacao: senhaConfirmacao!,
        token,
      })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          this.toast.success(res.mensagem);
          if (res.mensagem.toLowerCase().includes('sucesso')) {
            this.auth.clearRedefinicaoFlow();
            this.concluido.emit();
          }
        },
        error: (e: Error) => this.toast.error(e.message),
      });
  }
}
