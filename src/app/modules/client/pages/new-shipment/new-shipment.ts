import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClientService, EnvioRequest } from '../../services/client.service';
import { AuthService } from '../../../../core/services/auth';

@Component({
  selector: 'app-new-shipment',
  standalone: false,
  templateUrl: './new-shipment.html',
  styleUrl: './new-shipment.css',
})
export class NewShipmentComponent implements OnInit {
  private fb = inject(FormBuilder);
  private clientService = inject(ClientService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  isLoading = false;
  tarifaEstimada = 1750; // Tarifa base para 1kg
  clienteIdActual: string | null = null;

  // Paso 1: Paquete
  packageForm: FormGroup = this.fb.group({
    peso: [1, [Validators.required, Validators.min(0.1)]],
    ancho: [10, [Validators.required, Validators.min(1)]],
    alto: [10, [Validators.required, Validators.min(1)]],
    largo: [10, [Validators.required, Validators.min(1)]],
  });

  // Paso 2: Dirección de Origen
  origenForm: FormGroup = this.fb.group({
    calle: ['', Validators.required],
    numero: ['', Validators.required],
    ciudad: ['San Salvador de Jujuy', Validators.required],
    codigoPostal: ['4600', Validators.required],
  });

  // Paso 3: Dirección de Destino
  destinoForm: FormGroup = this.fb.group({
    calle: ['', Validators.required],
    numero: ['', Validators.required],
    ciudad: ['', Validators.required],
    codigoPostal: ['', Validators.required],
  });

  ngOnInit(): void {
    this.cargarPerfilCliente();
  }

  private cargarPerfilCliente(): void {
    this.clientService.obtenerMiPerfil().subscribe({
      next: (cliente) => {
        this.clienteIdActual = cliente.id;
      },
      error: () => {
        this.snackBar.open(
          'No se pudo vincular el perfil de cliente. Verificá tu sesión.',
          'Cerrar',
          { duration: 4000 }
        );
      },
    });
  }

  actualizarTarifa(): void {
    const peso = this.packageForm.get('peso')?.value || 1;
    this.tarifaEstimada = this.clientService.calcularTarifaEstimada(peso);
  }

  registrarEnvio(): void {
    if (this.packageForm.invalid || this.origenForm.invalid || this.destinoForm.invalid) {
      this.snackBar.open('Por favor completá todos los campos requeridos', 'Cerrar', { duration: 3000 });
      return;
    }

    if (!this.clienteIdActual) {
      this.snackBar.open(
        'No se encontró el identificador del cliente autenticado. Reintentá iniciar sesión.',
        'Cerrar',
        { duration: 4000 }
      );
      return;
    }

    const payload: EnvioRequest = {
      clienteId: this.clienteIdActual,
      peso: Number(this.packageForm.value.peso),
      ancho: Number(this.packageForm.value.ancho),
      alto: Number(this.packageForm.value.alto),
      largo: Number(this.packageForm.value.largo),
      origen: this.origenForm.value,
      destino: this.destinoForm.value,
    };

    this.isLoading = true;
    this.clientService.crearEnvio(payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.snackBar
          .open(`¡Envío creado con éxito! Tracking: ${res.codigoSeguimiento}`, 'Ver seguimiento', {
            duration: 6000,
          })
          .onAction()
          .subscribe(() => {
            this.router.navigate(['/client/tracking'], { queryParams: { trk: res.codigoSeguimiento } });
          });
        this.router.navigate(['/client/tracking'], { queryParams: { trk: res.codigoSeguimiento } });
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err.error?.message || 'Error al procesar el envío';
        this.snackBar.open(msg, 'Cerrar', { duration: 4000 });
      },
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
