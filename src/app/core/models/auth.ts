export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userId: number;
  email: string;
  rol: string; // 'ADMIN', 'REPARTIDOR' o 'CLIENTE'
}

export interface UsuarioInfo {
  userId: number;
  email: string;
  rol: string;
}
