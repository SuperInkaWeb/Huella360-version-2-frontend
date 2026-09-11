import { api } from "../../../../shared/http/api";
import type { ApiResponse } from "../../../../shared/types/api";
import type { StaffMember, InviteStaffRequest } from "../types/staff.types";

export const staffService = {
  /**
   * Obtiene la lista de veterinarios del staff de la empresa actual.
   */
  getMyStaff: async (): Promise<StaffMember[]> => {
    const { data } = await api.get<ApiResponse<StaffMember[]>>("/companies/staff");
    return data.data;
  },

  /**
   * Envía una invitación a un veterinario para unirse al staff.
   */
  inviteStaff: async (payload: InviteStaffRequest): Promise<StaffMember> => {
    const { data } = await api.post<ApiResponse<StaffMember>>("/companies/staff/invite", payload);
    return data.data;
  },

  /**
   * Remueve un veterinario del staff de la empresa.
   */
  removeStaff: async (veterinarioId: number): Promise<void> => {
    await api.delete(`/companies/staff/${veterinarioId}`);
  },
};
