import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';
import { CourierService, RepartidorPerfil, Envio } from '../../services/courier';
import { AuthService } from '../../../../core/services/auth';

@Component({
  selector: 'app-courier-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class DashboardComponent implements OnInit {
  private courierService = inject(CourierService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  perfil: RepartidorPerfil | null = null;
  misEnvios: Envio[] = [];
  cargando = true;

  ngOnInit(): void {
    this.cargarPerfilYEnvios();
  }

  cargarPerfilYEnvios(): void {
    this.cargando = true;
    this.courierService.obtenerMiPerfil().subscribe({
      next: (perfil) => {
        this.perfil = perfil;
        this.cargarMisEnvios();
      },
      error: () => {
        this.cargando = false;
        this.snackBar.open('Error al cargar tu perfil', 'Cerrar', { duration: 4000 });
        this.cdr.markForCheck();
      },
    });
  }

  cargarMisEnvios(): void {
    if (!this.perfil) return;

    forkJoin({
      pendientes: this.courierService.obtenerEnviosPorEstado('PENDIENTE'),
      enRuta: this.courierService.obtenerEnviosPorEstado('EN_RUTA'),
    }).subscribe({
      next: (res) => {
        const pendientes = Array.isArray(res.pendientes) ? res.pendientes : [];
        const enRuta = Array.isArray(res.enRuta) ? res.enRuta : [];
        const todos = [...pendientes, ...enRuta];

        this.misEnvios = todos.filter(
          (e) => e.repartidorId && e.repartidorId.toLowerCase() === this.perfil?.id?.toLowerCase(),
        );
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al cargar envíos:', err);
        this.cargando = false;
        this.snackBar.open('Error al cargar tus envíos', 'Cerrar', { duration: 3000 });
        this.cdr.markForCheck();
      },
    });
  }

  toggleDisponibilidad(): void {
    if (!this.perfil) return;
    const nuevoEstado: 'ACTIVO' | 'INACTIVO' =
      this.perfil.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    const perfilParaEnviar = { ...this.perfil, estado: nuevoEstado };

    this.courierService
      .actualizarMiEstado(this.perfil.id, perfilParaEnviar, nuevoEstado)
      .subscribe({
        next: () => {
          this.perfil = { ...this.perfil!, estado: nuevoEstado };
          this.snackBar.open(`Disponibilidad cambiada a ${nuevoEstado}`, 'Cerrar', {
            duration: 3000,
          });
          this.cdr.markForCheck();
        },
        error: (err) => {
          const msg = err.error?.message || 'Error al cambiar de estado';
          this.snackBar.open(msg, 'Cerrar', { duration: 4000 });
          this.cdr.markForCheck();
        },
      });
  }

  transicionar(envio: Envio, nuevoEstado: string): void {
    this.courierService.actualizarEstadoEnvio(envio.id, nuevoEstado).subscribe({
      next: () => {
        this.snackBar.open(
          `Paquete ${envio.codigoSeguimiento} actualizado a ${nuevoEstado}`,
          'Cerrar',
          { duration: 3000 },
        );
        this.cargarMisEnvios();
      },
      error: (err) => {
        const msg = err.error?.message || 'Error al actualizar paquete';
        this.snackBar.open(msg, 'Cerrar', { duration: 4000 });
        this.cdr.markForCheck();
      },
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
