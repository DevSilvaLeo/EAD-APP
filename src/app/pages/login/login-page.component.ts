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
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';
import { loginPasswordValidator } from '../../shared/validators/password.validators';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login-page',
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
  ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css',
})
export class LoginPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastrService);

  loading = false;

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, loginPasswordValidator()]],
  });

  entrar(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.toast.warning('Preencha o formulário corretamente.');
      return;
    }
    const { email, senha } = this.form.getRawValue();
    this.loading = true;
    this.auth
      .login({ email, senha })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          if (res.token) {
            this.auth.setAccessToken(res.token);
            if (!environment.useMock) {
              this.auth.applyRoleFromToken(res.token);
            }
            this.toast.success(res.mensagem || 'Acesso concedido');
            void this.router.navigate(['/home/dashboard']);
          } else {
            this.toast.error(res.mensagem || 'Falha no login.');
          }
        },
        error: (e: Error) => this.toast.error(e.message),
      });
  }
}
