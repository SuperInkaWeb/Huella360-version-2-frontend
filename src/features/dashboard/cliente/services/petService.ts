import { api } from "../../../../shared/http/api";
import type { ApiResponse } from "../../../../shared/types/api";
import type { Pet, CreatePetRequest, UpdatePetRequest } from "../types/pet.types";

export const petService = {
  getMyPets: async (): Promise<Pet[]> => {
    const { data } = await api.get<ApiResponse<Pet[]>>("/pets");
    return data.data;
  },

  getPetById: async (id: number): Promise<Pet> => {
    const { data } = await api.get<ApiResponse<Pet>>(`/pets/${id}`);
    return data.data;
  },

  createPet: async (request: CreatePetRequest, foto?: File): Promise<Pet> => {
    const formData = new FormData();
    formData.append("data", new Blob([JSON.stringify(request)], { type: "application/json" }));

    if (foto) {
      formData.append("foto", foto);
    }

    const { data } = await api.post<ApiResponse<Pet>>("/pets", formData);
    return data.data;
  },

  updatePet: async (id: number, request: UpdatePetRequest, foto?: File): Promise<Pet> => {
    const formData = new FormData();
    formData.append("data", new Blob([JSON.stringify(request)], { type: "application/json" }));

    if (foto) {
      formData.append("foto", foto);
    }

    const { data } = await api.put<ApiResponse<Pet>>(`/pets/${id}`, formData);
    return data.data;
  },

  deletePet: async (id: number): Promise<void> => {
    await api.delete(`/pets/${id}`);
  },
};
