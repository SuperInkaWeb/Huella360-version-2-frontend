import { api } from "../../../../shared/http/api";
import type { ApiResponse } from "../../../../shared/types/api";
import type { ChatRoom, ChatMensaje } from "./types/chat.types";

export const chatService = {
  abrirChatConEmpresa: async (empresaId: number): Promise<ChatRoom> => {
    const { data } = await api.post<ApiResponse<ChatRoom>>(`/chats/empresa/${empresaId}`);
    return data.data;
  },

  getMisChats: async (): Promise<ChatRoom[]> => {
    const { data } = await api.get<ApiResponse<ChatRoom[]>>("/chats");
    return data.data;
  },

  getMensajes: async (roomId: number): Promise<ChatMensaje[]> => {
    const { data } = await api.get<ApiResponse<ChatMensaje[]>>(`/chats/${roomId}/mensajes`);
    return data.data;
  },

  enviarMensaje: async (roomId: number, contenido: string): Promise<ChatMensaje> => {
    const { data } = await api.post<ApiResponse<ChatMensaje>>(`/chats/${roomId}/mensajes`, { contenido });
    return data.data;
  },

  marcarComoLeido: async (roomId: number): Promise<void> => {
    await api.patch(`/chats/${roomId}/leido`);
  },
};
