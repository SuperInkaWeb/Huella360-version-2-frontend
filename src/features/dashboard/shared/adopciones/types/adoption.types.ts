export type EstadoAdopcion = "DISPONIBLE" | "ADOPTADO" | "PAUSADO";

export type EstadoSolicitud = "PENDIENTE" | "APROBADA" | "RECHAZADA";

export interface AdoptionResponse {
  id: number;
  mascotaId: number;
  mascotaNombre: string;
  mascotaFotoUrl: string | null;
  titulo: string;
  historia: string;
  requisitos: string;
  ubicacionCiudad: string;
  estado: EstadoAdopcion;
  publicadoPorId: number;
  publicadoPorNombre: string;
  publicadoPorTipoServicio: string;
  fechaPublicacion: string;
}

export interface ApplicationResponse {
  id: number;
  adopcionId: number;
  interesadoId: number;
  interesadoEmail: string;
  mensajePresentacion: string;
  estado: EstadoSolicitud;
  motivoRechazo: string | null;
  fechaSolicitud: string;
  fechaRespuesta: string | null;
}

export interface CreateAdoptionDto {
  mascotaId: number;
  titulo: string;
  historia: string;
  requisitos: string;
  ubicacionCiudad: string;
}

export interface ApplyAdoptionDto {
  mensajePresentacion: string;
}

export interface RespondApplicationDto {
  aprobar: boolean;
  motivoRechazo?: string;
}
