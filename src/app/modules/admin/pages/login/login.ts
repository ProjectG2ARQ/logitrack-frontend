import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { switchMap } from 'rxjs';
import { AuthService } from '../../../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  private fb: FormBuilder = inject(FormBuilder);
  private authService: AuthService = inject(AuthService);
  private router: Router = inject(Router);
  private snackBar: MatSnackBar = inject(MatSnackBar);

  isRegisterMode: boolean = false;
  hidePassword: boolean = true;
  isLoading: boolean = false;

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  registerForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    telefono: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  toggleMode(): void {
    this.isRegisterMode = !this.isRegisterMode;
    this.loginForm.reset();
    this.registerForm.reset();
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.authService.login(this.loginForm.value).subscribe({
      next: (res: any): void => {
        this.isLoading = false;
        this.snackBar.open('Inicio de sesión exitoso', 'Cerrar', { duration: 3000 });

        if (res.rol === 'ADMIN') {
          this.router.navigate(['/admin/dashboard']);
        } else if (res.rol === 'REPARTIDOR') {
          this.router.navigate(['/courier/dashboard']);
        } else {
          this.router.navigate(['/client/dashboard']);
        }
      },
      error: (err: any): void => {
        this.isLoading = false;
        const msg: any = err.error?.message || 'Credenciales inválidas o servicio no disponible';
        this.snackBar.open(msg, 'Cerrar', { duration: 4000 });
      },
    });
  }

  onRegister(): void {
    if (this.registerForm.invalid || this.isLoading) {
      return;
    }

    this.isLoading = true;
    const formVal = this.registerForm.value;

    // 1° Crear credenciales en security-service
    this.authService
      .registrarUsuarioAuth({
        email: formVal.email.trim(),
        password: formVal.password,
        rol: 'CLIENTE',
      })
      .pipe(
        // 2° Crear perfil operativo en shipment-service con el userId devuelto
        switchMap((authRes: any) =>
          this.authService.registrarPerfilCliente({
            userId: authRes.userId,
            nombre: formVal.nombre.trim(),
            email: formVal.email.trim(),
            telefono: String(formVal.telefono).trim(),
          })
        )
      )
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.snackBar.open('¡Bienvenido! Cuenta creada con éxito', 'Cerrar', { duration: 3500 });
          this.router.navigate(['/client/dashboard']);
        },
        error: (err: any) => {
          this.isLoading = false;
          // Extrae el mensaje específico (ej: email duplicado, validación de campo)
          let mensaje = 'Error al registrar el cliente';
          if (err.error?.message) {
            mensaje = err.error.message;
          } else if (err.error?.errors) {
            mensaje = Object.values(err.error.errors).join(', ');
          }
          this.snackBar.open(mensaje, 'Cerrar', { duration: 5000 });
        },
      });
  }
}
