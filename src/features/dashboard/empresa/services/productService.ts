import { api } from "../../../../shared/http/api";
import type { ApiResponse, PageResponse } from "../../../../shared/types/api";
import type { CreateProductRequest, Product, UpdateProductRequest } from "../../../catalog/types/product";

export const productService = {
  /**
   * Obtiene los productos de la empresa actual (paginado)
   */
  getMyProducts: async (page = 0, size = 10, sort = 'desc'): Promise<PageResponse<Product>> => {
    const { data } = await api.get<ApiResponse<PageResponse<Product>>>("/products/my-products", {
      params: { page, size, sort }
    });
    return data.data;
  },

  /**
   * Crea un nuevo producto con soporte para múltiples imágenes (multipart/form-data)
   */
  createProduct: async (
    data: CreateProductRequest,
    images?: File[]
  ): Promise<Product> => {
    const formData = new FormData();

    // El backend espera la parte "data" como un JSON Blob
    formData.append(
      "data",
      new Blob([JSON.stringify(data)], { type: "application/json" }),
      "product.json"
    );

    if (images && images.length > 0) {
      images.forEach((image) => {
        formData.append("images", image);
      });
    }

    const { data: response } = await api.post<ApiResponse<Product>>("/products", formData);
    return response.data;
  },

  /**
   * Actualiza los metadatos de un producto (PATCH JSON)
   */
  updateProduct: async (id: number, data: UpdateProductRequest): Promise<Product> => {
    const { data: response } = await api.patch<ApiResponse<Product>>(`/products/${id}`, data);
    return response.data;
  },

  /**
   * Actualiza un producto incluyendo imágenes (PATCH Multipart)
   * @param replaceImages Si es true, reemplaza todas las imágenes previas. Si es false, añade las nuevas.
   */
  // En updateProductMultipart
  updateProductMultipart: async (
    id: number,
    data: UpdateProductRequest,
    images?: File[],
    replaceImages = false
  ): Promise<Product> => {
    const formData = new FormData();

    formData.append(
      "data",
      new Blob([JSON.stringify(data)], { type: "application/json" })
    );

    if (images && images.length > 0) {
      images.forEach((image) => {
        // Importante: No uses "images[]", usa "images" 
        // tal cual lo espera el @RequestPart del backend
        formData.append("images", image);
      });
    }

    const { data: response } = await api.patch<ApiResponse<Product>>(`/products/${id}`, formData, {
      params: { replaceImages }
    });
    return response.data;
  },

  /**
   * Elimina (desactiva) un producto
   */
  deleteProduct: async (id: number): Promise<void> => {
    await api.delete(`/products/${id}`);
  }
};
