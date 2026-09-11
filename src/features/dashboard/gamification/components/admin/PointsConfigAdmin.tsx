import { useState } from 'react';
import { usePointsConfig, useUpdatePointsConfig } from '../../hooks/useGamification';
import type { PointsConfig } from '../../types/gamification';
import { Settings, Save, AlertCircle } from 'lucide-react';

export const PointsConfigAdmin = () => {
  const { data: configs, isLoading } = usePointsConfig();
  const { mutate: updateConfig, isPending } = useUpdatePointsConfig();

  // Local state to manage form edits before saving
  const [edits, setEdits] = useState<Record<number, Partial<PointsConfig>>>({});

  const handleEdit = (id: number, key: keyof PointsConfig, value: any) => {
    setEdits(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [key]: value
      }
    }));
  };

  const handleSave = (id: number) => {
    const edit = edits[id];
    if (edit) {
      updateConfig({ 
        id, 
        puntosOtorgados: edit.puntosOtorgados as number, 
        activo: edit.activo 
      }, {
        onSuccess: () => {
           // Clear edit state for this row on success
           setEdits(prev => {
             const newEdits = {...prev};
             delete newEdits[id];
             return newEdits;
           });
        }
      });
    }
  };

  const hasChanges = (id: number) => {
    return edits[id] !== undefined && Object.keys(edits[id]).length > 0;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a1060]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-blue-100 rounded-xl">
           <Settings className="w-6 h-6 text-[#1a1060]" />
        </div>
        <div>
           <h2 className="text-2xl font-bold text-gray-900">Configuración de Puntos</h2>
           <p className="text-gray-500 text-sm">Administra cuántos puntos ganan los clientes por cada acción.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4">Acción</th>
                <th className="px-6 py-4">Descripción</th>
                <th className="px-6 py-4 w-32">Puntos Otorgados</th>
                <th className="px-6 py-4 w-28">Estado</th>
                <th className="px-6 py-4 text-center w-28">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {configs?.map((config: any) => {
                const currentEdit = edits[config.id] || {};
                const currentValue = typeof currentEdit.puntosOtorgados !== 'undefined' ? currentEdit.puntosOtorgados : config.puntosOtorgados;
                const currentActive = typeof currentEdit.activo !== 'undefined' ? currentEdit.activo : config.activo;
                const changed = hasChanges(config.id);

                return (
                  <tr key={config.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {config.accion.replace(/_/g, ' ')}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {config.descripcion}
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        min="0"
                        value={currentValue}
                        onChange={(e) => handleEdit(config.id, 'puntosOtorgados', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1060] focus:border-transparent transition-shadow outline-none text-right font-medium"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={currentActive}
                          onChange={(e) => handleEdit(config.id, 'activo', e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                      </label>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleSave(config.id)}
                        disabled={!changed || isPending}
                        className={`p-2 rounded-lg transition-colors flex items-center justify-center w-full ${
                          changed 
                            ? 'bg-[#1a1060] text-white hover:bg-[#2a1b80]' 
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                        title={changed ? "Guardar cambios" : "Sin cambios"}
                      >
                        <Save className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              
              {configs && configs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <AlertCircle className="w-8 h-8 mx-auto text-gray-400 mb-3" />
                    <p className="text-lg font-medium text-gray-900">No hay configuraciones disponibles</p>
                    <p className="mt-1 text-sm">El sistema debería haber creado las configuraciones por defecto.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
