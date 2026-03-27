import { DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { finalize } from 'rxjs';
import { AvisoDto, TarefaPendenteFrontendDto } from '../../../core/models/aluno-area.models';
import { AvisosService } from '../../../core/services/avisos.service';
import { CalendarioService } from '../../../core/services/calendario.service';
import { TarefasService } from '../../../core/services/tarefas.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-home-dashboard',
  standalone: true,
  imports: [
    DatePipe,
    FullCalendarModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './home-dashboard.component.html',
  styleUrl: './home-dashboard.component.css',
})
export class HomeDashboardComponent implements OnInit {
  private readonly calendario = inject(CalendarioService);
  private readonly avisos = inject(AvisosService);
  private readonly tarefas = inject(TarefasService);
  private readonly toast = inject(ToastrService);

  loadingCal = true;
  loadingAvisos = true;
  loadingTarefas = true;

  listaAvisos: AvisoDto[] = [];
  listaTarefas: TarefaPendenteFrontendDto[] = [];

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    locale: ptBrLocale,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: '',
    },
    height: 'auto',
    events: [],
    eventDisplay: 'block',
  };

  ngOnInit(): void {
    this.calendario
      .listarEventos()
      .pipe(finalize(() => (this.loadingCal = false)))
      .subscribe({
        next: (evs) => {
          const events: EventInput[] = evs.map((e) => ({
            id: String(e.id),
            title: e.title,
            start: e.start,
            end: e.end ?? undefined,
            backgroundColor: e.backgroundColor ?? undefined,
          }));
          this.calendarOptions = { ...this.calendarOptions, events };
        },
        error: (e: Error) => this.toast.error(e.message),
      });

    this.avisos
      .listar()
      .pipe(finalize(() => (this.loadingAvisos = false)))
      .subscribe({
        next: (rows) => (this.listaAvisos = rows),
        error: (e: Error) => this.toast.error(e.message),
      });

    this.tarefas
      .listarPendentes()
      .pipe(finalize(() => (this.loadingTarefas = false)))
      .subscribe({
        next: (rows) => (this.listaTarefas = rows),
        error: (e: Error) => this.toast.error(e.message),
      });
  }

  entregarTarefa(t: TarefaPendenteFrontendDto): void {
    this.tarefas.entregar(t.id, { texto: 'Entrega via painel (mock).' }).subscribe({
      next: (res) => {
        this.toast.success(res.mensagem);
        this.listaTarefas = this.listaTarefas.filter((x) => x.id !== t.id);
      },
      error: (e: Error) => this.toast.error(e.message),
    });
  }
}
