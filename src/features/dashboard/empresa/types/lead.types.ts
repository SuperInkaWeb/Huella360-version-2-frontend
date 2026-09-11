export interface Lead {
  id: number;
  empresaId: number;
  clienteNombre: string;
  clienteEmail: string | null;
  clienteTelefono: string | null;
  servicioSolicitado: string | null;
  mensaje: string | null;
  estado: "NUEVO" | "EN_CONTACTO" | "CONVERTIDO" | "PERDIDO";
  createdAt: string;
}

export interface CreateLeadRequest {
  empresaId: number;
  clienteNombre: string;
  clienteEmail?: string;
  clienteTelefono?: string;
  servicioSolicitado?: string;
  mensaje?: string;
}
