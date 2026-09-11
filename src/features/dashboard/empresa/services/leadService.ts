import { api } from "../../../../shared/http/api";
import type { ApiResponse } from "../../../../shared/types/api";
import type { Lead } from "../types/lead.types";

export const leadService = {
  getMyLeads: async (): Promise<Lead[]> => {
    const { data } = await api.get<ApiResponse<Lead[]>>("/leads");
    return data.data;
  },

  countMyLeads: async (): Promise<number> => {
    const { data } = await api.get<ApiResponse<number>>("/leads/count");
    return data.data;
  },

  updateLeadStatus: async (leadId: number, estado: string): Promise<Lead> => {
    const { data } = await api.patch<ApiResponse<Lead>>(`/leads/${leadId}/status?estado=${estado}`);
    return data.data;
  },
};
