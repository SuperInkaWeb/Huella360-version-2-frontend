import { useQuery } from "@tanstack/react-query";
import { vetService } from "../services/vetService";

/**
 * Shared hook for veterinarian profile data.
 * Cached for 5 min — profile rarely changes.
 * Used by: VetHomePage, VetCitasPage, VetConfiguracionPage, VetServiciosPage.
 */
export const useVetProfile = () => {
    return useQuery({
        queryKey: ["vet-profile"],
        queryFn: () => vetService.getMyProfile(),
        staleTime: 5 * 60 * 1000,
    });
};
