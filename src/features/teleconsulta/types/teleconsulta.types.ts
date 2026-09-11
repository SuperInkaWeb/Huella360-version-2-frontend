export interface Consulta {
  id: number;
  clienteId: number;
  clienteNombre: string;
  veterinarioId: number;
  veterinarioNombre: string;
  mascotaId: number | null;
  mascotaNombre: string | null;
  estado: "PENDIENTE" | "ACEPTADA" | "EN_CURSO" | "FINALIZADA" | "CANCELADA";
  jitsiRoomId: string | null;
  createdAt: string;
}

export interface ChatMensaje {
  id: number;
  remitenteId: number;
  remitenteNombre: string;
  contenido: string;
  tipo: "TEXTO" | "IMAGEN" | "SISTEMA";
  createdAt: string;
}
