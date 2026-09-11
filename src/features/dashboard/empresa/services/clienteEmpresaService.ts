import { api } from "../../../../shared/http/api";
import type { AxiosResponse } from "axios";
import type { ApiResponse, PageResponse } from "../../../../shared/types/api";

export interface EmpresaCliente {
  id: number;
  correo: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  fotoPerfilUrl: string;
}

export const clienteEmpresaService = {
  getClientes: (page = 0, size = 10): Promise<AxiosResponse<PageResponse<EmpresaCliente>>> =>
    api.get(`/clients/empresa?page=${page}&size=${size}`),

  getClienteById: (id: number): Promise<AxiosResponse<ApiResponse<EmpresaCliente>>> =>
    api.get(`/clients/empresa/${id}`),
};
