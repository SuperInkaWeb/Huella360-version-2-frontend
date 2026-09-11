import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gamificationService } from '../services/gamification.service';
import type { Reward } from '../types/gamification';
import { toast } from 'react-hot-toast';

// --- ADMIN HOOKS ---
export const usePointsConfig = () => {
  return useQuery({
    queryKey: ['pointsConfig'],
    queryFn: gamificationService.getPointsConfig,
  });
};

export const useUpdatePointsConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, puntosOtorgados, activo }: { id: number; puntosOtorgados: number; activo?: boolean }) =>
      gamificationService.updatePointsConfig(id, puntosOtorgados, activo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pointsConfig'] });
      toast.success('Configuración actualizada');
    },
    onError: () => {
      toast.error('Error al actualizar la configuración');
    },
  });
};

// --- CLIENT HOOKS ---
export const useClientPointsDashboard = (enabled = true) => {
  return useQuery({
    queryKey: ['clientPointsDashboard'],
    queryFn: gamificationService.getClientDashboard,
    enabled,
  });
};

export const useActiveRewards = (empresaId: number, page = 0, size = 10) => {
  return useQuery({
    queryKey: ['activeRewards', empresaId, page, size],
    queryFn: () => gamificationService.getActiveRewards(empresaId, page, size),
    enabled: !!empresaId,
  });
};

import Swal from 'sweetalert2';

export const useRedeemReward = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (recompensaId: number) => gamificationService.redeemReward(recompensaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientPointsDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['redeemedRewards'] });
      
      Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: '¡Recompensa canjeada con éxito!',
        confirmButtonColor: '#1a1060',
      });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error al canjear la recompensa';
      Swal.fire({
        icon: 'error',
        title: 'No se pudo canjear',
        text: message,
        confirmButtonColor: '#1a1060',
      });
    },
  });
};

export const useMyRedeemedRewards = (page = 0, size = 10) => {
  return useQuery({
    queryKey: ['redeemedRewards', page, size],
    queryFn: () => gamificationService.getMyRedeemedRewards(page, size),
  });
};

export const useAvailableCheckoutRewards = (empresaId: number) => {
  return useQuery({
    queryKey: ['availableCheckoutRewards', empresaId],
    queryFn: () => gamificationService.getAvailableRewardsForCheckout(empresaId),
    enabled: !!empresaId,
  });
};

// --- COMPANY HOOKS ---
export const useCompanyRewards = (page = 0, size = 10) => {
  return useQuery({
    queryKey: ['companyRewards', page, size],
    queryFn: () => gamificationService.getCompanyRewards(page, size),
  });
};

export const useCreateCompanyReward = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reward: Partial<Reward>) => gamificationService.createCompanyReward(reward),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companyRewards'] });
      toast.success('Recompensa creada exitosamente');
    },
    onError: () => {
      toast.error('Error al crear la recompensa');
    },
  });
};

export const useUpdateCompanyReward = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reward }: { id: number; reward: Partial<Reward> }) => 
      gamificationService.updateCompanyReward(id, reward),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companyRewards'] });
      toast.success('Recompensa actualizada exitosamente');
    },
    onError: () => {
      toast.error('Error al actualizar la recompensa');
    },
  });
};

export const useDeactivateCompanyReward = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => gamificationService.deactivateCompanyReward(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companyRewards'] });
      toast.success('Recompensa desactivada');
    },
    onError: () => {
      toast.error('Error al desactivar la recompensa');
    },
  });
};
