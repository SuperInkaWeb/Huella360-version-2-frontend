import { api } from "../../../../shared/http/api";
import type { ApiResponse } from "../../../../shared/types/api";
import type { ReferralCountResponse } from "../types/referral.types";

export const referralService = {
  getMyCode: async (): Promise<string> => {
    const { data } = await api.get<ApiResponse<string>>("/referrals/code");
    return data.data;
  },

  getMyCount: async (): Promise<ReferralCountResponse> => {
    const { data } = await api.get<ApiResponse<ReferralCountResponse>>("/referrals/count");
    return data.data;
  },

  applyCode: async (codigo: string): Promise<void> => {
    await api.post(`/referrals/apply?codigo=${encodeURIComponent(codigo)}`);
  },
};
