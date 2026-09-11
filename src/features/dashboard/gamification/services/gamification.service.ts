import { api } from '../../../../shared/http/api';
import type { ApiResponse } from '../../../../shared/types/api';
import type { ClientPointsDashboard, PointsConfig, RedeemedReward, Reward } from '../types/gamification';

interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const gamificationService = {
  // --- Admin Endpoints ---
  async getPointsConfig(): Promise<PointsConfig[]> {
    const { data } = await api.get<ApiResponse<PointsConfig[]>>('/gamification/points/config');
    return data.data || [];
  },

  async updatePointsConfig(id: number, puntosOtorgados: number, activo?: boolean): Promise<PointsConfig> {
    const params = new URLSearchParams();
    params.append('puntosOtorgados', puntosOtorgados.toString());
    if (activo !== undefined) params.append('activo', activo.toString());
    
    const { data } = await api.put<ApiResponse<PointsConfig>>(`/gamification/points/config/${id}`, params);
    return data.data!;
  },

  // --- Client Endpoints ---
  async getClientDashboard(): Promise<ClientPointsDashboard> {
    const { data } = await api.get<ApiResponse<ClientPointsDashboard>>('/gamification/points/dashboard');
    return data.data || { totalPuntos: 0, historialReciente: [] };
  },

  async getActiveRewards(empresaId: number, page = 0, size = 10): Promise<PaginatedResponse<Reward>> {
    console.log(`Fetching active rewards for empresa ${empresaId}`);
    const { data } = await api.get<ApiResponse<PaginatedResponse<Reward>>>(`/gamification/rewards/business/${empresaId}`, {
      params: { page, size }
    });
    console.log('Active rewards response:', data);
    return data.data || { content: [], totalElements: 0, totalPages: 0, size: 10, number: 0 };
  },

  async redeemReward(recompensaId: number): Promise<RedeemedReward> {
    const { data } = await api.post<ApiResponse<RedeemedReward>>(`/gamification/rewards/${recompensaId}/redeem`);
    return data.data!;
  },

  async getMyRedeemedRewards(page = 0, size = 10): Promise<PaginatedResponse<RedeemedReward>> {
    const { data } = await api.get<ApiResponse<PaginatedResponse<RedeemedReward>>>('/gamification/rewards/my-redeemed', {
      params: { page, size }
    });
    return data.data || { content: [], totalElements: 0, totalPages: 0, size, number: page };
  },
  
  async getAvailableRewardsForCheckout(empresaId: number): Promise<RedeemedReward[]> {
    const { data } = await api.get<ApiResponse<RedeemedReward[]>>(`/gamification/rewards/checkout/available/${empresaId}`);
    return data.data || [];
  },

  // --- Company Endpoints ---
  async getCompanyRewards(page = 0, size = 10): Promise<PaginatedResponse<Reward>> {
    const { data } = await api.get<ApiResponse<PaginatedResponse<Reward>>>('/gamification/rewards/company', {
      params: { page, size }
    });
    return data.data || { content: [], totalElements: 0, totalPages: 0, size, number: page };
  },

  async createCompanyReward(reward: Partial<Reward>): Promise<Reward> {
    const { data } = await api.post<ApiResponse<Reward>>('/gamification/rewards/company', reward);
    return data.data!;
  },

  async updateCompanyReward(id: number, reward: Partial<Reward>): Promise<Reward> {
    const { data } = await api.put<ApiResponse<Reward>>(`/gamification/rewards/company/${id}`, reward);
    return data.data!;
  },

  async deactivateCompanyReward(id: number): Promise<void> {
    await api.delete(`/gamification/rewards/company/${id}`);
  }
};
