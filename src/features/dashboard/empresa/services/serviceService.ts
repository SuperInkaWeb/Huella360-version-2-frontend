import { api } from "../../../../shared/http/api";
import type { ApiResponse, PageResponse } from "../../../../shared/types/api";
import type {
  Service,
  CreateServiceRequest,
  UpdateServiceRequest,
} from "../../../catalog/types/service.types";

export const serviceService = {
  /**
   * Obtiene los servicios de la empresa actual (paginado).
   */
  getMyServices: async (page = 0, size = 20): Promise<PageResponse<Service>> => {
    const { data } = await api.get<ApiResponse<PageResponse<Service>>>("/services/me", {
      params: { page, size },
    });
    return data.data;
  },

  /**
   * Crea un nuevo servicio.
   */
  createService: async (payload: CreateServiceRequest, imagen?: File): Promise<Service> => {
    const formData = new FormData();
    formData.append("data", new Blob([JSON.stringify(payload)], { type: "application/json" }));
    if (imagen) {
      formData.append("imagen", imagen);
    }

    const { data } = await api.post<ApiResponse<Service>>("/services", formData);
    return data.data;
  },

  /**
   * Actualiza parcialmente un servicio existente.
   */
  updateService: async (id: number, payload: UpdateServiceRequest, imagen?: File): Promise<Service> => {
    const formData = new FormData();
    formData.append("data", new Blob([JSON.stringify(payload)], { type: "application/json" }));
    if (imagen) {
      formData.append("imagen", imagen);
    }

    const { data } = await api.patch<ApiResponse<Service>>(`/services/${id}`, formData);
    return data.data;
  },

  /**
   * Elimina (desactiva) un servicio.
   */
  deleteService: async (id: number): Promise<void> => {
    await api.delete(`/services/${id}`);
  },
};
