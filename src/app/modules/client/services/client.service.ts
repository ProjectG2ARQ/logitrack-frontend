import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Direccion {
  calle: string;
  numero: string;
  ciudad: string;
  codigoPostal: string;
}

export interface EnvioRequest {
  clienteId: string;
  peso: number;
  ancho: number;
  alto: number;
  largo: number;
  origen: Direccion;
  destino: Direccion;
}

export interface EnvioResponse {
  id: string;
  codigoSeguimiento: string;
  clienteId: string;
  peso: number;
  ancho: number;
  alto: number;
  largo: number;
  tarifa: number;
  estado: 'PENDIENTE' | 'EN_RUTA' | 'ENTREGADO' | 'CANCELADO';
  origen: Direccion;
  destino: Direccion;
  fechaCreacion?: string;
  fechaUltimaModificacion?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  private http = inject(HttpClient);
  private readonly BASE_URL = 'http://localhost:8066/applications/api-shipment/api/v1/envios';

  crearEnvio(data: EnvioRequest): Observable<EnvioResponse> {
    return this.http.post<EnvioResponse>(this.BASE_URL, data);
  }

  consultarPorTracking(codigoSeguimiento: string): Observable<EnvioResponse> {
    return this.http.get<EnvioResponse>(`${this.BASE_URL}/tracking/${codigoSeguimiento}`);
  }

  cancelarEnvio(id: string): Observable<void> {
    return this.http.post<void>(`${this.BASE_URL}/${id}/cancelar`, {});
  }

  calcularTarifaEstimada(peso: number): number {
    const pesoValido = peso > 0 ? peso : 1.0;
    return 1500.0 + pesoValido * 250.0;
  }
  obtenerMiPerfil(): Observable<{ id: string; nombre: string; email: string }> {
    return this.http.get<{ id: string; nombre: string; email: string }>(
      'http://localhost:8066/applications/api-shipment/api/v1/clientes/mi-perfil'
    );
  }
}
