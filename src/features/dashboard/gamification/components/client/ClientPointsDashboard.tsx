import { useState } from 'react';
import { useClientPointsDashboard, useMyRedeemedRewards } from '../../hooks/useGamification';
import { Gift, Award, Clock, Tag, Info } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Link } from 'react-router-dom';

export const ClientPointsDashboard = () => {
  const { data: dashboard, isLoading: loadingDash } = useClientPointsDashboard();
  const { data: redeemedRewards, isLoading: loadingRewards } = useMyRedeemedRewards();
  const [activeTab, setActiveTab] = useState<'historial' | 'recompensas'>('historial');

  if (loadingDash || loadingRewards) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a1060]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumen de Puntos */}
      <div className="bg-gradient-to-r from-[#1a1060] to-[#2a1b80] rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-white/80">Total de Puntos</h2>
            <div className="flex items-baseline mt-2">
              <span className="text-4xl font-bold">{dashboard?.totalPuntos || 0}</span>
              <span className="ml-2 text-white/60">pts</span>
            </div>
          </div>
          <div className="p-4 bg-white/10 rounded-full backdrop-blur-sm">
            <Award className="w-10 h-10 text-yellow-400" />
          </div>
        </div>
        <p className="mt-4 text-sm text-white/70">
          Usa tus puntos canjeando recompensas en las diferentes tiendas del Marketplace.
        </p>
        <div className="mt-4 p-3 bg-white/10 rounded-xl border border-white/20 flex items-start space-x-3">
          <Info className="w-5 h-5 text-yellow-300 mt-0.5" />
          <p className="text-sm text-white/90">
            <strong>¿Cómo canjear?</strong> Visita el perfil de tus veterinarias favoritas en el <Link to="/marketplace" className="underline font-bold hover:text-white transition-colors">Marketplace</Link> y busca la pestaña de <strong>"Recompensas"</strong>.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('historial')}
          className={`pb-4 px-2 font-medium transition-colors relative ${
            activeTab === 'historial'
              ? 'text-[#1a1060]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Historial Reciente
          {activeTab === 'historial' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1a1060] rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('recompensas')}
          className={`pb-4 px-2 font-medium transition-colors relative ${
            activeTab === 'recompensas'
              ? 'text-[#1a1060]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Mis Recompensas
          {activeTab === 'recompensas' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1a1060] rounded-t-full" />
          )}
        </button>
      </div>

      {/* Contenido de Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {activeTab === 'historial' ? (
          <div className="divide-y divide-gray-100">
            {dashboard?.historialReciente && dashboard.historialReciente.length > 0 ? (
              dashboard.historialReciente.map((item) => (
                <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-lg ${
                      item.puntos > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {item.puntos > 0 ? <Award className="w-5 h-5" /> : <Gift className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.descripcion}</p>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Clock className="w-3.5 h-3.5 mr-1" />
                        {format(new Date(item.fecha), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
                      </div>
                    </div>
                  </div>
                  <div className={`font-bold ${item.puntos > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {item.puntos > 0 ? '+' : ''}{item.puntos}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <p>No tienes movimientos recientes.</p>
                <p className="text-sm mt-1">¡Realiza compras o adopciones para empezar a ganar!</p>
              </div>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {redeemedRewards?.content && redeemedRewards.content.length > 0 ? (
              redeemedRewards.content.map((reward) => (
                <div key={reward.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between pointer-events-none">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-xl ${
                        reward.utilizado ? 'bg-gray-100 text-gray-400' : 'bg-orange-100 text-orange-600'
                      }`}>
                        <Tag className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className={`font-bold ${reward.utilizado ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                          {reward.recompensaTitulo}
                        </h4>
                        <div className="flex items-center mt-1 space-x-2 text-sm">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            reward.tipoDescuento === 'PORCENTAJE' 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {reward.tipoDescuento === 'PORCENTAJE' ? `${reward.valorDescuento}% DTO` : `$${reward.valorDescuento} DTO`}
                          </span>
                          <span className="text-gray-500">
                            Canjeado el {format(new Date(reward.fechaCanje), "d MMM yyyy", { locale: es })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      {reward.utilizado ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Utilizado
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200 shadow-sm animate-pulse">
                          Disponible
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <p>Aún no has canjeado ninguna recompensa.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
