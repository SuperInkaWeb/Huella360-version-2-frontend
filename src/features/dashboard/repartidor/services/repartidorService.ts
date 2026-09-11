import { api } from "../../../../shared/http/api"; // Ajusta a la ruta de tu axios
import type { AxiosResponse } from "axios";
import type { RepartidorResponseDTO, DeliveryResponseDTO, DeliveryStatus } from "../types/delivery";
import type { ApiResponse } from "../../../../shared/types/api";

export const repartidorService = {
    getPerfil: (): Promise<AxiosResponse<ApiResponse<RepartidorResponseDTO>>> => 
        api.get("/repartidores/me"),

    actualizarPerfil: (data: FormData): Promise<AxiosResponse<ApiResponse<RepartidorResponseDTO>>> =>
        api.put("/repartidores/me", data),

    actualizarUbicacion: (lat: number, lng: number): Promise<AxiosResponse<ApiResponse<void>>> => 
        api.patch(`/repartidores/me/ubicacion`, { lat, lng }),
        
    cambiarDisponibilidad: (disponible: boolean): Promise<AxiosResponse<ApiResponse<void>>> => 
        api.patch(`/repartidores/me/disponibilidad?disponible=${disponible}`),
    
    getDeliveriesActivos: (): Promise<AxiosResponse<ApiResponse<DeliveryResponseDTO[]>>> => 
        api.get("/repartidores/me/deliveries-activos"),
    
    cambiarEstado: (deliveryId: number, nuevoEstado: DeliveryStatus, descripcion: string = ""): Promise<AxiosResponse<ApiResponse<DeliveryResponseDTO>>> => 
        api.patch(`/deliveries/${deliveryId}/estado`, { nuevoEstado, descripcion }),
    
    confirmarOTP: (deliveryId: number, codigo: string): Promise<AxiosResponse<ApiResponse<void>>> => 
        api.post(`/deliveries/${deliveryId}/confirmar-otp`, { codigo }),
        
    confirmarFoto: (deliveryId: number, fotoFile: File): Promise<AxiosResponse<ApiResponse<void>>> => {
        const formData = new FormData();
        formData.append("foto", fotoFile);
        return api.post(`/deliveries/${deliveryId}/confirmar-foto`, formData);
    },

    getPedidosDisponibles: (): Promise<AxiosResponse<ApiResponse<DeliveryResponseDTO[]>>> => 
        api.get("/deliveries/disponibles"),

    aceptarPedido: (deliveryId: number): Promise<AxiosResponse<ApiResponse<DeliveryResponseDTO>>> => 
        api.post(`/deliveries/${deliveryId}/aceptar`),

    rechazarPedido: (deliveryId: number): Promise<AxiosResponse<ApiResponse<DeliveryResponseDTO>>> => 
        api.post(`/deliveries/${deliveryId}/rechazar`),

    reportarIncidencia: (deliveryId: number, motivo: string, descripcion: string, foto?: File): Promise<AxiosResponse<ApiResponse<void>>> => {
        const formData = new FormData();
        
        // Empaquetar datos en un JSON Blob como lo espera el @RequestPart del backend
        const data = { motivo, descripcion };
        formData.append("data", new Blob([JSON.stringify(data)], { type: "application/json" }), "blob.json");
        
        if (foto) formData.append("foto", foto);
        
        return api.post(`/deliveries/${deliveryId}/incidencia`, formData);
    },

    getHistorial: (): Promise<AxiosResponse<ApiResponse<DeliveryResponseDTO[]>>> =>
        api.get("/repartidores/me/historial")
};