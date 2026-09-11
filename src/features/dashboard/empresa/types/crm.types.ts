export interface ClienteCrm {
  id: number;
  usuarioId: number;
  correo: string;
  nombres: string;
  apellidos: string;
  telefono?: string;
  fotoPerfilUrl?: string;
  totalGastado: number;
  totalPedidos: number;
  totalCitas: number;
  ultimaCompra?: string;
}
