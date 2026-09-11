import { api } from "../../../../shared/http/api";
import type { ApiResponse } from "../../../../shared/types/api";

export interface CitaRequest {
    mascotaId?: number;
    servicioId: number;
    empresaId: number;
    veterinarioId?: number;
    fechaProgramada: string; // "YYYY-MM-DD"
    horaInicio: string;      // "HH:mm"
    notasCliente?: string;
}

export interface CitaResponse {
    id: number;
    clienteNombre: string;
    mascotaNombre: string;
    servicioNombre: string;
    veterinarioNombre: string;
    fechaProgramada: string;
    horaInicio: string;
    horaFin: string;
    estado: 'SOLICITADA' | 'CONFIRMADA' | 'RECHAZADA' | 'COMPLETADA' | 'CANCELADA' | 'NOSHOW';
    notasCliente?: string;
    notasInternas?: string;
    guestNombre?: string;
    guestEmail?: string;
    guestTelefono?: string;
}

export interface CrearCitaEmpresaRequest {
    clienteId?: number;
    guestNombre?: string;
    guestEmail?: string;
    guestTelefono?: string;
    mascotaId?: number;
    servicioId: number;
    veterinarioId?: number;
    fechaProgramada: string;
    horaInicio: string;
    notasCliente?: string;
    notasInternas?: string;
}

export const appointmentService = {
    create: async (request: CitaRequest): Promise<CitaResponse> => {
        const { data } = await api.post<ApiResponse<CitaResponse>>("/appointments", request);
        return data.data;
    },

    getMyCitas: async (): Promise<CitaResponse[]> => {
        const { data } = await api.get<ApiResponse<CitaResponse[]>>("/appointments/me");
        return data.data;
    },

    getCitasByEmpresa: async (empresaId: number): Promise<CitaResponse[]> => {
        const { data } = await api.get<ApiResponse<CitaResponse[]>>(`/appointments/empresa/${empresaId}`);
        return data.data;
    },

    updateStatus: async (citaId: number, estado: string, notas?: string): Promise<CitaResponse> => {
        const params: any = { estado };
        if (notas) params.notas = notas;
        const { data } = await api.patch<ApiResponse<CitaResponse>>(`/appointments/${citaId}/status`, null, { params });
        return data.data;
    },

    createForEmpresa: async (request: CrearCitaEmpresaRequest): Promise<CitaResponse> => {
        const { data } = await api.post<ApiResponse<CitaResponse>>("/appointments/empresa", request);
        return data.data;
    },

    getAvailableSlots: async (empresaId: number, servicioId: number, fecha: string): Promise<string[]> => {
        const { data } = await api.get<ApiResponse<string[]>>("/appointments/available-slots", {
            params: { empresaId, servicioId, fecha },
        });
        return data.data;
    },
};
