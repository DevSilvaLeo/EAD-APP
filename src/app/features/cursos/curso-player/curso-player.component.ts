import { DatePipe } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
  inject,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterLink } from '@angular/router';
import {
  AulaComBloqueio,
  AulaFrontendDto,
  CursoDetalheFrontendDto,
} from '../../../core/models/cursos-forum.models';
import { CursosService } from '../../../core/services/cursos.service';
import { VideoPlaybackService } from '../../../core/services/video-playback.service';
import { ForumPanelComponent } from '../forum-panel/forum-panel.component';
import { ToastrService } from 'ngx-toastr';

export function aplicarBloqueio(
  aulas: AulaFrontendDto[],
  sequencial: boolean,
): AulaComBloqueio[] {
  const sorted = [...aulas].sort((a, b) => a.ordem - b.ordem);
  if (!sequencial) {
    return sorted.map((a) => ({ ...a, bloqueada: false }));
  }
  return sorted.map((a, i) => ({
    ...a,
    bloqueada: i > 0 && !sorted[i - 1].concluida,
  }));
}

@Component({
  selector: 'app-curso-player',
  standalone: true,
  imports: [
    DatePipe,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressBarModule,
    MatExpansionModule,
    ForumPanelComponent,
  ],
  templateUrl: './curso-player.component.html',
  styleUrl: './curso-player.component.css',
})
export class CursoPlayerComponent implements OnChanges, AfterViewInit {
  private readonly cursos = inject(CursosService);
  private readonly toast = inject(ToastrService);
  private readonly videoPlayback = inject(VideoPlaybackService);
  private readonly sanitizer = inject(DomSanitizer);

  @Input({ required: true }) curso!: CursoDetalheFrontendDto;
  @Output() atualizado = new EventEmitter<void>();

  @ViewChild('videoEl') private videoRef?: ElementRef<HTMLVideoElement>;

  aulasView: AulaComBloqueio[] = [];
  selected: AulaComBloqueio | null = null;
  marcando = false;
  private blobVideoUrl: string | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['curso'] && this.curso) {
      this.rebuildState();
    }
  }

  ngAfterViewInit(): void {
    this.refreshVideo();
  }

  private rebuildState(): void {
    this.aulasView = aplicarBloqueio(this.curso.aulas, this.curso.sequencial);
    const keep =
      this.selected && this.aulasView.some((a) => a.id === this.selected!.id)
        ? this.selected!.id
        : null;
    this.selected =
      (keep ? this.aulasView.find((a) => a.id === keep) : null) ??
      this.aulasView.find((a) => !a.bloqueada) ??
      null;
    queueMicrotask(() => this.refreshVideo());
  }

  get modulos(): { titulo: string; total: number; pct: number; aulas: AulaComBloqueio[] }[] {
    const map = new Map<string, AulaComBloqueio[]>();
    for (const a of this.aulasView) {
      const k = (a.modulo && a.modulo.trim()) || 'Aulas';
      if (!map.has(k)) {
        map.set(k, []);
      }
      map.get(k)!.push(a);
    }
    return [...map.entries()].map(([titulo, aulas]) => {
      const total = aulas.length;
      const pct =
        total > 0
          ? Math.round(aulas.reduce((s, x) => s + x.percentualConcluido, 0) / total)
          : 0;
      return { titulo, total, pct, aulas };
    });
  }

  tipoAtual(): string {
    return (this.selected?.tipo ?? '').toLowerCase();
  }

  slidesSafeUrl(): SafeResourceUrl | null {
    const u = this.selected?.urlSlides;
    if (!u) {
      return null;
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(u);
  }

  selecionarAula(a: AulaComBloqueio): void {
    if (a.bloqueada) {
      this.toast.warning('Conclua a aula anterior para desbloquear esta.');
      return;
    }
    this.selected = a;
    this.refreshVideo();
  }

  private refreshVideo(): void {
    this.videoPlayback.revokeUrl(this.blobVideoUrl);
    this.blobVideoUrl = null;
    const el = this.videoRef?.nativeElement;
    if (el) {
      el.pause();
      el.removeAttribute('src');
      el.load();
    }
    const url = this.selected?.urlVideo;
    if (!url || this.tipoAtual() !== 'video' || !el) {
      return;
    }
    this.videoPlayback.resolvePlayableUrl(url).subscribe({
      next: (play) => {
        if (play.startsWith('blob:')) {
          this.blobVideoUrl = play;
        }
        const v = this.videoRef?.nativeElement;
        if (v) {
          v.src = play;
        }
      },
      error: () => {
        const v = this.videoRef?.nativeElement;
        if (v) {
          v.src = url;
        }
      },
    });
  }

  toggleConcluida(checked: boolean): void {
    if (!checked) {
      return;
    }
    if (!this.selected || this.selected.bloqueada) {
      return;
    }
    if (this.selected.concluida) {
      return;
    }
    this.marcando = true;
    this.cursos.concluirAula(this.curso.id, this.selected.id).subscribe({
      next: (r) => {
        this.toast.success(r.mensagem);
        this.marcando = false;
        this.atualizado.emit();
      },
      error: (e: Error) => {
        this.marcando = false;
        this.toast.error(e.message);
      },
    });
  }

  entregarTarefa(): void {
    this.toast.info('Fluxo de entrega de tarefa será integrado ao backend de tarefas.');
  }
}
