import { api } from "../../../shared/http/api";
import type { HealthAlertResponse } from "../types/ia-alerts.types";

export const iaAlertsService = {
  generateHealthAlerts: async (
    mascotaId: number,
    diagnostico?: string,
    tratamiento?: string,
    notas?: string,
    pesoKg?: number
  ): Promise<HealthAlertResponse> => {
    const { data } = await api.post("/ia/health-alerts", {
      mascotaId,
      diagnostico,
      tratamiento,
      notas,
      pesoKg,
    });
    return data.data;
  },
};
