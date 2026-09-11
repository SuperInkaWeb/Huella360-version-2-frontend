import { api } from "../../../shared/http/api";

export const healthCardService = {
  downloadHealthCard: async (mascotaId: number): Promise<Blob> => {
    const response = await api.get(`/pets/${mascotaId}/health-card`, {
      responseType: "blob",
    });
    return response.data;
  },
};
