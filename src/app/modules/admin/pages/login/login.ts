import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  loginForm: FormGroup = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  hidePassword = true;
  isLoading = false;

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.snackBar.open('Inicio de sesión exitoso', 'Cerrar', { duration: 3000 });

        // Redirección condicional según el rol retornado por el backend
        if (res.rol === 'ADMIN') {
          this.router.navigate(['/admin/dashboard']);
        } else if (res.rol === 'REPARTIDOR') {
          this.router.navigate(['/courier/dashboard']);
        } else {
          this.router.navigate(['/client/dashboard']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err.error?.message || 'Credenciales inválidas o servicio no disponible';
        this.snackBar.open(msg, 'Cerrar', { duration: 4000 });
      },
    });
  }
}
