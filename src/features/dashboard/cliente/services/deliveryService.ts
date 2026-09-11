import { api } from "../../../../shared/http/api";
import type { AxiosResponse } from "axios";

export interface DeliveryTrackingDTO {
    idDelivery: number;
    ordenId: number;
    estado: string;
    clienteNombre?: string;
    clienteTelefono?: string;

    // Repartidor
    repartidorId: number | null;
    repartidorNombre: string | null;
    repartidorFoto: string | null;
    repartidorTelefono: string | null;
    repartidorVehiculo: string | null;
    repartidorCalificacionPromedio: number | null;
    repartidorLat: number | null;
    repartidorLng: number | null;

    // Origen
    origenLat: number;
    origenLng: number;
    origenDireccion: string;

    // Destino
    destinoLat: number;
    destinoLng: number;
    destinoDireccion: string;
    destinoReferencia: string | null;

    // Tiempos y costos
    tiempoEstimadoMin: number | null;
    distanciaKm: number | null;
    costoDelivery: number;

    // OTP (solo al crear, luego null)
    otpCliente: string | null;

    // Foto de entrega
    fotoEntregaUrl: string | null;

    // Timestamps
    asignadoAt: string | null;
    recogidoAt: string | null;
    entregadoAt: string | null;
    // Calificaciones
    calificacionRepartidor: number | null;
    comentarioRepartidor: string | null;
    calificacionProducto: number | null;
    comentarioProducto: string | null;

    createdAt: string | null;
}

export interface CalificacionDTO {
    calificacionRepartidor: number;
    comentarioRepartidor?: string;
    calificacionProducto: number;
    comentarioProducto?: string;
}

export const deliveryService = {
    getByOrden: (ordenId: number): Promise<AxiosResponse<DeliveryTrackingDTO>> =>
        api.get(`/deliveries/orden/${ordenId}`),

    cancelarDelivery: (deliveryId: number): Promise<AxiosResponse<DeliveryTrackingDTO>> =>
        api.post(`/deliveries/${deliveryId}/cancelar`),

    calificar: (deliveryId: number, dto: CalificacionDTO): Promise<AxiosResponse<void>> =>
        api.post(`/deliveries/${deliveryId}/calificar`, dto),
};
