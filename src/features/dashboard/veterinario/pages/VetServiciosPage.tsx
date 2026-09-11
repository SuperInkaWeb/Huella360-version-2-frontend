import { useState, useEffect, useMemo } from "react";
import {
 Search,
 Stethoscope,
 Clock,
 MapPin,
 Monitor,
 Home,
 RefreshCw,
 Plus,
 Edit2,
 Trash2
} from "lucide-react";
import { vetService } from "../services/vetService";
import type { Service, ModalidadServicio } from "../../../catalog/types/service.types";
import { VetServiceModal } from "../components/VetServiceModal";
import Swal from "sweetalert2";
import { Button } from "../../../../components/ui/Button";

/* ── Helpers ────────────────────────────────────────────────── */

const MODALIDAD_CONFIG: Record<ModalidadServicio, { label: string; icon: typeof MapPin; color: string }> = {
 PRESENCIAL: { label: "Presencial", icon: MapPin, color: "text-blue-600 bg-blue-50 " },
 VIRTUAL: { label: "Virtual", icon: Monitor, color: "text-violet-600 bg-violet-50 " },
 DOMICILIO: { label: "Domicilio", icon: Home, color: "text-amber-600 bg-amber-50 " },
 HIBRIDO: { label: "Híbrido", icon: RefreshCw, color: "text-teal-600 bg-teal-50 " },
};

const ModalidadBadge = ({ modalidad }: { modalidad: ModalidadServicio }) => {
 const config = MODALIDAD_CONFIG[modalidad];
 const Icon = config.icon;
 return (
 <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
 <Icon size={14} />
 {config.label}
 </span>
 );
};

/* ── Page Component ──────────────────────────────────────── */

