import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./modules/admin/admin-module').then((m) => m.AdminModule),
  },
  {
    path: 'admin',
    loadChildren: () => import('./modules/admin/admin-module').then((m) => m.AdminModule),
  },
  {
    path: 'courier',
    loadChildren: () => import('./modules/courier/courier-module').then((m) => m.CourierModule),
  },
  {
    path: 'client',
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
