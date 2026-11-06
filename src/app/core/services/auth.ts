import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { LoginRequest, LoginResponse } from '../models/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  // URL apuntando a la ruta del Gateway hacia security-service
  private readonly AUTH_URL = 'http://localhost:8066/applications/api-security/api/v1/auth';
  private readonly TOKEN_KEY = 'logitrack_jwt_token';
  private readonly USER_KEY = 'logitrack_user_info';

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.AUTH_URL}/login`, credentials).pipe(
      tap((res) => {
        if (res && res.token) {
          this.setToken(res.token);
          localStorage.setItem(
            this.USER_KEY,
            JSON.stringify({
              userId: res.userId,
              email: res.email,
              rol: res.rol,
            }),
          );
        }
      }),
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.router.navigate(['/login']);
  }

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUserRole(): string | null {
    const user = localStorage.getItem(this.USER_KEY);
    if (!user) return null;
    try {
      return JSON.parse(user).rol;
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
