import { api } from "../../../../shared/http/api";
import type { ApiResponse, PageResponse } from "../../../../shared/types/api";
import type { ClienteCrm } from "../types/crm.types";

export const crmService = {
  /**
   * Obtiene los clientes de la empresa autenticada con estadisticas de CRM
   * (total gastado, pedidos, citas, ultima compra), paginado.
   */
  getClientes: async (page = 0, size = 20, q?: string): Promise<PageResponse<ClienteCrm>> => {
    const { data } = await api.get<ApiResponse<PageResponse<ClienteCrm>>>("/clients/empresa/crm", {
      params: { page, size, q: q || undefined },
    });
    return data.data;
  },
};
