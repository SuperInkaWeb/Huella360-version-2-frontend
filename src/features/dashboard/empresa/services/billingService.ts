import { api } from "../../../../shared/http/api";
import type { ApiResponse, PageResponse } from "../../../../shared/types/api";
import type { OrderSummary } from "../types/billing.types";

interface PaymentPreferenceResponse {
  preferenceId: string;
  initPoint: string;
  sandboxInitPoint: string;
}

export const billingService = {
  /**
   * Obtiene las órdenes de la empresa autenticada (paginado).
   */
  getMyOrders: async (
    page = 0, 
    size = 20, 
    filters: { estado?: string; codigoOrden?: string; startDate?: string; endDate?: string } = {}
  ): Promise<PageResponse<OrderSummary>> => {
    const { data } = await api.get<ApiResponse<PageResponse<OrderSummary>>>("/orders/me", {
      params: { page, size, ...filters },
    });
    return data.data;
  },

  /**
   * Genera un link de pago (checkout) de MercadoPago para una orden.
   * Endpoint: POST /payments/checkout/{orderId}
   * Retorna la URL de checkout (initPoint o sandboxInitPoint).
   */
  generateCheckout: async (orderId: number): Promise<string> => {
    const { data } = await api.post<ApiResponse<PaymentPreferenceResponse>>(`/payments/checkout/${orderId}`);
    const response = data.data;
    return response.sandboxInitPoint || response.initPoint;
  },
};
