import { api } from "../../../../shared/http/api";
import type { ApiResponse, PageResponse } from "../../../../shared/types/api";
import type { VetProfile, StaffInvitation } from "../types/vet.types";
import type { Service } from "../../../catalog/types/service.types";

export const vetService = {
  /**
   * Obtiene el perfil del veterinario autenticado.
   * Endpoint: GET /veterinarians/me
   */
  getMyProfile: async (): Promise<VetProfile> => {
    const { data } = await api.get<ApiResponse<VetProfile>>("/veterinarians/me");
    return data.data;
  },

  /**
   * Obtiene los servicios del veterinario autenticado (paginado).
   * Endpoint: GET /services/me
   */
  getMyServices: async (page = 0, size = 20): Promise<PageResponse<Service>> => {
    const { data } = await api.get<ApiResponse<PageResponse<Service>>>("/services/me", {
      params: { page, size },
    });
    return data.data;
  },

  /**
   * Obtiene las invitaciones de staff pendientes del veterinario.
   * Endpoint: GET /companies/staff/invitations
   */
  getMyInvitations: async (): Promise<StaffInvitation[]> => {
    const { data } = await api.get<ApiResponse<StaffInvitation[]>>("/companies/staff/invitations");
    return data.data;
  },

  /**
   * Acepta una invitación de staff.
   * Endpoint: PUT /companies/staff/invitations/{staffId}/accept
   */
  acceptInvitation: async (staffId: number): Promise<void> => {
    await api.put(`/companies/staff/invitations/${staffId}/accept`);
  },

  /**
   * Rechaza una invitación de staff.
   * Endpoint: PUT /companies/staff/invitations/{staffId}/reject
   */
  rejectInvitation: async (staffId: number): Promise<void> => {
    await api.put(`/companies/staff/invitations/${staffId}/reject`);
  },

  /**
   * Actualiza el perfil del veterinario.
   * Endpoint: PUT /veterinarians/profile
   */
  updateProfile: async (profile: Partial<VetProfile>): Promise<VetProfile> => {
    const { data } = await api.put<ApiResponse<VetProfile>>("/veterinarians/profile", profile);
    return data.data;
  },

  /**
   * Crea un nuevo servicio.
   * Endpoint: POST /services
   */
  createService: async (serviceData: any, imagen: File): Promise<Service> => {
    const formData = new FormData();
    // Importante: el Blob asegura que Spring lo lea como JSON
    formData.append("data", new Blob([JSON.stringify(serviceData)], { type: "application/json" }));
    formData.append("imagen", imagen);

    // QUITA el objeto de headers, deja solo formData
    const { data } = await api.post<ApiResponse<Service>>("/services", formData);

    return data.data;
  },

  /**
   * Actualiza un servicio existente
   */
  updateService: async (id: number, serviceData: any, imagen?: File): Promise<Service> => {
    const formData = new FormData();
    formData.append("data", new Blob([JSON.stringify(serviceData)], { type: "application/json" }));

    if (imagen) {
      formData.append("imagen", imagen);
    }

    // QUITA el objeto de headers
    const { data } = await api.patch<ApiResponse<Service>>(`/services/${id}`, formData);

    return data.data;
  },

  /**
   * Elimina (soft delete) un servicio.
   * Endpoint: DELETE /services/{id}
   */
  deleteService: async (id: number): Promise<void> => {
    await api.delete(`/services/${id}`);
  },

  /**
   * Obtiene los pacientes (mascotas) que han tenido citas con este veterinario.
   * Endpoint: GET /veterinarians/me/patients
   */
  getMyPatients: async (): Promise<any[]> => {
    const { data } = await api.get<ApiResponse<any[]>>("/veterinarians/me/patients");
    return data.data;
  },

  /**
   * Obtiene el historial médico de una mascota.
   */
  getMedicalHistory: async (mascotaId: number): Promise<any[]> => {
    const { data } = await api.get<ApiResponse<any[]>>(`/medical-records/pet/${mascotaId}`);
    return data.data;
  },

  /**
   * Registra una nueva entrada en la historia clínica.
   */
  addMedicalRecord: async (recordData: any): Promise<any> => {
    const { data } = await api.post<ApiResponse<any>>("/medical-records", recordData);
    return data.data;
  },
};
