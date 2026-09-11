import { api } from "../../../shared/http/api";
import type { Consulta, ChatMensaje } from "../types/teleconsulta.types";

export const teleconsultaService = {
  // Create a new consultation
  createConsulta: async (veterinarioId: number, mascotaId?: number, mensajeInicial?: string): Promise<Consulta> => {
    const params = new URLSearchParams();
    params.append("veterinarioId", veterinarioId.toString());
    if (mascotaId) params.append("mascotaId", mascotaId.toString());
    if (mensajeInicial) params.append("mensajeInicial", mensajeInicial);
    const { data } = await api.post(`/teleconsultas?${params.toString()}`);
    return data.data;
  },

  // Get my consultations
  getMyConsultas: async (): Promise<Consulta[]> => {
    const { data } = await api.get("/teleconsultas");
    return data.data;
  },

  // Get messages for a consultation
  getMensajes: async (consultaId: number): Promise<ChatMensaje[]> => {
    const { data } = await api.get(`/teleconsultas/${consultaId}/mensajes`);
    return data.data;
  },

  // Send a message
  sendMessage: async (consultaId: number, contenido: string, tipo?: string): Promise<ChatMensaje> => {
    const { data } = await api.post(`/teleconsultas/${consultaId}/mensajes`, {
      contenido,
      tipo: tipo || "TEXTO",
    });
    return data.data;
  },

  // Accept consultation (veterinarian)
  acceptConsulta: async (consultaId: number): Promise<Consulta> => {
    const { data } = await api.patch(`/teleconsultas/${consultaId}/accept`);
    return data.data;
  },

  // Start consultation (veterinarian)
  startConsulta: async (consultaId: number): Promise<Consulta> => {
    const { data } = await api.patch(`/teleconsultas/${consultaId}/start`);
    return data.data;
  },

  // Finish consultation
  finishConsulta: async (consultaId: number): Promise<Consulta> => {
    const { data } = await api.patch(`/teleconsultas/${consultaId}/finish`);
    return data.data;
  },

  // Cancel consultation
  cancelConsulta: async (consultaId: number): Promise<Consulta> => {
    const { data } = await api.patch(`/teleconsultas/${consultaId}/cancel`);
    return data.data;
  },
};
