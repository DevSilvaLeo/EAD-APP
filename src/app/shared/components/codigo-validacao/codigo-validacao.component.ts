import { Component, EventEmitter, Input, OnDestroy, Output, inject } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subscription, finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-codigo-validacao',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './codigo-validacao.component.html',
  styleUrl: './codigo-validacao.component.css',
})
export class CodigoValidacaoComponent implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastrService);

  @Input({ required: true }) chaveVerificacao: string | null = null;
  /** Fluxo para exibir ação de reenvio conforme API de primeiro acesso. */
  @Input() fluxoPrimeiroAcesso = false;
  @Output() validado = new EventEmitter<void>();
  @Output() voltarLogin = new EventEmitter<void>();

  loading = false;
  loadingReseta = false;

  digits = this.fb.array(
    Array.from({ length: 6 }, () =>
      this.fb.control<string | null>('', {
        validators: [Validators.required, Validators.pattern(/^\d$/)],
      }),
    ),
  );

  form = this.fb.group({
    digits: this.digits,
  });

  private subs = new Subscription();

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  onDigitInput(index: number, ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const v = input.value.replace(/\D/g, '').slice(-1);
    this.digits.at(index).setValue(v || '');
    if (v && index < 5) {
      this.focusInput(index + 1);
    }
  }

  onPaste(ev: ClipboardEvent, index: number): void {
    ev.preventDefault();
    const t = ev.clipboardData?.getData('text')?.replace(/\D/g, '') ?? '';
    if (t.length === 0) {
      return;
    }
    for (let i = 0; i < 6; i++) {
      this.digits.at(i).setValue(t[i] ?? '');
    }
    const last = Math.min(5, index + t.length - 1);
    this.focusInput(last);
  }

  onKeydown(index: number, ev: KeyboardEvent): void {
    if (ev.key === 'Backspace' && !this.digits.at(index).value && index > 0) {
      this.focusInput(index - 1);
    }
  }

  private focusInput(i: number): void {
    setTimeout(() => {
      const el = document.querySelector<HTMLInputElement>(`input[data-digit="${i}"]`);
      el?.focus();
    });
  }

  enviar(): void {
    const codigo = this.digits.controls.map((c) => c.value ?? '').join('');
    if (codigo.length !== 6) {
      this.toast.warning('Informe os 6 dígitos do código.');
      return;
    }
    const chave = this.chaveVerificacao ?? this.auth.getChaveVerificacao();
    if (!chave) {
      this.toast.error('Chave de verificação ausente. Reinicie o fluxo.');
      return;
    }

    this.loading = true;
    this.subs.add(
      this.auth
        .validarCodigo({ codigo, chaveVerificacao: chave })
        .pipe(finalize(() => (this.loading = false)))
        .subscribe({
          next: (res) => {
            if (res.token) {
              this.auth.setRedefinicaoToken(res.token);
              this.toast.success(res.mensagem || 'Código validado.');
              this.validado.emit();
            } else {
              this.toast.error(res.mensagem || 'Código inválido.');
            }
          },
          error: (e: Error) => this.toast.error(e.message),
        }),
    );
  }

  resetaPrimeiroAcesso(): void {
    const chave = this.chaveVerificacao ?? this.auth.getChaveVerificacao();
    const tokenAux = this.auth.getPrimeiroAcessoTokenAux();
    this.loadingReseta = true;
    this.subs.add(
      this.auth
        .resetaPrimeiroAcesso({ chaveVerificacao: chave, tokenAcesso: tokenAux })
        .pipe(finalize(() => (this.loadingReseta = false)))
        .subscribe({
          next: (res) => {
            if (res.token) {
              this.auth.setPrimeiroAcessoTokenAux(res.token);
            }
            this.toast.success(res.message);
            this.digits.reset();
          },
          error: (e: Error) => this.toast.error(e.message),
        }),
    );
  }
}
