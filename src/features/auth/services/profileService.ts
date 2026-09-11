import { api } from "../../../shared/http/api";
import type {
  ClienteProfileRequest,
  VeterinarioProfileRequest,
  EmpresaProfileRequest,
  RepartidorProfileRequest,
} from "../types/auth";

/**
 * Servicio para crear los perfiles de cada rol luego del registro.
 * Todos los endpoints requieren un token JWT válido (Bearer).
 */
export const profileService = {
  /**
   * POST /api/v1/clients/me
   * Req: Bearer token con rol CLIENTE
   */
  createClienteProfile: async (data: ClienteProfileRequest) => {
    const { data: response } = await api.post("/clients/me", data);
    return response;
  },

  /**
   * GET /api/v1/clients/me — verificar si el perfil ya existe
   */
  getClienteProfile: async () => {
    const { data } = await api.get("/clients/me");
    return data;
  },

  /**
   * POST /api/v1/veterinarians/profile
   * Req: Bearer token con rol VETERINARIO
   */
  createVeterinarioProfile: async (data: VeterinarioProfileRequest) => {
    const { data: response } = await api.post("/veterinarians/profile", data);
    return response;
  },

  /**
   * GET /api/v1/veterinarians/me — verificar si el perfil ya existe
   */
  getVeterinarioProfile: async () => {
    const { data } = await api.get("/veterinarians/me");
    return data;
  },

  /**
   * POST /api/v1/companies — multipart/form-data
   * La parte "data" es un Blob JSON; opcionalmente "logo" y "banner".
   * Req: Bearer token con rol EMPRESA
   */
  createEmpresaProfile: async (
    data: EmpresaProfileRequest,
    logo?: File,
    banner?: File,
  ) => {
    const formData = new FormData();

    // Spring espera el part "data" como application/json
    formData.append(
      "data",
      new Blob([JSON.stringify(data)], { type: "application/json" }),
      "blob.json",
    );

    if (logo) formData.append("logo", logo);
    if (banner) formData.append("banner", banner);

    const { data: response } = await api.post("/companies", formData);
    return response;
  },

  /**
   * GET /api/v1/companies/me — verificar si el perfil ya existe
   */
  getEmpresaProfile: async () => {
    const { data } = await api.get("/companies/me");
    return data;
  },

  /**
   * POST /api/v1/repartidores/me — Registro inicial (Multipart)
   * Req: Bearer token con rol REPARTIDOR
   */
  createRepartidorProfile: async (data: RepartidorProfileRequest, fotoPerfil?: File) => {
    const formData = new FormData();
    
    formData.append(
      "data",
      new Blob([JSON.stringify(data)], { type: "application/json" }),
      "blob.json"
    );

    if (fotoPerfil) {
      formData.append("fotoPerfil", fotoPerfil);
    }

    const { data: response } = await api.post("/repartidores/me", formData);
    return response;
  },

  /**
   * GET /api/v1/repartidores/me
   */
  getRepartidorProfile: async () => {
    const { data } = await api.get("/repartidores/me");
    return data;
  },
};
