import { api } from "../../../../shared/http/api";
import type { ApiResponse } from "../../../../shared/types/api";
import type { ClienteProfile, UpdateClienteRequest } from "../types/cliente.types";

export const clienteService = {
  /**
   * Obtiene el perfil personal del cliente autenticado.
   * Endpoint: GET /clients/me
   */
  getMyProfile: async (): Promise<ClienteProfile> => {
    const { data } = await api.get<ApiResponse<ClienteProfile>>("/clients/me");
    return data.data;
  },

  /**
   * Actualiza el perfil personal del cliente autenticado.
   * Endpoint: PUT /clients/me (Multipart)
   */
  updateMyProfile: async (payload: UpdateClienteRequest, foto?: File): Promise<ClienteProfile> => {
    const formData = new FormData();

    // Empaquetar el JSON en un Blob como 'data'
    formData.append(
      "data",
      new Blob([JSON.stringify(payload)], { type: "application/json" }),
      "profile.json",
    );

    // Añadir la foto si existe
    if (foto) {
      formData.append("foto", foto);
    }

    const { data } = await api.put<ApiResponse<ClienteProfile>>("/clients/me", formData);
    return data.data;
  },
};
