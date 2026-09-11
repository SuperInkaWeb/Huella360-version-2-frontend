export type ModalidadServicio = 'PRESENCIAL' | 'VIRTUAL' | 'DOMICILIO' | 'HIBRIDO';

export interface Service {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  duracionMinutos: number;
  modalidad: ModalidadServicio;
  activo: boolean;
  visible: boolean;
  imagenUrl?: string;
  empresaId?: number;
  empresaNombre?: string;
  veterinarioId?: number;
  veterinarioNombres?: string;
  veterinarioApellidos?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceRequest {
  nombre: string;
  descripcion?: string;
  precio: number;
  duracionMinutos?: number;
  modalidad: ModalidadServicio;
  visible: boolean;
}

export interface UpdateServiceRequest {
  nombre?: string;
  descripcion?: string;
  precio?: number;
  duracionMinutos?: number;
  modalidad?: ModalidadServicio;
  visible?: boolean;
  activo?: boolean;
}
