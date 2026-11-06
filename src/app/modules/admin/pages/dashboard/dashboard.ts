import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AdminService, Repartidor, Envio } from '../../services/admin.service';
import { AuthService } from '../../../../core/services/auth';

@Component({
  selector: 'app-admin-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit {
  private adminService = inject(AdminService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  repartidores: Repartidor[] = [];
  repartidoresActivos: Repartidor[] = [];

  // Tarjeta de Asignación directa
  enviosPendientes: Envio[] = [];

  // Tarjeta de Monitoreo / Consulta general
  envios: Envio[] = [];
  estadoSeleccionado: string = 'PENDIENTE';

  repartidorForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    tipoVehiculo: ['FURGONETA', [Validators.required]],
    estado: ['ACTIVO', [Validators.required]],
  });

  isLoading = false;

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargarRepartidores();
    this.cargarPendientes();
    this.filtrarEnvios(this.estadoSeleccionado);
  }

  cargarRepartidores(): void {
    this.adminService.obtenerRepartidores().subscribe({
      next: (data) => {
        this.repartidores = data;
        this.repartidoresActivos = data.filter((r) => r.estado === 'ACTIVO');
      },
      error: () => this.snackBar.open('Error al cargar repartidores', 'Cerrar', { duration: 3000 }),
    });
  }

  cargarPendientes(): void {
    this.adminService.obtenerEnviosPendientes().subscribe({
      next: (data) => (this.enviosPendientes = data),
      error: () =>
        this.snackBar.open('Error al cargar envíos pendientes', 'Cerrar', { duration: 3000 }),
    });
  }

  filtrarEnvios(estado: string): void {
    this.estadoSeleccionado = estado;
    this.adminService.obtenerEnviosPorEstado(estado).subscribe({
      next: (data) => (this.envios = data),
      error: () =>
        this.snackBar.open(`Error al cargar envíos con estado ${estado}`, 'Cerrar', {
          duration: 3000,
        }),
    });
  }

  crearRepartidor(): void {
    if (this.repartidorForm.invalid) return;

    this.adminService.registrarRepartidor(this.repartidorForm.value).subscribe({
      next: () => {
        this.snackBar.open('Repartidor registrado con éxito', 'Cerrar', { duration: 3000 });
        this.repartidorForm.reset({ tipoVehiculo: 'FURGONETA', estado: 'ACTIVO' });
        this.cargarRepartidores();
      },
      error: (err) => {
        const msg = err.error?.message || 'Error al registrar repartidor';
        this.snackBar.open(msg, 'Cerrar', { duration: 4000 });
      },
    });
  }

  asignar(envioId: string, repartidorId: string): void {
    if (!repartidorId) return;

    this.adminService.asignarRepartidor(envioId, repartidorId).subscribe({
      next: () => {
        this.snackBar.open('Repartidor asignado correctamente', 'Cerrar', { duration: 3000 });
        this.cargarPendientes();
        this.filtrarEnvios(this.estadoSeleccionado);
      },
      error: (err) => {
        const msg = err.error?.message || 'Error al asignar repartidor';
        this.snackBar.open(msg, 'Cerrar', { duration: 4000 });
      },
    });
  }

  toggleEstadoRepartidor(rep: Repartidor): void {
    const nuevoEstado = rep.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    if (!rep.id) return;

    this.adminService
      .actualizarEstadoRepartidor(rep.id, nuevoEstado, rep.nombre, rep.tipoVehiculo)
      .subscribe({
        next: () => {
          this.snackBar.open(`Repartidor ${rep.nombre} ahora está ${nuevoEstado}`, 'Cerrar', {
            duration: 3000,
          });
          this.cargarRepartidores();
        },
        error: (err) => {
          const msg = err.error?.message || 'Error al actualizar estado';
          this.snackBar.open(msg, 'Cerrar', { duration: 4000 });
        },
      });
  }

  cancelar(envioId: string): void {
    this.adminService.cancelarEnvio(envioId).subscribe({
      next: () => {
        this.snackBar.open('Envío cancelado con éxito', 'Cerrar', { duration: 3000 });
        this.cargarPendientes();
        this.filtrarEnvios(this.estadoSeleccionado);
      },
      error: (err) => {
        const msg = err.error?.message || 'No se pudo cancelar el envío';
        this.snackBar.open(msg, 'Cerrar', { duration: 4000 });
      },
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
