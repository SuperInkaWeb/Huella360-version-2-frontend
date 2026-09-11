import { api } from "../../../../../shared/http/api";
import type {
  AdoptionResponse,
  ApplicationResponse,
  CreateAdoptionDto,
  ApplyAdoptionDto,
  RespondApplicationDto,
} from "../types/adoption.types";

export interface Page<T> {
  content: T[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

const BASE_URL = "/adoptions";

export const adoptionService = {
  /**
   * Publicar una mascota en adopción.
   * Requiere que el usuario sea el dueño de la mascota.
   */
  async publishAdoption(dto: CreateAdoptionDto): Promise<AdoptionResponse> {
    const response = await api.post<{ data: AdoptionResponse }>(BASE_URL, dto);
    return response.data.data;
  },

  /**
   * Obtener adpciones disponibles paginadas.
   */
  async getAvailableAdoptions(page = 0, size = 20): Promise<Page<AdoptionResponse>> {
    const response = await api.get<{ data: Page<AdoptionResponse> }>(BASE_URL, {
      params: { page, size },
    });
    return response.data.data;
  },

  /**
   * Obtener las adopciones publicadas por el usuario actual.
   */
  async getMyAdoptions(): Promise<AdoptionResponse[]> {
    const response = await api.get<{ data: AdoptionResponse[] }>(`${BASE_URL}/me`);
    return response.data.data;
  },

  /**
   * Obtener las solicitudes de adopción enviadas por el usuario actual.
   */
  async getMySentApplications(): Promise<ApplicationResponse[]> {
    const response = await api.get<{ data: ApplicationResponse[] }>(`${BASE_URL}/applications/me`);
    return response.data.data;
  },

  /**
   * Postular a una adopción.
   */
  async applyForAdoption(adopcionId: number, dto: ApplyAdoptionDto): Promise<void> {
    await api.post(`${BASE_URL}/${adopcionId}/apply`, dto);
  },

  /**
   * Obtener postulaciones recibidas para una adopción específica.
   * Requiere ser el dueño de la adopción.
   */
  async getApplicationsForMyAdoption(adopcionId: number): Promise<ApplicationResponse[]> {
    const response = await api.get<{ data: ApplicationResponse[] }>(
      `${BASE_URL}/${adopcionId}/applications`,
    );
    return response.data.data;
  },

  /**
   * Responder (aprobar o rechazar) a una postulación.
   */
  async respondToApplication(solicitudId: number, dto: RespondApplicationDto): Promise<void> {
    await api.patch(`${BASE_URL}/applications/${solicitudId}/response`, dto);
  },
};
