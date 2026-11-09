import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Repartidor {
  id?: string;
  nombre: string;
  tipoVehiculo: string;
  estado: 'ACTIVO' | 'INACTIVO' | 'ELIMINADO';
  userId?: number;
}

export interface Cliente {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  estado?: 'ACTIVO' | 'INACTIVO' | 'ELIMINADO';
  userId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Envio {
  id: string;
  codigoSeguimiento: string;
  clienteId: string;
  peso: number;
  tarifa: number;
  estado: string;
  origen: { ciudad: string; calle: string; numero: string };
  destino: { ciudad: string; calle: string; numero: string };
  repartidorId?: string;
}

export interface RegistroAuthResponse {
  token: string;
  userId: number;
  email: string;
  rol: string;
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private http = inject(HttpClient);

  private readonly AUTH_URL = 'http://localhost:8066/applications/api-security/api/v1/auth';
  private readonly COURIER_URL =
    'http://localhost:8066/applications/api-courier/api/v1/repartidores';
  private readonly SHIPMENT_URL = 'http://localhost:8066/applications/api-shipment/api/v1/envios';
  private readonly CLIENTE_URL = 'http://localhost:8066/applications/api-shipment/api/v1/clientes';

  // 1. Primer disparo: registrar credenciales en security-service
  registrarUsuarioAuth(payload: {
    email: string;
    password: string;
    rol: string;
  }): Observable<RegistroAuthResponse> {
    return this.http.post<RegistroAuthResponse>(`${this.AUTH_URL}/register`, payload);
  }

  // 2. Segundo disparo: registrar perfil con userId en courier-service
  registrarRepartidor(repartidor: Repartidor): Observable<Repartidor> {
    return this.http.post<Repartidor>(this.COURIER_URL, repartidor);
  }

  obtenerRepartidores(): Observable<Repartidor[]> {
    return this.http.get<Repartidor[]>(this.COURIER_URL);
  }

  actualizarEstadoRepartidor(
    id: string,
    nuevoEstado: 'ACTIVO' | 'INACTIVO',
    nombre: string,
    tipoVehiculo: string,
    userId?: number,
  ): Observable<Repartidor> {
    return this.http.patch<Repartidor>(`${this.COURIER_URL}/${id}/estado`, {
      nombre,
      tipoVehiculo,
      estado: nuevoEstado,
      userId: userId ?? null,
    });
  }

  eliminarRepartidor(id: string): Observable<void> {
    return this.http.delete<void>(`${this.COURIER_URL}/${id}`);
  }

  // Clientes
  obtenerClientes(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.CLIENTE_URL);
  }

  eliminarCliente(id: string): Observable<void> {
    return this.http.delete<void>(`${this.CLIENTE_URL}/${id}`);
  }

  // Envios y Asignacion
  obtenerEnviosPendientes(): Observable<Envio[]> {
    return this.http.get<Envio[]>(`${this.SHIPMENT_URL}?estado=PENDIENTE`);
  }

  asignarRepartidor(envioId: string, repartidorId: string): Observable<Envio> {
    return this.http.patch<Envio>(
      `${this.SHIPMENT_URL}/${envioId}/repartidores/${repartidorId}`,
      {},
    );
  }

  obtenerEnviosPorEstado(estado: string): Observable<Envio[]> {
    return this.http.get<Envio[]>(`${this.SHIPMENT_URL}?estado=${estado}`);
  }

  cancelarEnvio(codigoSeguimiento: string): Observable<void> {
    return this.http.post<void>(`${this.SHIPMENT_URL}/${codigoSeguimiento}/cancelar`, {});
  }
}
