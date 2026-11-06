import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./modules/admin/admin-module').then((m) => m.AdminModule),
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadChildren: () => import('./modules/admin/admin-module').then((m) => m.AdminModule),
  },
  {
    path: 'courier',
    canActivate: [authGuard],
    loadChildren: () => import('./modules/courier/courier-module').then((m) => m.CourierModule),
  },
  {
    path: 'client',
    canActivate: [authGuard],
    loadChildren: () => import('./modules/client/client-module').then((m) => m.ClientModule),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
