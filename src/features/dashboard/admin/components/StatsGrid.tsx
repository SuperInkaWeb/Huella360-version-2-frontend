import {
 Users,
 Building2,
 Stethoscope,
 ShoppingBag,
 TrendingUp,
 Heart
} from "lucide-react";
import type { AdminStats } from "../types/admin.types";

interface StatsGridProps {
 stats: AdminStats | null;
 loading: boolean;
}

export const StatsGrid = ({ stats, loading }: StatsGridProps) => {
 const statCards = [
 {
 title: "Usuarios Totales",
 value: stats?.totalUsuarios ?? 0,
 icon: Users,
 color: "text-[#1ea59c]",
 bg: "bg-[#1ea59c]/10 #1ea59c]/20",
 border: "border-[#1ea59c]/20",
 desc: "Registrados en la plataforma"
 },
 {
 title: "Empresas",
 value: stats?.totalEmpresas ?? 0,
 icon: Building2,
 color: "text-[#2D3E82]",
 bg: "bg-[#2D3E82]/10 #2D3E82]/20",
 border: "border-[#2D3E82]/20",
 desc: "Clínicas y Tiendas"
 },
 {
 title: "Veterinarios",
 value: stats?.totalVeterinarios ?? 0,
 icon: Stethoscope,
 color: "text-[#1ea59c]",
 bg: "bg-[#1ea59c]/10 #1ea59c]/20",
 border: "border-[#1ea59c]/20",
 desc: "Profesionales activos"
 },
 {
 title: "Ventas Globales",
 value: `S/ ${stats?.ingresosGlobales?.toLocaleString() ?? '0'}`,
 icon: ShoppingBag,
 color: "text-[#2D3E82]",
 bg: "bg-[#2D3E82]/10 #2D3E82]/20",
 border: "border-[#2D3E82]/20",
 desc: "Ingresos marketplace"
 },
 {
 title: "Servicios",
 value: stats?.totalServicios ?? 0,
 icon: TrendingUp,
 color: "text-[#1ea59c]",
 bg: "bg-[#1ea59c]/10 #1ea59c]/20",
 border: "border-[#1ea59c]/20",
 desc: "Servicios ofrecidos"
 },
 {
 title: "Adopciones",
 value: stats?.totalAdopciones ?? 0,
 icon: Heart,
 color: "text-[#2D3E82]",
 bg: "bg-[#2D3E82]/10 #2D3E82]/20",
 border: "border-[#2D3E82]/20",
 desc: "Mascotas publicadas"
 }
 ];

 if (loading) {
 return (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
 {[...Array(6)].map((_, i) => (
 <div key={i} className="bg-white/50 backdrop-blur-xl p-6 rounded-3xl border border-white/40 animate-pulse h-40" />
 ))}
 </div>
 );
 }

 return (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
 {statCards.map((stat, index) => (
 <div
 key={index}
 className={`relative overflow-hidden bg-white/40 backdrop-blur-xl rounded-[2rem] p-6 border ${stat.border} shadow-soft hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group`}
 >
 {/* Decorative Glow */}
 <div className={`absolute -right-4 -top-4 w-16 h-16 ${stat.bg} blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

 <div className={`${stat.bg} ${stat.color} p-3.5 rounded-2xl w-fit mb-5 group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
 <stat.icon size={22} strokeWidth={2.5} />
 </div>

 <p className="text-xs font-bold text-gray-500/80 uppercase tracking-widest mb-1">
 {stat.title}
 </p>

 <h3 className="text-2xl font-black text-[#2D3E82] tracking-tight">
 {stat.value}
 </h3>

 <div className="mt-4 pt-4 border-t border-gray-100/50 ">
 <p className="text-[10px] text-gray-400 font-medium leading-tight">
 {stat.desc}
 </p>
 </div>
 </div>
 ))}
 </div>
 );
};