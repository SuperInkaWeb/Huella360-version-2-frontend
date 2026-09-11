import { useQuery } from '@tanstack/react-query';
import { productService } from '../services/productService';

/**
 * Hook para obtener los productos de la empresa actual (paginado).
 * Usado por CompanyRewardsManagement para seleccionar productos aplicables a recompensas.
 */
export const useProductosEmpresa = (_empresaId: number, page = 0, size = 10) => {
  return useQuery({
    queryKey: ['productosEmpresa', _empresaId, page, size],
    queryFn: () => productService.getMyProducts(page, size),
    enabled: !!_empresaId,
  });
};
