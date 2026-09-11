export type ProductStatus = 'ACTIVO' | 'INACTIVO' | 'AGOTADO';

export interface Product {
    id: number;
    nombre: string;
    descripcion?: string;
    precio: number;
    precioOferta?: number;
    precioActual: number;
    ofertaInicio?: string;
    ofertaFin?: string;
    stock: number;
    sku: string;
    estado: ProductStatus;
    imagenes: string[];
    categoriaId: number;
    categoriaNombre: string;
    empresaId: number;
    empresaNombre: string;
    activo: boolean;
    visible: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateProductRequest {
    nombre: string;
    descripcion?: string;
    precio: number;
    precioOferta?: number;
    ofertaInicio?: string;
    ofertaFin?: string;
    stock: number;
    sku?: string;
    categoriaId: number;
    visible: boolean;
}

export interface UpdateProductRequest {
    nombre?: string;
    descripcion?: string;
    precio?: number;
    precioOferta?: number;
    ofertaInicio?: string;
    ofertaFin?: string;
    stock?: number;
    sku?: string;
    categoriaId?: number;
    visible?: boolean;
    estado?: string;
    actualizarOferta?: boolean;
}
