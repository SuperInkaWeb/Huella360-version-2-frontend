import { useState, useEffect } from "react";
import {
 Shield,
 AlertTriangle,
 Package,
 XCircle,
 Crown
} from "lucide-react";
import { subscriptionService } from "../../shared/subscriptions/services/subscriptionService";
import type { Plan } from "../../shared/subscriptions/types/subscription.types";

export const SubscriptionAdminPage = () => {
 const [plans, setPlans] = useState<Plan[]>([]);
 const [isLoading, setIsLoading] = useState(true);

 const fetchPlans = async () => {
 try {
 setIsLoading(true);
 const data = await subscriptionService.getPlans();
 setPlans(data);
 } catch (error) {
 console.error("Error fetching plans:", error);
 } finally {
 setIsLoading(false);
 }
 };

 useEffect(() => {
 fetchPlans();
 }, []);



 return (
 <div className="h-full flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
 {/* Header */}
 <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
 <div className="space-y-1">
 <h1 className="text-4xl font-black text-[#2D3E82] tracking-tight flex items-center gap-3">
 <Crown className="text-[#1ea59c]" size={36} />
 Gestión de Planes
 </h1>
 <p className="text-slate-500 font-medium">Configura los tiers de suscripción, precios y límites del ecosistema SaaS.</p>
 </div>
 </header>

 {/* KPI OverView - Premium Cards */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
 <KpiCard label="Planes Activos" value={plans.filter(p => p.activo).length} icon={<Shield className="text-[#1ea59c]" />} color="text-[#1ea59c]" bg="bg-[#1ea59c]/10" />
 <KpiCard label="Total Planes" value={plans.length} icon={<Package className="text-[#2D3E82] " />} color="text-[#2D3E82] " bg="bg-[#2D3E82]/10" />
 <KpiCard label="Planes Inactivos" value={plans.filter(p => !p.activo).length} icon={<XCircle className="text-rose-500" />} color="text-rose-500" bg="bg-rose-500/10" />
 <KpiCard label="Alertas Activas" value="0" icon={<AlertTriangle className="text-amber-500" />} color="text-amber-500" bg="bg-amber-500/10" />
 </div>

 {/* Plans Table Section */}
 <div className="flex-1 bg-white/40 backdrop-blur-2xl rounded-[2.5rem] border border-white/40 shadow-soft overflow-hidden flex flex-col">
 <div className="overflow-x-auto overflow-y-auto custom-scrollbar flex-1">
 <table className="w-full text-left border-collapse">
 <thead className="sticky top-0 z-20">
 <tr className="bg-white/60 backdrop-blur-2xl border-b border-gray-100 ">
 <th className="px-8 py-6 text-[11px] uppercase tracking-[0.2em] font-black text-slate-400 ">Tier del SaaS</th>
 <th className="px-8 py-6 text-[11px] uppercase tracking-[0.2em] font-black text-slate-400 ">Inversión Mensual</th>
 <th className="px-8 py-6 text-[11px] uppercase tracking-[0.2em] font-black text-slate-400 ">Límites & Cuotas</th>
 <th className="px-8 py-6 text-[11px] uppercase tracking-[0.2em] font-black text-slate-400 text-center">Estado</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100/50 ">
 {isLoading ? (
 Array.from({ length: 4 }).map((_, i) => (
 <tr key={i} className="animate-pulse">
 <td colSpan={5} className="px-8 py-8 px-8 py-6 h-20 bg-white/40 " />
 </tr>
 ))
 ) : (
 plans.map((plan) => (
 <tr key={plan.id} className="group hover:bg-white/60 :bg-white/5 transition-all duration-300">
 <td className="px-8 py-6">
 <div className="flex flex-col">
 <span className="font-black text-lg text-[#2D3E82] mb-0.5 tracking-tight group-hover:text-[#1ea59c] transition-colors">{plan.nombre}</span>
 <span className="text-xs text-slate-500 font-medium truncate max-w-[250px] italic">{plan.descripcion || 'Sin descripción detallada'}</span>
 </div>
 </td>
 <td className="px-8 py-6 font-black text-xl text-[#2D3E82] tracking-widest">
 <span className="text-sm font-bold text-slate-400 mr-1">S/</span>
 {plan.precioMensual.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
 </td>
 <td className="px-8 py-6">
 <div className="flex flex-wrap gap-2">
 <span className="px-3 py-1.5 bg-[#1ea59c]/5 text-[#1ea59c] text-[10px] font-black tracking-widest uppercase rounded-xl border border-[#1ea59c]/10 shadow-sm">
 {plan.limiteMascotas === 0 ? 'Mascotas ilimitadas' : `${plan.limiteMascotas} Mascotas`}
 </span>
 <span className="px-3 py-1.5 bg-[#2D3E82]/5 text-[#2D3E82] text-[10px] font-black tracking-widest uppercase rounded-xl border border-[#2D3E82]/10 shadow-sm">
 {plan.limiteProductos === 0 ? 'Stock ilimitado' : `${plan.limiteProductos} Prod.`}
 </span>
 </div>
 </td>
 <td className="px-8 py-6">
 <div className="flex justify-center">
 {plan.activo ? (
 <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> ACTIVO
 </div>
 ) : (
 <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-rose-500/20">
 <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" /> INACTIVO
 </div>
 )}
 </div>
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 );
};

const KpiCard = ({ label, value, icon, color, bg }: { label: string, value: string | number, icon: React.ReactNode, color: string, bg: string }) => (
 <div className="group relative overflow-hidden bg-white/40 backdrop-blur-2xl p-6 rounded-[2rem] border border-white/40 shadow-soft flex items-center gap-6 hover:border-[#1ea59c]/30 hover:bg-white/60 transition-all duration-300">
 <div className={`w-16 h-16 ${bg} rounded-3xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 shadow-sm border border-white/20`}>
 {icon}
 </div>
 <div>
 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{label}</p>
 <h3 className={`text-3xl font-black ${color} tracking-tighter`}>{value}</h3>
 </div>
 {/* Subtle Bottom Glow on Hover */}
 <div className={`absolute bottom-0 left-0 right-0 h-1 ${bg} opacity-0 group-hover:opacity-100 transition-opacity`} />
 </div>
);
