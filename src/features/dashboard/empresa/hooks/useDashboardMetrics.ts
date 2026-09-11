import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "../services/dashboardService";

export const useDashboardMetrics = () => {
    return useQuery({
        queryKey: ["dashboard-metrics"],
        queryFn: () => dashboardService.getMetrics(),
        staleTime: 2 * 60 * 1000,
    });
};

export const useDashboardChartData = () => {
    return useQuery({
        queryKey: ["dashboard-chart-data"],
        queryFn: () => dashboardService.getChartData(),
        staleTime: 5 * 60 * 1000,
    });
};

export const useDashboardActivity = () => {
    return useQuery({
        queryKey: ["dashboard-activity"],
        queryFn: () => dashboardService.getRecentActivity(),
        staleTime: 1 * 60 * 1000,
    });
};
