import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Verificar si está autenticado
  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  const userRole = authService.getUserRole();
  const allowedRoles = route.data?.['roles'] as string[];

  // 2. Si la ruta requiere roles específicos y el usuario lo tiene, permite el acceso
  if (allowedRoles && userRole && allowedRoles.includes(userRole)) {
    return true;
  }

  // 3. Si no tiene el rol permitido, redirigir a su pantalla correspondiente
  if (userRole === 'ADMIN') {
    router.navigate(['/admin/dashboard']);
  } else if (userRole === 'REPARTIDOR') {
    router.navigate(['/courier/dashboard']);
  } else if (userRole === 'CLIENTE') {
    router.navigate(['/client/dashboard']);
  } else {
    router.navigate(['/login']);
  }

  return false;
};
