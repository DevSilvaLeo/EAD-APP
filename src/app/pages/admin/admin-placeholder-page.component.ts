import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';

/** Telas administrativas — placeholders até integração com backend. */
@Component({
  selector: 'app-admin-placeholder-page',
  standalone: true,
  imports: [MatCardModule],
  template: `
    <h1 class="page-title">{{ title }}</h1>
    <mat-card class="adm-card">
      <mat-card-content>
        <p class="adm-text">Módulo em construção. Formulários e listagens serão integrados ao backend.</p>
      </mat-card-content>
    </mat-card>
  `,
  styles: [
    `
      .page-title {
        margin: 0 0 1rem;
        font-size: 1.35rem;
        font-weight: 600;
        color: var(--ead-primary-dark, #0d47a1);
      }
      .adm-card {
        max-width: 720px;
        border-radius: 12px !important;
        border: 1px solid rgba(21, 101, 192, 0.12);
      }
      .adm-text {
        margin: 0;
        line-height: 1.5;
        color: #37474f;
      }
    `,
  ],
})
export class AdminPlaceholderPageComponent {
  readonly title = inject(ActivatedRoute).snapshot.data['title'] as string;
}
