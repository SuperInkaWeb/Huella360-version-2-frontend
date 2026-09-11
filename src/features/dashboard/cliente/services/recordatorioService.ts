import { api } from "../../../../shared/http/api";
import type { ApiResponse } from "../../../../shared/types/api";
import type { Recordatorio, CreateRecordatorioRequest } from "../types/recordatorio.types";

export const recordatorioService = {
  getMyRecordatorios: async (): Promise<Recordatorio[]> => {
    const { data } = await api.get<ApiResponse<Recordatorio[]>>("/recordatorios");
    return data.data;
  },

  createRecordatorio: async (request: CreateRecordatorioRequest): Promise<Recordatorio> => {
    const { data } = await api.post<ApiResponse<Recordatorio>>("/recordatorios", request);
    return data.data;
  },

  deleteRecordatorio: async (id: number): Promise<void> => {
    await api.delete(`/recordatorios/${id}`);
  },
};
