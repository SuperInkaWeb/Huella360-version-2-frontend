import { api } from "../../../../shared/http/api";
import type { ApiResponse, PageResponse } from "../../../../shared/types/api";

export type EstadoReclamo = "RECIBIDO" | "EN_PROCESO" | "RESUELTO" | "RECHAZADO";

export interface Reclamo {
  id: number;
  tipoDocumento: string;
  numeroDocumento: string;
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  direccion: string;
  departamento: string;
  provincia: string;
  distrito: string;
  correo: string;
  telefono: string;
  esMenor: boolean;
  numeroOrden?: string;
  montoReclamado?: number;
  nombreProducto?: string;
  tipoReclamo: string;
  resumen?: string;
  detallePedido?: string;
  estado: EstadoReclamo;
  notasInternas?: string;
  archivoAdjuntoUrl?: string;
  pdfReclamoUrl?: string;
  fechaRegistro: string;
}

export const reclamosAdminService = {
  listar: async (estado: EstadoReclamo | "" = "", page = 0, size = 20): Promise<PageResponse<Reclamo>> => {
    const { data } = await api.get<ApiResponse<PageResponse<Reclamo>>>("/reclamos", {
      params: { page, size, ...(estado ? { estado } : {}) },
    });
    return data.data;
  },

  actualizarEstado: async (id: number, estado: EstadoReclamo, notas?: string): Promise<Reclamo> => {
    const { data } = await api.patch<ApiResponse<Reclamo>>(`/reclamos/${id}/status`, null, {
      params: { estado, ...(notas ? { notas } : {}) },
    });
    return data.data;
  },
};

/** Numero visible del reclamo, igual al que recibe el consumidor ("000123"). */
export const numeroReclamo = (id: number) => String(id).padStart(6, "0");

/**
 * Fecha limite legal de respuesta: 15 dias habiles desde el registro (Ley 29571 / D.S. 011-2011-PCM).
 * Cuenta lunes a viernes; no descuenta feriados (aproximacion para el panel).
 */
export const fechaLimiteRespuesta = (fechaRegistro: string): Date => {
  const d = new Date(fechaRegistro);
  let habiles = 0;
  while (habiles < 15) {
    d.setDate(d.getDate() + 1);
    const dia = d.getDay();
    if (dia !== 0 && dia !== 6) habiles++;
  }
  return d;
};
