import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-home-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatTooltipModule,
    MatMenuModule,
    MatExpansionModule,
  ],
  templateUrl: './home-shell.component.html',
  styleUrl: './home-shell.component.css',
})
export class HomeShellComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  /** Sidebar recolhida: só ícones + tooltips. */
  collapsed = signal(false);

  toggleSidebar(): void {
    this.collapsed.update((c) => !c);
  }

  sair(): void {
    this.auth.logout();
    void this.router.navigate(['/login']);
  }
}
