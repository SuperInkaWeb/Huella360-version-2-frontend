import { api } from "../../../../shared/http/api";
import type { ApiResponse } from "../../../../shared/types/api";

export const deliveryEmpresaService = {
    getRatings: async (): Promise<any[]> => {
        const { data } = await api.get<ApiResponse<any[]>>("/deliveries/empresa/ratings");
        return data.data || [];
    },
    reintentarDelivery: async (orderId: number): Promise<void> => {
        await api.post(`/deliveries/orden/${orderId}/reintentar`);
    },
};
