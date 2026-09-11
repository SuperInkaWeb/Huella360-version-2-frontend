import { api } from "../../../../shared/http/api";
import type { ApiResponse } from "../../../../shared/types/api";

export interface Patient {
    id: number;
    nombre: string;
    especie: string;
    raza: string;
    sexo?: string;
    fechaNacimiento: string;
    pesoKg: number;
    fotoUrl?: string;
    esterilizado: boolean;
    observacionesMedicas?: string;
    createdAt: string;
}

export const patientService = {
    /**
     * Obtiene los pacientes que han sido atendidos en esta veterinaria.
     * Endpoint: GET /companies/me/patients
     */
    getMyPatients: async (): Promise<Patient[]> => {
        const { data } = await api.get<ApiResponse<Patient[]>>("/companies/me/patients");
        return data.data;
    },
};
