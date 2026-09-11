import { StatsGrid } from "../components/StatsGrid";
import { ActivityTable } from "../components/ActivityTable";
import {
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { BarChart3, LineChart, PieChart as PieIcon, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "../services/adminService";

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => adminService.getStats(),
    staleTime: 2 * 60 * 1000,
  });

  const distributionData = stats ? [
    { name: 'Empresas', value: stats.totalEmpresas },
    { name: 'Veterinarios', value: stats.totalVeterinarios },
    { name: 'Clientes', value: stats.totalUsuarios - stats.totalEmpresas - stats.totalVeterinarios },
  ].filter(d => d.value > 0) : [];

  const COLORS = ['#1ea59c', '#2D3E82', '#6366f1'];

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 text-[#1ea59c] animate-spin" />
          <p className="text-slate-400 font-medium">Cargando panel de control...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-[#2D3E82] tracking-tight leading-tight">
            Panel de Control
          </h1>
          <p className="text-gray-500 font-medium">
            Supervisión global de <span className="text-[#1ea59c] font-bold">VetSaaS</span>.
          </p>
        </div>
        <div className="px-4 py-2 bg-white/50 backdrop-blur-md rounded-xl border border-gray-100 shadow-sm">
          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Última actualización</p>
          <p className="text-sm font-bold text-[#2D3E82]">Hoy, {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <StatsGrid stats={stats ?? null} loading={isLoading} />

      {/* Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Platform Summary */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[#2D3E82]/10 rounded-xl text-[#2D3E82]">
              <BarChart3 size={20} strokeWidth={2.5} />
            </div>
            <h2 className="text-lg font-bold text-[#2D3E82]">Resumen de la Plataforma</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <SummaryCard label="Órdenes Totales" value={stats?.totalOrdenes || 0} />
            <SummaryCard label="Servicios" value={stats?.totalServicios || 0} />
            <SummaryCard label="Productos" value={stats?.totalProductos || 0} />
            <SummaryCard label="Adopciones" value={stats?.totalAdopciones || 0} />
          </div>

          {stats && stats.ingresosGlobales > 0 && (
            <div className="mt-4 p-4 bg-[#1ea59c]/5 rounded-xl">
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">Ingresos Globales</p>
              <p className="text-2xl font-black text-[#1ea59c]">
                S/ {stats.ingresosGlobales.toLocaleString("es-EC", { minimumFractionDigits: 2 })}
              </p>
            </div>
          )}
        </div>

        {/* Entity Distribution Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[#1ea59c]/10 rounded-xl text-[#1ea59c]">
              <PieIcon size={20} strokeWidth={2.5} />
            </div>
            <h2 className="text-lg font-bold text-[#2D3E82]">Distribución de Usuarios</h2>
          </div>

          {distributionData.length > 0 ? (
            <>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={5}
                      dataKey="value"
                      animationDuration={1200}
                    >
                      {distributionData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value) => <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {stats && stats.totalUsuarios > 0 && (
                <div className="mt-2 p-3 bg-[#1ea59c]/5 rounded-xl">
                  <p className="text-xs text-gray-500">
                    El <span className="font-bold text-[#1ea59c]">{Math.round((stats.totalEmpresas / stats.totalUsuarios) * 100)}%</span> de los usuarios son empresas.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-slate-400 text-sm">
              No hay datos de distribución
            </div>
          )}
        </div>
      </div>

      {/* Activity Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-xl text-slate-500">
              <LineChart size={20} strokeWidth={2.5} />
            </div>
            <h2 className="text-lg font-bold text-[#2D3E82]">Actividad Reciente</h2>
          </div>
        </div>
        <div className="overflow-x-auto p-4">
          <ActivityTable />
        </div>
      </div>
    </div>
  );
}

const SummaryCard = ({ label, value }: { label: string; value: number }) => (
  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">{label}</p>
    <p className="text-xl font-black text-slate-900">{value.toLocaleString()}</p>
  </div>
);
