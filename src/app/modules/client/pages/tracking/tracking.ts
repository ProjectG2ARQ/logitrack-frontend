import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClientService, EnvioResponse } from '../../services/client.service';
import { AuthService } from '../../../../core/services/auth';

@Component({
  selector: 'app-tracking',
  standalone: false,
  templateUrl: './tracking.html',
  styleUrl: './tracking.css',
})
export class TrackingComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private clientService = inject(ClientService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  codigoSeguimiento = '';
  envio: EnvioResponse | null = null;
  isLoading = false;
  busquedaRealizada = false;

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['trk']) {
        this.codigoSeguimiento = params['trk'];
        this.buscarEnvio();
      }
    });
  }

  buscarEnvio(): void {
    const cleanTrk = this.codigoSeguimiento.trim();
    if (!cleanTrk) {
      this.snackBar.open('Ingresá un código de seguimiento válido', 'Cerrar', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    this.busquedaRealizada = true;
    this.envio = null;

    this.clientService.consultarPorTracking(cleanTrk).subscribe({
      next: (res) => {
        this.envio = res;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('No se encontró ningún paquete con ese código', 'Cerrar', { duration: 4000 });
      },
    });
  }

  cancelarEnvio(): void {
    if (!this.envio || this.envio.estado !== 'PENDIENTE') return;

    this.clientService.cancelarEnvio(this.envio.codigoSeguimiento).subscribe({
      next: () => {
        this.snackBar.open('Envío cancelado con éxito', 'Cerrar', { duration: 3000 });
        this.buscarEnvio(); // Refresca el estado
      },
      error: (err) => {
        const msg = err.error?.message || 'No se pudo cancelar el paquete';
        this.snackBar.open(msg, 'Cerrar', { duration: 4000 });
      },
    });
  }

  // Agregá Router y AuthService si no los tenías:

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/admin/login']);
  }

}
