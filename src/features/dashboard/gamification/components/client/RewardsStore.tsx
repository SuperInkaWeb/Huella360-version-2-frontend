import { useState } from 'react';
import { useActiveRewards, useRedeemReward } from '../../hooks/useGamification';
import { Gift, AlertCircle, CheckCircle2, ShoppingBag } from 'lucide-react';

export const RewardsStore = ({ empresaId }: { empresaId: number }) => {
  const [page, setPage] = useState(0);
  const { data: rewardsPage, isLoading } = useActiveRewards(empresaId, page, 10);
  const { mutate: redeem, isPending: isRedeeming } = useRedeemReward();
  
  const handleRedeem = (recompensaId: number, costo: number) => {
    if (confirm(`¿Estás seguro de canjear esta recompensa por ${costo} puntos?`)) {
      redeem(recompensaId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a1060]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <Gift className="w-8 h-8 text-[#1a1060]" />
        <h2 className="text-2xl font-bold text-gray-900">Catálogo de Recompensas</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rewardsPage?.content && rewardsPage.content.length > 0 ? (
          rewardsPage.content.map((reward: any) => (
            <div key={reward.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
              <div className="h-2 bg-[#1a1060]"></div>
              <div className="p-6 flex-grow flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-900 leading-tight">{reward.titulo}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap ml-2 ${
                    reward.tipoDescuento === 'PORCENTAJE' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {reward.tipoDescuento === 'PORCENTAJE' ? `${reward.valorDescuento}% DTO` : `$${reward.valorDescuento} DTO`}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-6 flex-grow">{reward.descripcion}</p>
                
                <div className="flex items-center text-sm text-gray-500 mb-6 bg-gray-50 p-3 rounded-xl">
                  {reward.aplicaACiertosProductos ? (
                     <>
                       <ShoppingBag className="w-4 h-4 mr-2 text-[#1a1060]" />
                       Aplica a productos seleccionados
                     </>
                  ) : (
                    <>
                       <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                       Aplica a todo el catálogo
                     </>
                  )}
                </div>

                <div className="mt-auto">
                    <button
                      onClick={() => handleRedeem(reward.id, reward.costoPuntos)}
                      disabled={isRedeeming}
                      className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-[#1a1060] hover:bg-[#2a1b80] text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      <span>Canjear por</span>
                      <span className="font-bold text-yellow-400 group-hover:text-yellow-300 transition-colors">
                        {reward.costoPuntos} pts
                      </span>
                    </button>
                </div>
              </div>
            </div>
          ))
        ) : (
           <div className="col-span-full flex flex-col items-center justify-center p-12 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
            <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-center font-medium">Esta tienda aún no ha publicado recompensas.</p>
            <p className="text-sm text-gray-400">Vuelve más tarde para descubrir nuevas ofertas.</p>
          </div>
        )}
      </div>

     {/* Paginación simple si es necesario */}
     {rewardsPage && rewardsPage.totalPages > 1 && (
        <div className="flex justify-center space-x-2 mt-8">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-4 py-2 border rounded-lg disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page >= rewardsPage.totalPages - 1}
            className="px-4 py-2 border rounded-lg disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};
