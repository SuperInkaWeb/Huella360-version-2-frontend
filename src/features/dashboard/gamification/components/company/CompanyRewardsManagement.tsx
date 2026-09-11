import React, { useState } from 'react';
import { useCompanyRewards, useCreateCompanyReward, useDeactivateCompanyReward, useUpdateCompanyReward } from '../../hooks/useGamification';
import type { Reward } from '../../types/gamification';
import { Plus, Tag, Trash2, X, AlertCircle, Edit2 } from 'lucide-react';
import { useProductosEmpresa } from '../../../empresa/hooks/useCatalog';
import { useAuth } from '../../../../auth/context/AuthContext';

export const CompanyRewardsManagement = () => {
  const { empresaId } = useAuth();
  const [page] = useState(0);
  const { data: rewardsPage, isLoading } = useCompanyRewards(page, 10);
  const { mutate: createReward, isPending: isCreating } = useCreateCompanyReward();
  const { mutate: updateReward, isPending: isUpdating } = useUpdateCompanyReward();
  const { mutate: deactivateReward } = useDeactivateCompanyReward();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [formData, setFormData] = useState<Partial<Reward>>({
    titulo: '',
    descripcion: '',
    costoPuntos: 1, // Satisfacer @Min(1)
    tipoDescuento: 'PORCENTAJE',
    valorDescuento: 0,
    aplicaACiertosProductos: false,
    productosAplicablesIds: []
  });

  // Solo se necesita si van a aplicar a ciertos productos (para seleccionarlos en el modal)
  const { data: productosPage, isLoading: isLoadingProducts } = useProductosEmpresa(empresaId || 0, 0, 50);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const onActionSuccess = () => {
      setIsModalOpen(false);
      setEditingReward(null);
      setFormData({
        titulo: '',
        descripcion: '',
        costoPuntos: 1,
        tipoDescuento: 'PORCENTAJE',
        valorDescuento: 0,
        aplicaACiertosProductos: false,
        productosAplicablesIds: []
      });
    };

    // Limpiar el objeto para enviar solo lo que CreateRewardDto espera
    const payload = {
      titulo: formData.titulo,
      descripcion: formData.descripcion,
      costoPuntos: formData.costoPuntos,
      tipoDescuento: formData.tipoDescuento,
      valorDescuento: formData.valorDescuento,
      aplicaACiertosProductos: formData.aplicaACiertosProductos,
      productosAplicablesIds: formData.productosAplicablesIds
    };

    if (editingReward) {
      updateReward({ id: editingReward.id, reward: payload }, {
        onSuccess: onActionSuccess
      });
    } else {
      createReward(payload, {
        onSuccess: onActionSuccess
      });
    }
  };

  const handleEdit = (reward: Reward) => {
    setEditingReward(reward);
    setFormData({
      titulo: reward.titulo,
      descripcion: reward.descripcion,
      costoPuntos: reward.costoPuntos,
      tipoDescuento: reward.tipoDescuento,
      valorDescuento: reward.valorDescuento,
      aplicaACiertosProductos: reward.aplicaACiertosProductos,
      productosAplicablesIds: reward.productosAplicablesIds || []
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Estás seguro de desactivar esta recompensa? Los usuarios ya no podrán canjearla.')) {
      deactivateReward(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Recompensas</h2>
          <p className="text-gray-500 mt-1">Crea ofertas y descuentos para fidelizar a tus clientes.</p>
        </div>
        <button
          onClick={() => {
            setEditingReward(null);
            setFormData({
                titulo: '',
                descripcion: '',
                costoPuntos: 1,
                tipoDescuento: 'PORCENTAJE',
                valorDescuento: 0,
                aplicaACiertosProductos: false,
                productosAplicablesIds: []
            });
            setIsModalOpen(true);
          }}
          className="flex items-center space-x-2 bg-[#1a1060] text-white px-4 py-2 rounded-lg hover:bg-[#2a1b80] transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span>Nueva Recompensa</span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a1060]"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4">Oferta</th>
                  <th className="px-6 py-4">Costo (Pts)</th>
                  <th className="px-6 py-4">Descuento</th>
                  <th className="px-6 py-4">Alcance</th>
                  <th className="px-6 py-4">Canjes</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rewardsPage?.content && rewardsPage.content.length > 0 ? (
                  rewardsPage.content.map((reward: any) => (
                    <tr key={reward.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{reward.titulo}</div>
                        <div className="text-xs text-gray-500 mt-1 line-clamp-1">{reward.descripcion}</div>
                      </td>
                      <td className="px-6 py-4 font-bold text-yellow-600">
                        {reward.costoPuntos}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full font-medium ${
                            reward.tipoDescuento === 'PORCENTAJE' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {reward.valorDescuento}{reward.tipoDescuento === 'PORCENTAJE' ? '%' : '$'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {reward.aplicaACiertosProductos ? 'Productos Seleccionados' : 'Todo el Catálogo'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1.5">
                           <span className="font-bold text-gray-900">{reward.totalCanjes || 0}</span>
                           <span className="text-xs text-gray-400">veces</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(reward)}
                            className="text-blue-500 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                            title="Editar Recompensa"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(reward.id)}
                            className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                            title="Desactivar Recompensa"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      <AlertCircle className="w-8 h-8 mx-auto text-gray-400 mb-3" />
                      <p className="text-lg font-medium text-gray-900">Sin recompensas activas</p>
                      <p className="mt-1">Crea tu primera recompensa para empezar a fidelizar clientes.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Nueva Recompensa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur z-10">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <Tag className="w-5 h-5 mr-2 text-[#1a1060]" />
                {editingReward ? 'Editar Recompensa' : 'Crear Nueva Recompensa'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-500 transition-colors p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título de la Oferta</label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    value={formData.titulo}
                    onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1a1060] focus:border-transparent transition-shadow outline-none"
                    placeholder="Ej. Cupón 20% Dcto en Alimentos"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea
                    required
                    maxLength={255}
                    value={formData.descripcion}
                    onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1a1060] focus:border-transparent transition-shadow outline-none resize-none h-24"
                    placeholder="Describe los beneficios o restricciones de la oferta..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Costo (Puntos)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.costoPuntos || ''}
                    onChange={(e) => setFormData({...formData, costoPuntos: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1a1060] focus:border-transparent transition-shadow outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Descuento</label>
                    <select
                      value={formData.tipoDescuento}
                      onChange={(e) => setFormData({...formData, tipoDescuento: e.target.value as any})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1a1060] focus:border-transparent transition-shadow outline-none bg-white"
                    >
                      <option value="PORCENTAJE">Porcentaje (%)</option>
                      <option value="MONTO_FIJO">Monto Fijo ($)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={formData.valorDescuento || ''}
                      onChange={(e) => setFormData({...formData, valorDescuento: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1a1060] focus:border-transparent transition-shadow outline-none"
                    />
                  </div>
                </div>

                <div className="md:col-span-2 border-t border-gray-100 pt-4 mt-2">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.aplicaACiertosProductos}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setFormData({
                            ...formData, 
                            aplicaACiertosProductos: checked,
                            productosAplicablesIds: checked ? formData.productosAplicablesIds : []
                        });
                      }}
                      className="w-5 h-5 text-[#1a1060] rounded border-gray-300 focus:ring-[#1a1060]"
                    />
                    <span className="text-gray-900 font-medium">Aplica solo a ciertos productos</span>
                  </label>
                  <p className="text-sm text-gray-500 mt-1 ml-8">Si se desmarca, el descuento se aplicará a cualquier compra en tu tienda.</p>
                </div>

                {formData.aplicaACiertosProductos && (
                  <div className="md:col-span-2 space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <label className="block text-sm font-semibold text-gray-700">Seleccionar Productos</label>
                    <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                      {isLoadingProducts && (
                          <div className="flex justify-center p-4">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#1a1060]"></div>
                          </div>
                      )}
                      
                      {!isLoadingProducts && productosPage?.content.map((p: any) => (
                        <label key={p.id} className="flex items-center space-x-3 p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.productosAplicablesIds?.includes(p.id)}
                            onChange={(e) => {
                                const newIds = e.target.checked 
                                    ? [...(formData.productosAplicablesIds || []), p.id]
                                    : (formData.productosAplicablesIds || []).filter(id => id !== p.id);
                                setFormData({...formData, productosAplicablesIds: newIds});
                            }}
                            className="text-[#1a1060] rounded focus:ring-[#1a1060]"
                          />
                          <span className="text-sm text-gray-700 font-medium">{p.nombre}</span>
                        </label>
                      ))}
                      
                      {!isLoadingProducts && (!productosPage?.content || productosPage.content.length === 0) && (
                          <p className="text-sm text-gray-500 italic p-2">No tienes productos registrados.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingReward(null);
                  }}
                  className="px-6 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="px-6 py-2.5 bg-[#1a1060] hover:bg-[#2a1b80] text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center"
                >
                  {isCreating || isUpdating ? 'Guardando...' : (editingReward ? 'Actualizar Recompensa' : 'Crear Recompensa')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
