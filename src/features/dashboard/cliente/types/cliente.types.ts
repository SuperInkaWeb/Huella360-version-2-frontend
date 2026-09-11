export interface ClienteProfile {
  id: number;
  usuarioId: number;
  nombres: string;
  apellidos: string;
  telefono: string;
  direccion: string;
  fotoPerfilUrl?: string;
  createdAt: string;
}

export interface UpdateClienteRequest {
  nombres?: string;
  apellidos?: string;
  telefono?: string;
  direccion?: string;
  fotoPerfilUrl?: string;
}
