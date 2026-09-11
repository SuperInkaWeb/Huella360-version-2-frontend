import { api } from "../../../shared/http/api";
import type { ApiResponse, PageResponse } from "../../../shared/types/api";
import type { Order } from "../../../types/mercadopago";
import type { PageResponseOrders } from "../../dashboard/cliente/types/order.types";
import type { Product, Category, MarketplaceFilters, CompanyResponse } from "../types/marketplace";

export const marketplaceService = {
    searchProducts: async (filters: MarketplaceFilters) => {
        const params = new URLSearchParams();
        if (filters.q) params.append("q", filters.q);
        if (filters.category) params.append("category", filters.category.toString());
        if (filters.page !== undefined) params.append("page", filters.page.toString());
        if (filters.size !== undefined) params.append("size", filters.size.toString());
        if (filters.sort) params.append("sort", filters.sort);

        const { data } = await api.get<ApiResponse<{ content: Product[]; totalElements: number }>>("/public/products", { params });
        return data.data;
    },

    getProductById: async (id: number): Promise<Product> => {
        const { data } = await api.get<ApiResponse<Product>>(`/public/products/${id}`);
        return data.data;
    },

    getCategories: async (): Promise<Category[]> => {
        const { data } = await api.get<ApiResponse<Category[]>>("/categories/parents");
        return data.data;
    },

    getSubcategories: async (padreId: number): Promise<Category[]> => {
        const { data } = await api.get<ApiResponse<Category[]>>(`/categories/${padreId}/subcategories`);
        return data.data;
    },

    getAllCompanies: async (page = 0, size = 12): Promise<PageResponse<CompanyResponse>> => {
        const { data } = await api.get<ApiResponse<PageResponse<CompanyResponse>>>(`/companies/public?page=${page}&size=${size}`);
        return data.data;
    },

    getCompanyById: async (id: number | string): Promise<CompanyResponse> => {
        const { data } = await api.get<ApiResponse<any>>(`/companies/public/${id}`);
        return data.data;
    },

    getProductsByCompany: async (companyId: number, page = 0, size = 10) => {
        const { data } = await api.get<ApiResponse<{ content: Product[] }>>(`/public/products/company/${companyId}`, {
            params: { page, size }
        });
        return data.data;
    },

    createOrder: async (orderData: { 
        empresaId: number | null; 
        veterinarioId: number | null; 
        costoEnvio?: number;
        destinoLat?: number;
        destinoLng?: number;
        destinoDireccion?: string;
        destinoReferencia?: string;
        canjeRecompensaId?: number;
        items: { productoId: number | null; servicioId: number | null; cantidad: number }[] 
    }): Promise<number> => {
        const { data } = await api.post<ApiResponse<number>>("/orders", orderData);
        return data.data;
    },

    createGuestOrder: async (orderData: {
        empresaId: number | null;
        veterinarioId: number | null;
        guestEmail: string;
        guestNombre: string;
        costoEnvio?: number;
        destinoLat?: number;
        destinoLng?: number;
        destinoDireccion?: string;
        destinoReferencia?: string;
        items: { productoId: number | null; servicioId: number | null; cantidad: number }[]
    }): Promise<number> => {
        const { data } = await api.post<ApiResponse<number>>("/orders/guest", orderData);
        return data.data;
    },

    getMyOrders: async (
        page = 0,
        size = 10,
        startDate?: string,
        endDate?: string
    ): Promise<PageResponseOrders<Order>> => {
        const { data } = await api.get<ApiResponse<PageResponseOrders<Order>>>("/orders/me", {
            params: {
                page,
                size,
                sort: "createdAt,desc",
                ...(startDate && { startDate }),
                ...(endDate && { endDate })
            }
        });
        return data.data;
    },

    getPaymentLink: async (orderId: number): Promise<{ preferenceId: string; initPoint: string; sandboxInitPoint: string }> => {
        const { data } = await api.post<ApiResponse<{ preferenceId: string; initPoint: string; sandboxInitPoint: string }>>(`/payments/checkout/${orderId}`);
        return data.data;
    },

    getGuestPaymentLink: async (orderId: number): Promise<{ preferenceId: string; initPoint: string; sandboxInitPoint: string }> => {
        const { data } = await api.post<ApiResponse<{ preferenceId: string; initPoint: string; sandboxInitPoint: string }>>(`/payments/checkout/guest/${orderId}`);
        return data.data;
    },

    syncPayment: async (paymentId: string, externalReference: string): Promise<void> => {
        await api.get(`/payments/sync`, {
            params: {
                payment_id: paymentId,
                external_reference: externalReference
            }
        });
    },

    searchAdoptions: async (page = 0, size = 12) => {
        const { data } = await api.get<ApiResponse<{ content: any[]; totalElements: number }>>("/adoptions", {
            params: { page, size }
        });
        return data.data;
    },

    getAdoptionsByCompany: async (companyId: number, page = 0, size = 12) => {
        const { data } = await api.get<ApiResponse<{ content: any[] }>>(`/adoptions/public/company/${companyId}`, {
            params: { page, size }
        });
        return data.data;
    },

    getAdoptionById: async (id: number): Promise<any> => {
        const { data } = await api.get<ApiResponse<any>>(`/adoptions/${id}`);
        return data.data;
    },

    searchServices: async (page = 0, size = 12, q?: string, empresaId?: number) => {
        const { data } = await api.get<ApiResponse<{ content: any[]; totalElements: number }>>("/services", {
            params: { page, size, q, empresaId }
        });
        return data.data;
    },

    getServiceById: async (id: number): Promise<any> => {
        const { data } = await api.get<ApiResponse<any>>(`/services/${id}`);
        return data.data;
    }
};


