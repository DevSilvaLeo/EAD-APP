import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';
import { AuthLayoutComponent } from './layout/auth-layout.component';
import { HomeShellComponent } from './layout/home-shell.component';
import { AdminPlaceholderPageComponent } from './pages/admin/admin-placeholder-page.component';
import { EsqueciSenhaPageComponent } from './pages/esqueci-senha/esqueci-senha-page.component';
import { FinanceiroPageComponent } from './pages/financeiro/financeiro-page.component';
import { HomeDashboardComponent } from './pages/home/home-dashboard/home-dashboard.component';
import { LoginPageComponent } from './pages/login/login-page.component';
import { MeusCursosPageComponent } from './pages/meus-cursos/meus-cursos-page.component';
import { PrimeiroAcessoPageComponent } from './pages/primeiro-acesso/primeiro-acesso-page.component';
import { SolicitacoesAcademicasPageComponent } from './pages/solicitacoes-academicas/solicitacoes-academicas-page.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: 'login', component: LoginPageComponent },
      { path: 'esqueci-senha', component: EsqueciSenhaPageComponent },
      { path: 'primeiro-acesso', component: PrimeiroAcessoPageComponent },
    ],
  },
  {
    path: 'home',
    component: HomeShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: HomeDashboardComponent },
      { path: 'meus-cursos', component: MeusCursosPageComponent },
      { path: 'financeiro', component: FinanceiroPageComponent },
      { path: 'solicitacoes-academicas', component: SolicitacoesAcademicasPageComponent },
      {
        path: 'admin/cursos',
        component: AdminPlaceholderPageComponent,
        canActivate: [adminGuard],
        data: { title: 'Cadastro de cursos' },
      },
      {
        path: 'admin/eventos-calendario',
        component: AdminPlaceholderPageComponent,
        canActivate: [adminGuard],
        data: { title: 'Cadastro de eventos no calendário' },
      },
      {
        path: 'admin/avisos',
        component: AdminPlaceholderPageComponent,
        canActivate: [adminGuard],
        data: { title: 'Cadastro de avisos' },
      },
      {
        path: 'admin/produtos',
        component: AdminPlaceholderPageComponent,
        canActivate: [adminGuard],
        data: { title: 'Cadastro de produtos' },
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
