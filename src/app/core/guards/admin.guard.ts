import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../services/auth.service';

/** Somente perfil Administrador (claim Role no JWT ou mock). */
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastrService);
  if (auth.isAdministrador()) {
    return true;
  }
  toast.warning('Acesso restrito a administradores.');
  return router.createUrlTree(['/home/dashboard']);
};
