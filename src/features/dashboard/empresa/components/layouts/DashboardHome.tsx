import {
  DollarSign,
  Calendar,
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Loader2,
  Star,
  Users,
  Activity,
  Package,
  Stethoscope,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useDashboardMetrics, useDashboardChartData, useDashboardActivity } from "../../hooks/useDashboardMetrics";
import { useAuth } from "../../../../auth/context/AuthContext";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const ESTADO_COLORS: Record<string, string> = {
  PAGADO: "bg-emerald-100 text-emerald-700",
  PENDIENTE: "bg-amber-100 text-amber-700",
  CONFIRMADA: "bg-emerald-100 text-emerald-700",
  SOLICITADA: "bg-blue-100 text-blue-700",
  COMPLETADA: "bg-slate-100 text-slate-700",
  CANCELADO: "bg-red-100 text-red-700",
  RECHAZADA: "bg-red-100 text-red-700",
  ENVIADO: "bg-blue-100 text-blue-700",
  ENTREGADO: "bg-indigo-100 text-indigo-700",
  FALLIDO: "bg-red-100 text-red-700",
};

const KPICard = ({
  label,
  value,
  icon,
  trend,
  trendValue,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: string; positive: boolean };
  trendValue?: string;
}) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md hover:border-primary/20 transition-all duration-200">
    <div className="flex justify-between items-start mb-3">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
        {icon}
      </div>
      {trend && (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
          trend.positive
            ? "bg-emerald-50 text-emerald-700"
            : "bg-red-50 text-red-700"
        }`}>
          {trend.positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {trend.value}
        </span>
      )}
      {trendValue && (
        <span className="text-xs font-medium text-slate-400">{trendValue}</span>
      )}
    </div>
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <h3 className="text-2xl font-bold text-slate-900 mt-1">
        {value}
      </h3>
    </div>
  </div>
);

export const DashboardHome = () => {
  const { nombre } = useAuth();
  const { data: metrics, isLoading, error } = useDashboardMetrics();
  const { data: chartData = [] } = useDashboardChartData();
  const { data: activity = [] } = useDashboardActivity();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <p className="text-slate-400 font-medium">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="flex-1 p-8">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <AlertCircle size={40} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-red-800">Error al cargar el dashboard</h2>
          <p className="text-red-600 mt-2">{error?.message || "Algo salió mal"}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const ventasMesAnterior = metrics.ventasMesAnterior || 0;
  const ventasActuales = metrics.totalVentasMes || 0;
  const tendenciaVentas = ventasMesAnterior > 0
    ? Math.round(((ventasActuales - ventasMesAnterior) / ventasMesAnterior) * 100)
    : ventasActuales > 0 ? 100 : 0;

  const chartFormatted = chartData.map(d => ({
    ...d,
    fecha: new Date(d.fecha).toLocaleDateString("es-EC", { day: "2-digit", month: "short" }),
    total: Number(d.total),
  }));

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 no-scrollbar">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              ¡Hola, {nombre || "Empresa"}!
            </h1>
            <p className="text-slate-500 mt-1">
              Resumen de tu negocio — {new Date().toLocaleDateString("es-EC", { weekday: "long", day: "numeric", month: "long" })}
            </p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            label="Ingresos del Mes"
            value={`S/ ${(metrics.totalVentasMes || 0).toLocaleString("es-EC", { minimumFractionDigits: 2 })}`}
            icon={<DollarSign size={20} />}
            trend={tendenciaVentas !== 0 ? { value: `${tendenciaVentas > 0 ? "+" : ""}${tendenciaVentas}%`, positive: tendenciaVentas > 0 } : undefined}
            trendValue="vs mes anterior"
          />
          <KPICard
            label="Órdenes Hoy"
            value={metrics.ordenesPagadasHoy || 0}
            icon={<ShoppingBag size={20} />}
            trendValue={`${metrics.ordenesPendientes || 0} pendientes`}
          />
          <KPICard
            label="Citas de Hoy"
            value={metrics.citasHoy || 0}
            icon={<Calendar size={20} />}
            trendValue={`${metrics.citasPendientes || 0} por confirmar`}
          />
          <KPICard
            label="Clientes Activos"
            value={metrics.clientesActivos || 0}
            icon={<Users size={20} />}
          />
        </div>

        {/* Revenue Chart */}
        {chartFormatted.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900">Ingresos — Últimos 30 días</h2>
                  <p className="text-xs text-slate-400">S/ {(metrics.ventasSemana || 0).toLocaleString("es-EC", { minimumFractionDigits: 2 })} esta semana</p>
                </div>
              </div>
            </div>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartFormatted} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1ea59c" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#1ea59c" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                  <XAxis
                    dataKey="fecha"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    dy={8}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    tickFormatter={(v) => `S/${v}`}
                  />
                  <Tooltip
                    cursor={{ stroke: "#1ea59c", strokeWidth: 1, opacity: 0.1 }}
                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                    formatter={(value: any) => [`S/ ${Number(value).toLocaleString("es-EC", { minimumFractionDigits: 2 })}`, "Ingresos"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#1ea59c"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorIngresos)"
                    animationDuration={1200}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Top Products + Top Services + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Top Products */}
          {metrics.topProductos && metrics.topProductos.length > 0 && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-4">
                <Package size={18} className="text-primary" />
                <h3 className="font-bold text-slate-900">Top Productos</h3>
              </div>
              <div className="space-y-3">
                {metrics.topProductos.slice(0, 5).map((p, i) => (
                  <div key={p.productoId} className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{p.nombreProducto}</p>
                      <p className="text-xs text-slate-400">{p.cantidadVendida} vendidos</p>
                    </div>
                    <span className="text-sm font-bold text-slate-700">S/ {Number(p.totalVendido).toLocaleString("es-EC", { minimumFractionDigits: 2 })}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Services */}
          {metrics.topServicios && metrics.topServicios.length > 0 && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-4">
                <Stethoscope size={18} className="text-primary" />
                <h3 className="font-bold text-slate-900">Top Servicios</h3>
              </div>
              <div className="space-y-3">
                {metrics.topServicios.slice(0, 5).map((s, i) => (
                  <div key={s.servicioId} className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{s.nombreServicio}</p>
                      <p className="text-xs text-slate-400">{s.totalCitas} citas</p>
                    </div>
                    <span className="text-sm font-bold text-slate-700">S/ {Number(s.totalIngresos).toLocaleString("es-EC", { minimumFractionDigits: 2 })}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Activity */}
          {activity.length > 0 && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-4">
                <Activity size={18} className="text-primary" />
                <h3 className="font-bold text-slate-900">Actividad Reciente</h3>
              </div>
              <div className="space-y-3">
                {activity.slice(0, 6).map((a, i) => (
                  <div key={`${a.tipo}-${a.id}-${i}`} className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      a.tipo === "ORDEN" ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
                    }`}>
                      {a.tipo === "ORDEN" ? <ShoppingBag size={14} /> : <Calendar size={14} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-900 truncate">{a.descripcion}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-400 truncate">{a.clienteNombre}</span>
                        {a.monto != null && (
                          <span className="text-xs font-semibold text-slate-600">S/ {Number(a.monto).toLocaleString("es-EC", { minimumFractionDigits: 2 })}</span>
                        )}
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase shrink-0 ${ESTADO_COLORS[a.estado] || "bg-slate-100 text-slate-500"}`}>
                      {a.estado}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Feedback */}
        <FeedbackSection />
      </div>
    </div>
  );
};

const FeedbackSection = () => {
  const { data: ratings, isLoading } = useQuery({
    queryKey: ["delivery-ratings"],
    queryFn: async () => {
      const { deliveryEmpresaService } = await import("../../services/deliveryEmpresaService");
      return deliveryEmpresaService.getRatings();
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading || !ratings || ratings.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-5 border-b border-slate-100">
        <h3 className="font-bold text-slate-900 flex items-center gap-2">
          <Star className="text-amber-500 fill-amber-500" size={18} />
          Feedback Reciente
        </h3>
      </div>
      <div className="divide-y divide-slate-100">
        {ratings.slice(0, 3).map(rating => (
          <div key={rating.idDelivery} className="p-5 hover:bg-slate-50 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={14} 
                      className={i < (rating.calificacionProducto || 0) ? "fill-amber-500" : "text-slate-200"} 
                    />
                  ))}
                </div>
                <span className="text-sm font-bold text-slate-900">
                  {rating.clienteNombre || 'Cliente'}
                </span>
              </div>
              <span className="text-xs text-slate-400">
                {rating.entregadoAt ? new Date(rating.entregadoAt).toLocaleDateString() : ''}
              </span>
            </div>
            <p className="text-sm text-slate-500 italic">
              "{rating.comentarioProducto || 'Sin comentario'}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
