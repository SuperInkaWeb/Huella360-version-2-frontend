export interface Company {
  id: number;
  nombreComercial: string;
  ruc: string;
  emailContacto: string;
  telefonoContacto: string;
  direccion: string;
  ciudad: string;
  pais: string;
  estadoValidacion: 'PENDIENTE' | 'VERIFICADO' | 'RECHAZADO';
  tipoServicio: string;
  ownerEmail: string;
  createdAt: string;
}

export interface AdminUser {
  id: number;
  correo: string;
  nombre: string;
  rol: string;
  estado: boolean;
  createdAt: string;
}

export interface AdminVeterinario {
  id: number;
  nombres: string;
  apellidos: string;
  correo: string;
  especialidad: string;
  numeroColegiatura: string;
  biografia: string;
  aniosExperiencia: number;
  fotoPerfilUrl: string;
  estadoValidacion: 'PENDIENTE' | 'VERIFICADO' | 'RECHAZADO';
  usuarioActivo: boolean;
  createdAt: string;
}

export interface AdminStats {
  totalUsuarios: number;
  totalEmpresas: number;
  totalVeterinarios: number;
  totalAdopciones: number;
  totalServicios: number;
  totalProductos: number;
  totalOrdenes: number;
  ingresosGlobales: number;
}

export interface Category {
  id: number;
  nombre: string;
  slug: string;
  padreId: number | null;
  padreNombre: string | null;
  iconoUrl: string;
  activo: boolean;
  orden: number;
}

export interface CreateCategoryRequest {
  nombre: string;
  padreId: number | null;
  iconoUrl: string | null;
  activo: boolean;
  orden: number;
}

export interface UpdateCategoryRequest {
  nombre?: string;
  padreId?: number | null;
  iconoUrl?: string | null;
  activo?: boolean;
  orden?: number;
}
