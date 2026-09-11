export interface Category {
    id: number;
    nombre: string;
    slug: string;
    padreId?: number;
    padreNombre?: string;
    iconoUrl?: string;
    activo: boolean;
    orden: number;
}
