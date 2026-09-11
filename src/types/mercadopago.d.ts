export { };

declare global {
    interface Window {
        MercadoPago: any;
    }
}

export type EstadoOrden = 'PENDIENTE' | 'PAGADO' | 'CANCELADO' | 'FALLIDO';

export interface OrderItem {
    id: number;
    productoId: number | null;
    productoNombre: string | null;
    servicioId: number | null;
    servicioNombre: string | null;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
}

export interface Order {
    id: number;
    codigoOrden: string;
    clienteNombre: string;
    empresaId: number;
    empresaNombre: string;
    subtotal: number;
    costoEnvio: number;
    comisionPlataforma: number;
    descuento: number;
    total: number;
    estado: EstadoOrden;
    metodoPago: string;
    createdAt: string;
    items: OrderItem[];
}