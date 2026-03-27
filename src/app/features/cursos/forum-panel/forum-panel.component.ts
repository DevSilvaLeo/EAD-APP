import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DatePipe } from '@angular/common';
import { finalize } from 'rxjs';
import { ForumEntradaDto, ForumTipoRota } from '../../../core/models/cursos-forum.models';
import { AuthService } from '../../../core/services/auth.service';
import { ForumService } from '../../../core/services/forum.service';
import { ToastrService } from 'ngx-toastr';

/**
 * Fórum do curso (disciplina): todos podem perguntar e responder.
 * Fórum da aula (conteudo): todos podem abrir tópico; apenas administrador responde (resposta a entrada).
 */
@Component({
  selector: 'app-forum-panel',
  standalone: true,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './forum-panel.component.html',
  styleUrl: './forum-panel.component.css',
})
export class ForumPanelComponent implements OnChanges {
  private readonly forum = inject(ForumService);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastrService);
  readonly auth = inject(AuthService);

  @Input({ required: true }) tipo!: ForumTipoRota;
  @Input({ required: true }) referenciaId!: string;
  /** Se true (fórum por aula): só admin pode postar resposta a uma entrada existente. */
  @Input() respostasSomenteAdmin = false;
  @Output() atualizado = new EventEmitter<void>();

  loading = true;
  entradas: ForumEntradaDto[] = [];

  novaMensagem = this.fb.nonNullable.control('', [Validators.required, Validators.minLength(3)]);
  private readonly replyForms = new Map<string, FormControl<string>>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['referenciaId'] || changes['tipo']) {
      if (this.referenciaId) {
        this.carregar();
      }
    }
  }

  carregar(): void {
    this.loading = true;
    this.forum
      .getThread(this.tipo, this.referenciaId)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (t) => {
          this.entradas = t.entradas ?? [];
          this.replyForms.clear();
        },
        error: (e: Error) => this.toast.error(e.message),
      });
  }

  getReplyControl(entradaId: string): FormControl<string> {
    let c = this.replyForms.get(entradaId);
    if (!c) {
      c = this.fb.nonNullable.control('', [Validators.required, Validators.minLength(2)]);
      this.replyForms.set(entradaId, c);
    }
    return c;
  }

  podeResponderEntrada(): boolean {
    if (!this.respostasSomenteAdmin) {
      return true;
    }
    return this.auth.isAdministrador();
  }

  enviarNovoTopico(): void {
    if (this.novaMensagem.invalid) {
      return;
    }
    this.forum
      .post(this.tipo, this.referenciaId, { mensagem: this.novaMensagem.value.trim() })
      .subscribe({
        next: (r) => {
          this.toast.success(r.mensagem);
          this.novaMensagem.reset();
          this.carregar();
          this.atualizado.emit();
        },
        error: (e: Error) => this.toast.error(e.message),
      });
  }

  enviarResposta(entradaId: string): void {
    const ctrl = this.getReplyControl(entradaId);
    if (ctrl.invalid) {
      return;
    }
    if (this.respostasSomenteAdmin && !this.auth.isAdministrador()) {
      this.toast.warning('Apenas administradores podem responder neste fórum.');
      return;
    }
    this.forum
      .post(this.tipo, this.referenciaId, {
        mensagem: ctrl.value.trim(),
        parentEntradaId: entradaId,
      })
      .subscribe({
        next: (r) => {
          this.toast.success(r.mensagem);
          ctrl.reset();
          this.carregar();
          this.atualizado.emit();
        },
        error: (e: Error) => this.toast.error(e.message),
      });
  }
}
