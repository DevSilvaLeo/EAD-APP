import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Exige token de login (JWT de acesso). Área restrita — etapa 2 pode evoluir claims/roles. */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.getAccessToken()) {
    return true;
  }
  return router.createUrlTree(['/login']);
};
