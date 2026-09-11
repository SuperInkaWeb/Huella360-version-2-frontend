export interface ChatRoom {
  id: number;
  empresaId: number;
  empresaNombre: string;
  empresaLogoUrl?: string;
  clienteId: number;
  clienteNombre: string;
  updatedAt: string;
}

export interface ChatMensaje {
  id: number;
  chatRoomId: number;
  remitenteId: number;
  remitenteNombre: string;
  contenido: string;
  leido: boolean;
  createdAt: string;
}
