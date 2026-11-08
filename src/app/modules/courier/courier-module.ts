import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';

import { CourierRoutingModule } from './courier-routing-module';
import { DashboardComponent } from './pages/dashboard/dashboard';

@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    CourierRoutingModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatToolbarModule,
  ],
})
export class CourierModule {}
