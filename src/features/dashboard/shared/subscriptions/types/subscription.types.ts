export type EstadoSuscripcion = 'ACTIVA' | 'CANCELADA' | 'EXPIRADA' | 'PENDIENTE_PAGO';

export interface Plan {
    id: number;
    nombre: string;
    descripcion: string;
    precioMensual: number;
    limiteMascotas: number;
    limiteProductos: number;
    limiteServicios: number;
    limiteRecordatorios: number;
    limiteIaUso: number;
    tipo: string;
    activo: boolean;
}

export interface Suscripcion {
    id: number;
    empresaId: number | null;
    veterinarioId: number | null;
    usuarioId: number | null;
    plan: Plan;
    fechaInicio: string;
    fechaFin: string | null;
    estado: EstadoSuscripcion;
    mpNextPaymentDate: string | null;
}

export interface SubscriptionUsage {
    currentPets: number;
    maxPets: number;
    petPercentage: number;
    currentProducts: number;
    maxProducts: number;
    productPercentage: number;
    currentServices: number;
    maxServices: number;
    servicePercentage: number;
}

export interface PaymentPreference {
    preferenceId: string;
    initPoint: string;
    sandboxInitPoint: string;
}
