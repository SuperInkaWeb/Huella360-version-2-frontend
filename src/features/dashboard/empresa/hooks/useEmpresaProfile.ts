import { useQuery } from "@tanstack/react-query";
import { api } from "../../../../shared/http/api";
import type { ApiResponse } from "../../../../shared/types/api";

export interface EmpresaProfile {
    id: number;
    propietarioId: number;
    nombreComercial: string;
    razonSocial: string;
    ruc: string;
    descripcion?: string;
    tipoServicio?: string;
    telefono?: string;
    emailContacto?: string;
    direccion?: string;
    ciudad?: string;
    pais?: string;
    latitud?: number;
    longitud?: number;
    logoUrl?: string;
    bannerUrl?: string;
    mpPublicKey?: string;
    estadoValidacion?: string;
}

/**
 * Shared hook for empresa profile data.
 * Cached for 5 min — profile rarely changes.
 * Used by: EmpresaCitasPage, DashboardHome, and any page needing empresa data.
 */
export const useEmpresaProfile = () => {
    return useQuery({
        queryKey: ["empresa-profile"],
        queryFn: async () => {
            const { data } = await api.get<ApiResponse<EmpresaProfile>>("/companies/me");
            return data.data;
        },
        staleTime: 5 * 60 * 1000,
    });
};
