import { api } from "../../../../shared/http/api";
import type { ApiResponse, PageResponse } from "../../../../shared/types/api";
import type { ListadoParams } from "../hooks/useAdminListado";
import type { Company, AdminUser, AdminVeterinario, AdminStats, Category, CreateCategoryRequest, UpdateCategoryRequest } from "../types/admin.types";

export const adminService = {
  getStats: async (): Promise<AdminStats> => {
    const { data } = await api.get<ApiResponse<AdminStats>>("/admin/stats");
    return data.data;
  },

  getCompanies: async ({ page, size, q, estado }: ListadoParams): Promise<PageResponse<Company>> => {
    const { data } = await api.get<ApiResponse<PageResponse<Company>>>("/admin/companies", {
      params: { page, size, q, estado }
    });
    return data.data;
  },

  getUsers: async ({ page, size, q }: ListadoParams): Promise<PageResponse<AdminUser>> => {
    const { data } = await api.get<ApiResponse<PageResponse<AdminUser>>>("/admin/users", {
      params: { page, size, q }
    });
    return data.data;
  },

  toggleCompanyStatus: async (id: number): Promise<void> => {
    await api.patch(`/admin/companies/${id}/toggle-status`);
  },

  toggleUserStatus: async (id: number): Promise<void> => {
    await api.patch(`/admin/users/${id}/toggle-status`);
  },

  getVeterinarios: async ({ page, size, q, estado }: ListadoParams): Promise<PageResponse<AdminVeterinario>> => {
    const { data } = await api.get<ApiResponse<PageResponse<AdminVeterinario>>>("/admin/veterinarios", {
      params: { page, size, q, estado }
    });
    return data.data;
  },

  toggleVeterinarioStatus: async (id: number): Promise<void> => {
    await api.patch(`/admin/veterinarios/${id}/toggle-status`);
  },

  // Category CRUD
  getCategories: async (): Promise<Category[]> => {
    const { data } = await api.get<ApiResponse<Category[]>>("/categories");
    return data.data;
  },

  createCategory: async (category: CreateCategoryRequest): Promise<Category> => {
    const { data } = await api.post<ApiResponse<Category>>("/categories", category);
    return data.data;
  },

  updateCategory: async (id: number, category: UpdateCategoryRequest): Promise<Category> => {
    const { data } = await api.patch<ApiResponse<Category>>(`/categories/${id}`, category);
    return data.data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await api.delete(`/categories/${id}`);
  }
};
