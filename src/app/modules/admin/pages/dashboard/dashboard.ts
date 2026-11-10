import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { switchMap } from 'rxjs';
import { AdminService, Repartidor, Envio, Cliente } from '../../services/admin.service';
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
  private cdr = inject(ChangeDetectorRef);

  seccionActiva: 'repartidores' | 'envios' | 'clientes' = 'repartidores';

  adminEmail: string = '';
  repartidores: Repartidor[] = [];
  repartidoresActivos: Repartidor[] = [];
  clientes: Cliente[] = [];

  enviosPendientes: Envio[] = [];
  envios: Envio[] = [];
  estadoSeleccionado: string = 'PENDIENTE';

  repartidorForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    tipoVehiculo: ['FURGONETA', [Validators.required]],
    estado: ['ACTIVO', [Validators.required]],
  });

  isSubmitting = false;

  ngOnInit(): void {
    const seccionGuardada = sessionStorage.getItem('logitrack_admin_seccion') as
      'repartidores' | 'envios' | 'clientes';
    if (seccionGuardada) {
      this.seccionActiva = seccionGuardada;
    }

    const userInfo = JSON.parse(localStorage.getItem('logitrack_user_info') || '{}');
    this.adminEmail = userInfo.email || 'admin@logitrack.com';
    this.cargarDatos();
  }

  cambiarSeccion(seccion: 'repartidores' | 'envios' | 'clientes'): void {
    this.seccionActiva = seccion;
    sessionStorage.setItem('logitrack_admin_seccion', seccion);
    this.cdr.markForCheck();
  }

  cargarDatos(): void {
    this.cargarRepartidores();
    this.cargarClientes();
    this.cargarPendientes();
    this.filtrarEnvios(this.estadoSeleccionado);
  }

  cargarRepartidores(): void {
    this.adminService.obtenerRepartidores().subscribe({
      next: (data) => {
        this.repartidores = data;
        this.repartidoresActivos = data.filter((r) => r.estado === 'ACTIVO');
        this.cdr.markForCheck();
      },
      error: () => this.snackBar.open('Error al cargar repartidores', 'Cerrar', { duration: 3000 }),
    });
  }

  cargarClientes(): void {
    this.adminService.obtenerClientes().subscribe({
      next: (data) => {
        this.clientes = data;
        this.cdr.markForCheck();
      },
      error: () => this.snackBar.open('Error al cargar clientes', 'Cerrar', { duration: 3000 }),
    });
  }

  cargarPendientes(): void {
    this.adminService.obtenerEnviosPendientes().subscribe({
      next: (data) => {
        // Solo los pendientes que NO tengan repartidor asignado
        this.enviosPendientes = data.filter((e) => !e.repartidorId);
        this.cdr.markForCheck();
      },
      error: () =>
        this.snackBar.open('Error al cargar envíos pendientes', 'Cerrar', { duration: 3000 }),
    });
  }

  filtrarEnvios(estado: string): void {
    this.estadoSeleccionado = estado;
    this.adminService.obtenerEnviosPorEstado(estado).subscribe({
      next: (data) => {
        this.envios = data;
        this.cdr.markForCheck();
      },
      error: () =>
        this.snackBar.open(`Error al cargar envíos con estado ${estado}`, 'Cerrar', {
          duration: 3000,
        }),
    });
  }

  obtenerNombreRepartidor(repartidorId?: string): string {
    if (!repartidorId) return 'Sin asignar';
    const rep = this.repartidores.find((r) => r.id?.toLowerCase() === repartidorId.toLowerCase());
    return rep ? rep.nombre : `Asignado (ID: ${repartidorId.substring(0, 8)}...)`;
  }

  crearRepartidor(): void {
    if (this.repartidorForm.invalid || this.isSubmitting) return;

    this.isSubmitting = true;
    const formVal = this.repartidorForm.value;

    this.adminService
      .registrarUsuarioAuth({
        email: formVal.email,
        password: formVal.password,
        rol: 'REPARTIDOR',
      })
      .pipe(
        switchMap((authRes) =>
          this.adminService.registrarRepartidor({
            nombre: formVal.nombre,
            tipoVehiculo: formVal.tipoVehiculo,
            estado: formVal.estado,
            userId: authRes.userId,
          }),
        ),
      )
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          this.snackBar.open('Repartidor registrado con éxito', 'Cerrar', { duration: 3500 });
          this.repartidorForm.reset({ tipoVehiculo: 'FURGONETA', estado: 'ACTIVO' });
          this.cargarRepartidores();
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.isSubmitting = false;
          const msg = err.error?.message || 'Error al registrar repartidor';
          this.snackBar.open(msg, 'Cerrar', { duration: 4000 });
          this.cdr.markForCheck();
        },
      });
  }

  toggleEstadoRepartidor(rep: Repartidor): void {
    if (!rep.id) return;
    const nuevoEstado = rep.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';

    this.adminService
      .actualizarEstadoRepartidor(rep.id, nuevoEstado, rep.nombre, rep.tipoVehiculo, rep.userId)
      .subscribe({
        next: () => {
          this.snackBar.open(`Repartidor ${rep.nombre} ahora está ${nuevoEstado}`, 'Cerrar', {
            duration: 3000,
          });
          this.cargarRepartidores();
          this.cargarPendientes();
        },
        error: (err) => {
          const msg = err.error?.message || 'Error al actualizar disponibilidad';
          this.snackBar.open(msg, 'Cerrar', { duration: 4000 });
        },
      });
  }

  eliminarRepartidor(rep: Repartidor): void {
    if (!rep.id) return;

    this.adminService.eliminarRepartidor(rep.id).subscribe({
      next: () => {
        this.snackBar.open(`Repartidor ${rep.nombre} dado de baja`, 'Cerrar', { duration: 3000 });
        this.cargarRepartidores();
      },
      error: (err) => {
        const msg = err.error?.message || 'Error al dar de baja al repartidor';
        this.snackBar.open(msg, 'Cerrar', { duration: 4000 });
      },
    });
  }

  eliminarCliente(cli: Cliente): void {
    if (!cli.id) return;

    this.adminService.eliminarCliente(cli.id).subscribe({
      next: () => {
        this.snackBar.open(`Cliente ${cli.nombre} eliminado`, 'Cerrar', { duration: 3000 });
        this.cargarClientes();
      },
      error: (err) => {
        const msg = err.error?.message || 'Error al eliminar cliente';
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

  cancelar(codigoSeguimiento: string): void {
    this.adminService.cancelarEnvio(codigoSeguimiento).subscribe({
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
