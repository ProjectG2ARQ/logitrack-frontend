import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NewShipmentComponent } from './pages/new-shipment/new-shipment';
import { TrackingComponent } from './pages/tracking/tracking';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'tracking',
    pathMatch: 'full',
  },
  {
    path: 'nuevo-envio',
    component: NewShipmentComponent,
  },
  {
    path: 'tracking',
    component: TrackingComponent,
  },
  {
    path: 'dashboard',
    redirectTo: 'tracking',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClientRoutingModule {}
