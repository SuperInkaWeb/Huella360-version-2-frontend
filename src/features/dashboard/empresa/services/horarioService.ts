import { api } from "../../../../shared/http/api";
import type { ApiResponse } from "../../../../shared/types/api";
import type { HorarioAtencion } from "../types/horario.types";

export const horarioService = {
  getHorarios: async (): Promise<HorarioAtencion[]> => {
    const { data } = await api.get<ApiResponse<HorarioAtencion[]>>("/companies/me/horarios");
    return data.data;
  },

  guardarHorarios: async (horarios: HorarioAtencion[]): Promise<HorarioAtencion[]> => {
    const { data } = await api.put<ApiResponse<HorarioAtencion[]>>("/companies/me/horarios", horarios);
    return data.data;
  },
};
