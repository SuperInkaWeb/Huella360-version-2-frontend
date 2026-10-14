export interface ClienteProfile {
  id: number;
  usuarioId: number;
  nombres: string;
  apellidos: string;
  telefono: string;
  direccion: string;
  ciudad?: string;
  ubicacionLat?: number | null;
  ubicacionLng?: number | null;
  fotoPerfilUrl?: string;
  createdAt: string;
}

export interface UpdateClienteRequest {
  nombres?: string;
  apellidos?: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  latitud?: number;
  longitud?: number;
  fotoPerfilUrl?: string;
}
