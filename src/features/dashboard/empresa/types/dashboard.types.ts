export interface TopProducto {
    productoId: number;
    nombreProducto: string;
    cantidadVendida: number;
    totalVendido: number;
}

export interface TopServicio {
    servicioId: number;
    nombreServicio: string;
    totalCitas: number;
    totalIngresos: number;
}

export interface DashboardMetrics {
    totalVentasMes: number;
    ventasSemana: number;
    ventasMesAnterior: number;
    ordenesPendientes: number;
    ordenesPagadasHoy: number;
    clientesActivos: number;
    citasHoy: number;
    citasPendientes: number;
    topProductos: TopProducto[];
    topServicios: TopServicio[];
}

export interface VentaDiaria {
    fecha: string;
    total: number;
    cantidadOrdenes: number;
}

export interface ActividadReciente {
    id: number;
    tipo: string;
    descripcion: string;
    clienteNombre: string;
    monto: number | null;
    estado: string;
    fecha: string;
}
