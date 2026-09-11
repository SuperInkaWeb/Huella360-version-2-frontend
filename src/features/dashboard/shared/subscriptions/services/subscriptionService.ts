import { api } from "../../../../../shared/http/api";
import type { ApiResponse } from "../../../../../shared/types/api";
import type { Plan, Suscripcion, SubscriptionUsage, PaymentPreference } from "../types/subscription.types";

const BASE_URL = "/subscriptions";

export const subscriptionService = {
    /**
   * Obtiene las métricas de uso de la empresa/veterinario actual (basado en token)
   */
    getUsageMetrics: async (): Promise<SubscriptionUsage> => {
        const { data } = await api.get<ApiResponse<SubscriptionUsage>>(`${BASE_URL}/usage/me`);
        return data.data;
    },

    /**
     * Obtener todos los planes activos. Opcionalmente filtrar por tipo (B2C, B2B).
     */
    async getPlans(tipo?: string): Promise<Plan[]> {
        const params = tipo ? { tipo } : {};
        const response = await api.get<{ data: Plan[] }>(`${BASE_URL}/plans`, { params });
        return response.data.data;
    },

    /**
   * Obtiene la suscripción del usuario actual (basado en token)
   */
    getMySubscription: async (): Promise<Suscripcion> => {
        const { data } = await api.get<ApiResponse<Suscripcion>>(`${BASE_URL}/me`);
        return data.data;
    },

    /**
     * Actualizar el plan (solo para planes gratuitos).
     */
    async updatePlan(planId: number): Promise<Suscripcion> {
        const response = await api.patch<{ data: Suscripcion }>(`${BASE_URL}/update-plan`, null, {
            params: { planId }
        });
        return response.data.data;
    },

    /**
     * Genera una preferencia de pago en Mercado Pago para un plan específico.
     */
    async createSubscriptionCheckout(planId: number): Promise<PaymentPreference> {
        const { data } = await api.post<ApiResponse<PaymentPreference>>(`${BASE_URL}/checkout/${planId}`);
        return data.data;
    },

    /**
     * Alterna el estado activo/inactivo de un plan (Solo Admin).
     */
    async togglePlanStatus(planId: number): Promise<void> {
        await api.patch(`${BASE_URL}/plans/${planId}/toggle`);
    },

    /**
     * Sincroniza un pago de suscripción aprobado manualmente.
     * Endpoint: GET /payments/sync?payment_id=X&external_reference=Y
     */
    async syncPayment(paymentId: string, externalReference?: string): Promise<void> {
        await api.get(`/payments/sync`, {
            params: { payment_id: paymentId, external_reference: externalReference || '' }
        });
    },

    /**
     * Cancela la suscripción actual del usuario.
     * Endpoint: PATCH /subscriptions/cancel
     */
    async cancelSubscription(): Promise<void> {
        await api.patch(`${BASE_URL}/cancel`);
    }
};