export const VetServiciosPage = () => {
 const [services, setServices] = useState<Service[]>([]);
 const [isLoading, setIsLoading] = useState(true);
 const [searchTerm, setSearchTerm] = useState("");
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [serviceToEdit, setServiceToEdit] = useState<Service | null>(null);

 const fetchServices = async () => {
 setIsLoading(true);
 try {
 const data = await vetService.getMyServices(0, 50);
 setServices(data.content);
 } catch (error) {
 console.error("Error fetching vet services:", error);
 } finally {
 setIsLoading(false);
 }
 };

 useEffect(() => {
 fetchServices();
 }, []);

 const handleDelete = async (id: number) => {
 const result = await Swal.fire({
 title: "¿Eliminar servicio?",
 text: "El servicio se desactivará en tu catálogo.",
 icon: "warning",
 showCancelButton: true,
 confirmButtonColor: "#ef4444",
 confirmButtonText: "Sí, eliminar",
 cancelButtonText: "Cancelar"
 });

 if (result.isConfirmed) {
 try {
 await vetService.deleteService(id);
 Swal.fire("Eliminado", "Servicio eliminado correctamente", "success");
 fetchServices();
 } catch (error) {
 console.error("Error deleting service:", error);
 Swal.fire("Error", "No se pudo eliminar el servicio", "error");
 }
 }
 };

 const filteredServices = useMemo(
 () => services.filter((s) => s.nombre.toLowerCase().includes(searchTerm.toLowerCase())),
 [services, searchTerm],
 );

 return (
 <div className="h-full flex flex-col p-4 md:p-6 gap-4 md:gap-6 overflow-hidden">
 {/* Header */}
 <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
 <div>
 <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
 Mis Servicios
 </h1>
 <p className="text-sm mt-1 text-slate-500 ">
 Servicios que ofreces a través de las empresas donde colaboras.
 </p>
 </div>
 <Button
 onClick={() => { setServiceToEdit(null); setIsModalOpen(true); }}
 className="bg-teal-500 hover:bg-teal-600 text-white min-w-[150px] whitespace-nowrap"
 >
 <Plus size={18} className="mr-2" />
 Nuevo Servicio
 </Button>
 </div>

 {/* Search */}
 <div className="shrink-0">
 <div className="relative group">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={18} />
 <input
 type="text"
 placeholder="Buscar servicio..."
 className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none placeholder:text-slate-400 shadow-sm"
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 />
 </div>
 </div>

 {/* Content */}
 <div className="flex-1 flex flex-col min-h-0 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
 <div className="flex-1 overflow-auto custom-scrollbar">
 {/* Desktop Table */}
 <div className="hidden md:block min-w-[600px]">
 <table className="w-full text-left border-collapse">
 <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
 <tr>
 <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-slate-500 ">Servicio</th>
 <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-slate-500 ">Precio</th>
 <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-slate-500 ">Duración</th>
 <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-slate-500 ">Modalidad</th>
 <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-slate-500 ">Estado</th>
 <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-slate-500 text-right">Acciones</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100 ">
 {isLoading
 ? Array.from({ length: 4 }).map((_, i) => (
 <tr key={i} className="animate-pulse">
 <td colSpan={6} className="px-6 py-4 h-16 bg-slate-50/30 " />
 </tr>
 ))
 : filteredServices.length === 0
 ? (
 <tr>
 <td colSpan={6} className="px-6 py-16 text-center">
 <div className="flex flex-col items-center max-w-sm mx-auto">
 <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
 <Stethoscope size={32} className="text-slate-400" />
 </div>
 <h3 className="text-lg font-semibold text-slate-900 mb-1">Sin servicios</h3>
 <p className="text-sm text-slate-500 text-center">
 {searchTerm ? "No encontramos coincidencias." : "Aún no tienes servicios asignados."}
 </p>
 </div>
 </td>
 </tr>
 )
 : filteredServices.map((s) => (
 <tr key={s.id} className="hover:bg-slate-50/80 :bg-slate-800/40 transition-colors">
 <td className="px-6 py-4">
 <div className="flex items-center gap-3">
 <div className="h-9 w-9 rounded-lg bg-teal-500/10 flex items-center justify-center shrink-0">
 <Stethoscope size={18} className="text-teal-500" />
 </div>
 <div className="min-w-0">
 <p className="text-sm font-semibold text-slate-900 truncate">{s.nombre}</p>
 {s.empresaNombre && <p className="text-xs text-slate-500 truncate">{s.empresaNombre}</p>}
 </div>
 </div>
 </td>
 <td className="px-6 py-4 text-sm font-semibold text-slate-900 ">S/ {s.precio.toFixed(2)}</td>
 <td className="px-6 py-4">
 <span className="flex items-center gap-1 text-sm text-slate-600 ">
 <Clock size={14} className="text-slate-400" /> {s.duracionMinutos} min
 </span>
 </td>
 <td className="px-6 py-4"><ModalidadBadge modalidad={s.modalidad} /></td>
 <td className="px-6 py-4">
 <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${s.activo ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20 " : "bg-slate-50 text-slate-600 ring-slate-600/20 "}`}>
 {s.activo ? "Activo" : "Inactivo"}
 </span>
 </td>
 <td className="px-6 py-4 text-right">
 <div className="flex items-center justify-end gap-2">
 <button
 onClick={() => { setServiceToEdit(s); setIsModalOpen(true); }}
 className="p-2 text-slate-400 hover:text-teal-500 transition-colors bg-slate-50 hover:bg-teal-50 rounded-lg :bg-teal-500/10"
 title="Editar"
 >
 <Edit2 size={16} />
 </button>
 <button
 onClick={() => handleDelete(s.id)}
 className="p-2 text-slate-400 hover:text-red-500 transition-colors bg-slate-50 hover:bg-red-50 rounded-lg :bg-red-500/10"
 title="Eliminar"
 >
 <Trash2 size={16} />
 </button>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>

 {/* Mobile Cards */}
 <div className="md:hidden flex flex-col p-4 gap-4">
 {isLoading
 ? Array.from({ length: 3 }).map((_, i) => (
 <div key={i} className="bg-white p-4 rounded-2xl animate-pulse space-y-3 border border-slate-100 ">
 <div className="h-4 bg-slate-200 rounded w-3/4" />
 <div className="h-3 bg-slate-200 rounded w-1/2" />
 </div>
 ))
 : filteredServices.length === 0
 ? (
 <div className="py-12 text-center">
 <Stethoscope size={40} className="mx-auto mb-3 text-slate-300 " />
 <p className="text-slate-500 font-medium">No se encontraron servicios.</p>
 </div>
 )
 : filteredServices.map((s) => (
 <div key={s.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 space-y-3">
 <div className="flex gap-3">
 <div className="w-10 h-10 shrink-0 rounded-lg bg-teal-500/10 flex items-center justify-center">
 <Stethoscope size={18} className="text-teal-500" />
 </div>
 <div className="flex-1 min-w-0">
 <h3 className="text-sm font-bold text-slate-900 truncate">{s.nombre}</h3>
 {s.empresaNombre && <p className="text-xs text-slate-500 truncate">{s.empresaNombre}</p>}
 <div className="mt-1.5 flex items-center gap-3">
 <span className="text-base font-bold text-teal-600 ">S/ {s.precio.toFixed(2)}</span>
 <span className="text-xs text-slate-400 flex items-center gap-1"><Clock size={12} /> {s.duracionMinutos} min</span>
 </div>
 </div>
 </div>
 <div className="flex items-center gap-2 pt-3 border-t border-slate-200/60 ">
 <ModalidadBadge modalidad={s.modalidad} />
 <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${s.activo ? "bg-emerald-100 text-emerald-700 " : "bg-slate-100 text-slate-600 "}`}>
 {s.activo ? "Activo" : "Inactivo"}
 </span>
 <div className="ml-auto flex gap-1">
 <button
 onClick={() => { setServiceToEdit(s); setIsModalOpen(true); }}
 className="p-1.5 text-slate-400 hover:text-teal-500 bg-white rounded-md shadow-sm border border-slate-200 "
 >
 <Edit2 size={16} />
 </button>
 <button
 onClick={() => handleDelete(s.id)}
 className="p-1.5 text-slate-400 hover:text-red-500 bg-white rounded-md shadow-sm border border-slate-200 "
 >
 <Trash2 size={16} />
 </button>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* Footer */}
 <div className="shrink-0 px-6 py-4 bg-slate-50 border-t border-slate-200 ">
 <span className="text-sm font-medium text-slate-500 ">
 Mostrando <span className="text-slate-900 ">{filteredServices.length}</span> servicios
 </span>
 </div>
 </div>

 <VetServiceModal
 isOpen={isModalOpen}
 onClose={() => setIsModalOpen(false)}
 onSuccess={fetchServices}
 serviceToEdit={serviceToEdit}
 />
 </div>
 );
};
