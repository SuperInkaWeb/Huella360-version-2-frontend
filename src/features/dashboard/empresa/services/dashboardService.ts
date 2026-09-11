import { api } from "../../../../shared/http/api";
import type { ApiResponse } from "../../../../shared/types/api";
import type { DashboardMetrics, VentaDiaria, ActividadReciente } from "../types/dashboard.types";

export const dashboardService = {
    getMetrics: async (): Promise<DashboardMetrics> => {
        const { data } = await api.get<ApiResponse<DashboardMetrics>>("/dashboard");
        return data.data;
    },

    getChartData: async (): Promise<VentaDiaria[]> => {
        const { data } = await api.get<ApiResponse<VentaDiaria[]>>("/dashboard/chart-data");
        return data.data;
    },

    getRecentActivity: async (): Promise<ActividadReciente[]> => {
        const { data } = await api.get<ApiResponse<ActividadReciente[]>>("/dashboard/recent-activity");
        return data.data;
    },
};
