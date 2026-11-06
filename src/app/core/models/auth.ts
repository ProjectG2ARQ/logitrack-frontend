export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  rol: string; // 'ADMIN', 'REPARTIDOR' o 'CLIENTE'
}

export interface UsuarioInfo {
  username: string;
  rol: string;
}
