import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Repartidor {
  id?: string;
  nombre: string;
  tipoVehiculo: string;
  estado: 'ACTIVO' | 'INACTIVO';
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

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private http = inject(HttpClient);

  private readonly COURIER_URL =
    'http://localhost:8066/applications/api-courier/api/v1/repartidores';
  private readonly SHIPMENT_URL = 'http://localhost:8066/applications/api-shipment/api/v1/envios';

  // Repartidores
  obtenerRepartidores(): Observable<Repartidor[]> {
    return this.http.get<Repartidor[]>(this.COURIER_URL);
  }

  registrarRepartidor(repartidor: Repartidor): Observable<Repartidor> {
    return this.http.post<Repartidor>(this.COURIER_URL, repartidor);
  }

  // Envíos y Asignación
  obtenerEnviosPendientes(): Observable<Envio[]> {
    return this.http.get<Envio[]>(`${this.SHIPMENT_URL}?estado=PENDIENTE`);
  }

  asignarRepartidor(envioId: string, repartidorId: string): Observable<Envio> {
    return this.http.patch<Envio>(
      `${this.SHIPMENT_URL}/${envioId}/repartidores/${repartidorId}`,
      {},
    );
  }
}
