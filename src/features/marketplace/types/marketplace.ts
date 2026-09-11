export interface Category {
  id: number;
  nombre: string;
  slug?: string;
  descripcion?: string;
  padreId?: number;
  padreNombre?: string;
  iconoUrl?: string;
  activo?: boolean;
  orden?: number;
}

export interface Product {
  id: number | string;
  nombre: string;
  descripcion: string;
  precio: number;
  precioOferta?: number;
  precioActual: number;
  stock: number;
  imagenes: string[];
  categoriaId: number;
  categoriaNombre: string;
  empresaId: number;
  empresaNombre: string;
  empresaTipoServicio?: string;
  mpPublicKey?: string;
  badge?: { text: string; style: 'rx' | 'service' | 'approved' | 'adoption' };
  itemType?: 'product' | 'service' | 'adoption';
}

export interface MarketplaceFilters {
  q?: string;
  category?: number;
  page?: number;
  size?: number;
  sort?: string;
}

export interface CompanyResponse {
  id: number;
  usuarioPropietarioId: number;
  nombreComercial: string;
  razonSocial: string;
  ruc: string;
  descripcion: string;
  tipoServicio: string;
  telefonoContacto: string;
  emailContacto: string;
  direccion: string;
  ciudad: string;
  pais: string;
  latitud?: number;
  longitud?: number;
  logoUrl: string;
  bannerUrl: string;
  mpPublicKey: string;
  estadoValidacion: string;
}

export interface ServiceResponse {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  duracionMinutos: number;
  modalidad: string;
  imagenUrl?: string;
  empresaId?: number;
  empresaNombre?: string;
  empresaTipoServicio?: string;
  veterinarioId?: number;
  veterinarioNombres?: string;
  veterinarioApellidos?: string;
  veterinarioEspecialidad?: string;
  mpPublicKey?: string;
}

export interface AdoptionResponse {
  id: number;
  titulo: string;
  historia: string;
  mascotaFotoUrl?: string;
  publicadoPorId: number;
  publicadoPorNombre?: string;
  publicadoPorTipoServicio?: string;
  estado?: string;
}
