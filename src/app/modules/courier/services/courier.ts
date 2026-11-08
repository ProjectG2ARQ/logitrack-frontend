import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RepartidorPerfil {
  id: string;
  nombre: string;
  tipoVehiculo: string;
  estado: 'ACTIVO' | 'INACTIVO';
  userId: number;
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
export class CourierService {
  private http = inject(HttpClient);

  // Apuntamos al API Gateway que expone los microservicios
  private readonly COURIER_URL =
    'http://localhost:8066/applications/api-courier/api/v1/repartidores';
  private readonly SHIPMENT_URL = 'http://localhost:8066/applications/api-shipment/api/v1/envios';

  /**
   * 1. Obtiene el perfil operativo (UUID, nombre, vehiculo) usando el userId del login
   */
  obtenerMiPerfil(): Observable<RepartidorPerfil> {
    const userInfo = JSON.parse(localStorage.getItem('logitrack_user_info') || '{}');
    // Enviamos el X-Auth-User-Id por cabecera como lo pide el controller
    const headers = new HttpHeaders().set(
      'X-Auth-User-Id',
      userInfo.userId ? userInfo.userId.toString() : '',
    );

    return this.http.get<RepartidorPerfil>(`${this.COURIER_URL}/mi-perfil`, { headers });
  }

  /**
   * 2. Cambia el estado del repartidor (requiere enviar todos los campos validados por el DTO)
   */
  actualizarMiEstado(
    id: string,
    perfilActual: RepartidorPerfil,
    nuevoEstado: 'ACTIVO' | 'INACTIVO',
  ): Observable<RepartidorPerfil> {
    const payload = {
      nombre: perfilActual.nombre,
      tipoVehiculo: perfilActual.tipoVehiculo,
      estado: nuevoEstado,
      userId: perfilActual.userId,
    };
    return this.http.patch<RepartidorPerfil>(`${this.COURIER_URL}/${id}/estado`, payload);
  }

  /**
   * 3. Obtiene todos los envíos según un estado (luego en el componente filtramos los tuyos)
   */
  obtenerEnviosPorEstado(estado: string): Observable<Envio[]> {
    return this.http.get<Envio[]>(`${this.SHIPMENT_URL}?estado=${estado}`);
  }

  /**
   * 4. Transiciona el estado de un envío (Ej: de EN_RUTA a ENTREGADO)
   */
  actualizarEstadoEnvio(envioId: string, nuevoEstado: string): Observable<Envio> {
    // El controller usa @RequestParam para el nuevo estado
    return this.http.patch<Envio>(
      `${this.SHIPMENT_URL}/${envioId}/estado?nuevoEstado=${nuevoEstado}`,
      {},
    );
  }
}
