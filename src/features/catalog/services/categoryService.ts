import { api } from "../../../shared/http/api";
import type { ApiResponse } from "../../../shared/types/api";
import type { Category } from "../types/category";

export const categoryService = {
  getAllCategories: async (): Promise<Category[]> => {
    const { data } = await api.get<ApiResponse<Category[]>>("/categories");
    return data.data;
  },

  getSubcategories: async (padreId: number): Promise<Category[]> => {
    const { data } = await api.get<ApiResponse<Category[]>>(`/categories/${padreId}/subcategories`);
    return data.data;
  }
};
