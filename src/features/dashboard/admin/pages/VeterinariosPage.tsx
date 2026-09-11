import { useState, useEffect } from "react";
import { Search, Stethoscope, Eye, Ban, CheckCircle } from "lucide-react";
import { Button } from "../../../../components/ui/Button";
import { adminService } from "../services/adminService";
import type { AdminVeterinario } from "../types/admin.types";
import { VeterinarioDetailModal } from "../components/VeterinarioDetailModal";
import Swal from "sweetalert2";

export const VeterinariosPage = () => {
 const [veterinarios, setVeterinarios] = useState<AdminVeterinario[]>([]);
 const [isLoading, setIsLoading] = useState(true);
 const [searchTerm, setSearchTerm] = useState("");

 // Modal State
 const [selectedVeterinario, setSelectedVeterinario] = useState<AdminVeterinario | null>(null);
 const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

 const fetchVeterinarios = async () => {
 setIsLoading(true);
 try {
 const data = await adminService.getVeterinarios(0, 50);
 setVeterinarios(data.content);
 } catch (error) {
 console.error("Error fetching veterinarios:", error);
 } finally {
 setIsLoading(false);
 }
 };

 useEffect(() => {
 fetchVeterinarios();
 }, []);

 const handleToggleStatus = async (veterinario: AdminVeterinario) => {
 const isVerified = veterinario.estadoValidacion === 'VERIFICADO';

 const result = await Swal.fire({
 title: isVerified ? '¿Desactivar especialista?' : '¿Activar especialista?',
 text: `El veterinario Dr. ${veterinario.nombres} cambiará su estado de validación en la plataforma.`,
 icon: 'warning',
 showCancelButton: true,
 confirmButtonColor: isVerified ? '#ef4444' : '#1ea59c',
 confirmButtonText: isVerified ? 'Sí, desactivar' : 'Sí, activar',
 cancelButtonText: 'Cancelar',
 background: 'rgba(255, 255, 255, 0.9)',
 backdrop: `rgba(45, 62, 130, 0.1)`,
 customClass: {
 popup: 'rounded-[1.5rem] border border-white/40 shadow-2xl backdrop-blur-xl',
 confirmButton: 'rounded-xl px-6 py-2.5 font-bold transition-all hover:scale-105',
 cancelButton: 'rounded-xl px-6 py-2.5 font-bold transition-all hover:scale-105'
 }
 });

 if (result.isConfirmed) {
 try {
 await adminService.toggleVeterinarioStatus(veterinario.id);
 const nextStatus = isVerified ? 'RECHAZADO' : 'VERIFICADO';
 setVeterinarios(veterinarios.map(v =>
 v.id === veterinario.id ? { ...v, estadoValidacion: nextStatus as any } : v
 ));
 Swal.fire({
 title: '¡Éxito!',
 text: 'Estado actualizado correctamente.',
 icon: 'success',
 timer: 2000,
 showConfirmButton: false,
 customClass: { popup: 'rounded-[1.5rem]' }
 });
 } catch (error) {
 Swal.fire({
 title: 'Error',
 text: 'No se pudo actualizar el estado.',
 icon: 'error',
 customClass: { popup: 'rounded-[1.5rem]' }
 });
 }
 }
 };

 const filteredVeterinarios = veterinarios.filter(v =>
 v.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
 v.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
 (v.numeroColegiatura && v.numeroColegiatura.includes(searchTerm)) ||
 (v.correo && v.correo.toLowerCase().includes(searchTerm.toLowerCase()))
 );

 return (
 <>
 <div className="h-full flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
 {/* Header Container */}
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
 <div className="space-y-1">
 <h1 className="text-4xl font-black text-[#2D3E82] tracking-tight flex items-center gap-3">
 <Stethoscope className="text-[#1ea59c]" size={36} />
 Gestión de Veterinarios
 </h1>
 <p className="text-slate-500 font-medium max-w-lg">
 Administra los profesionales veterinarios registrados y verifica sus credenciales en Huella360.
 </p>
 </div>

 {/* Filter & Search Bar - High Premium Look */}
 <div className="flex flex-col sm:flex-row items-center gap-3">
 <div className="relative group w-full sm:w-80">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1ea59c] transition-colors" size={18} />
 <input
 type="text"
 placeholder="Buscar por nombre, CMP o email..."
 className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-white/40 bg-white/60 backdrop-blur-xl focus:ring-4 focus:ring-[#1ea59c]/10 focus:border-[#1ea59c] transition-all outline-none placeholder:text-slate-400 shadow-soft"
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 />
 </div>
 </div>
 </div>

 {/* Main Table Content - Glassmorphic Card */}
 <div className="flex-1 min-h-0 bg-white/40 backdrop-blur-2xl rounded-[2.5rem] border border-white/40 shadow-soft overflow-hidden flex flex-col relative">
 <div className="flex-1 overflow-auto custom-scrollbar">
 {/* Desktop View */}
 <div className="hidden md:block min-w-[1000px]">
 <table className="w-full text-left border-collapse">
 <thead className="sticky top-0 z-20">
 <tr className="bg-white/60 backdrop-blur-2xl border-b border-gray-100 ">
 <th className="px-8 py-6 text-[11px] uppercase tracking-[0.2em] font-black text-slate-400 ">Especialista</th>
 <th className="px-8 py-6 text-[11px] uppercase tracking-[0.2em] font-black text-slate-400 ">Colegiatura</th>
 <th className="px-8 py-6 text-[11px] uppercase tracking-[0.2em] font-black text-slate-400 ">Contacto</th>
 <th className="px-8 py-6 text-[11px] uppercase tracking-[0.2em] font-black text-slate-400 ">Validación</th>
 <th className="px-8 py-6 text-[11px] uppercase tracking-[0.2em] font-black text-slate-400 text-right">Acciones</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100/50 ">
 {isLoading ? (
 Array.from({ length: 6 }).map((_, i) => (
 <tr key={i} className="animate-pulse">
 <td colSpan={5} className="px-8 py-8">
 <div className="flex items-center gap-4">
 <div className="h-12 w-12 rounded-2xl bg-slate-200 " />
 <div className="space-y-2">
 <div className="h-4 w-32 bg-slate-200 rounded" />
 <div className="h-3 w-24 bg-slate-100 rounded" />
 </div>
 </div>
 </td>
 </tr>
 ))
 ) : filteredVeterinarios.length === 0 ? (
 <tr>
 <td colSpan={5} className="px-8 py-24 text-center">
 <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-4">
 <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
 <Stethoscope size={40} className="text-slate-300 " />
 </div>
 <h3 className="text-xl font-bold text-[#2D3E82] ">Sin resultados</h3>
 <p className="text-slate-500 text-sm">No encontramos ningún veterinario que coincida con "<span className="font-bold text-[#1ea59c]">{searchTerm}</span>".</p>
 </div>
 </td>
 </tr>
 ) : (
 filteredVeterinarios.map((vet) => (
 <tr key={vet.id} className="hover:bg-white/60 :bg-white/5 transition-all duration-300 group">
 <td className="px-8 py-6">
 <div className="flex items-center gap-4">
 <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#1ea59c]/20 to-[#2D3E82]/20 flex items-center justify-center text-[#1ea59c] shrink-0 font-black text-lg border border-[#1ea59c]/20 shadow-sm group-hover:scale-110 transition-transform duration-500 overflow-hidden">
 {vet.fotoPerfilUrl ? (
 <img src={vet.fotoPerfilUrl} alt={vet.nombres} className="w-full h-full object-cover" />
 ) : (
 vet.nombres.charAt(0)
 )}
 </div>
 <div className="min-w-0">
 <p className="text-sm font-bold text-[#2D3E82] tracking-tight truncate group-hover:text-[#1ea59c] transition-colors">{vet.nombres} {vet.apellidos}</p>
 <p className="text-[11px] text-slate-500 font-medium truncate">{vet.especialidad || 'General'}</p>
 </div>
 </div>
 </td>
 <td className="px-8 py-6">
 <div className="space-y-1">
 <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">CMP</p>
 <p className="text-sm font-mono font-bold text-slate-700 ">{vet.numeroColegiatura || '---'}</p>
 </div>
 </td>
 <td className="px-8 py-6">
 <div className="flex flex-col gap-1">
 <span className="text-sm font-bold text-slate-800 ">{vet.correo || 'N/A'}</span>
 <span className="text-[11px] text-slate-500 truncate max-w-[200px] font-medium italic">Exp: {vet.aniosExperiencia || 0} años</span>
 </div>
 </td>
 <td className="px-8 py-6">
 <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all duration-300 ${vet.estadoValidacion === 'VERIFICADO'
 ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
 : vet.estadoValidacion === 'PENDIENTE'
 ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
 : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
 }`}>
 <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${vet.estadoValidacion === 'VERIFICADO' ? 'bg-emerald-500' : vet.estadoValidacion === 'PENDIENTE' ? 'bg-amber-500' : 'bg-rose-500'
 }`} />
 {vet.estadoValidacion}
 </span>
 </td>
 <td className="px-8 py-6 text-right">
 <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
 <button
 onClick={() => {
 setSelectedVeterinario(vet);
 setIsDetailModalOpen(true);
 }}
 className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-[#1ea59c] hover:bg-[#1ea59c]/10 rounded-xl transition-all duration-300 border border-transparent hover:border-[#1ea59c]/20 shadow-sm"
 title="Ver detalles"
 >
 <Eye size={18} />
 </button>
 <button
 onClick={() => handleToggleStatus(vet)}
 className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 border border-transparent shadow-sm ${vet.estadoValidacion === 'VERIFICADO'
 ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 hover:border-rose-500/20'
 : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-500/10 hover:border-emerald-500/20'
 }`}
 title={vet.estadoValidacion === 'VERIFICADO' ? "Desactivar" : "Activar"}
 >
 {vet.estadoValidacion === 'VERIFICADO' ? <Ban size={18} /> : <CheckCircle size={18} />}
 </button>
 </div>
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>

 {/* Mobile View - Enhanced Cards */}
 <div className="md:hidden flex flex-col p-6 gap-6">
 {filteredVeterinarios.length === 0 ? (
 <div className="text-center py-12">
 <Stethoscope size={40} className="mx-auto text-slate-300 mb-4" />
 <h3 className="text-xl font-bold text-[#2D3E82] ">Sin resultados</h3>
 <p className="text-sm text-slate-500 mt-1">No se encontraron veterinarios con los filtros aplicados.</p>
 </div>
 ) : filteredVeterinarios.map((vet) => (
 <div key={vet.id} className="relative group overflow-hidden bg-white/40 p-6 rounded-[2rem] border border-white/40 shadow-soft animate-in zoom-in-95 duration-500">
 <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#1ea59c]/5 to-[#2D3E82]/5 blur-3xl rounded-full" />

 <div className="flex items-center gap-4 mb-6">
 <div className="h-14 w-14 rounded-2xl bg-[#1ea59c]/10 flex items-center justify-center text-[#1ea59c] shrink-0 font-black text-2xl border border-[#1ea59c]/10 shadow-sm overflow-hidden">
 {vet.fotoPerfilUrl ? (
 <img src={vet.fotoPerfilUrl} alt={vet.nombres} className="w-full h-full object-cover" />
 ) : (
 vet.nombres.charAt(0)
 )}
 </div>
 <div className="flex-1 min-w-0">
 <h3 className="text-base font-black text-[#2D3E82] tracking-tight truncate">{vet.nombres} {vet.apellidos}</h3>
 <p className="text-xs text-slate-500 truncate">{vet.especialidad || 'General'}</p>
 </div>
 </div>

 <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
 <div className="space-y-1">
 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CMP</p>
 <p className="text-sm font-mono font-bold ">{vet.numeroColegiatura || '---'}</p>
 </div>
 <div className="space-y-1">
 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Validación</p>
 <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${vet.estadoValidacion === 'VERIFICADO' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
 }`}>
 {vet.estadoValidacion}
 </span>
 </div>
 </div>

 <div className="flex gap-3 pt-5 border-t border-gray-100 ">
 <Button
 variant="outline"
 onClick={() => {
 setSelectedVeterinario(vet);
 setIsDetailModalOpen(true);
 }}
 className="flex-1 text-[11px] font-black uppercase py-4 h-auto rounded-xl bg-white/50 backdrop-blur-md"
 >
 Detalles
 </Button>
 <Button
 variant="outline"
 onClick={() => handleToggleStatus(vet)}
 className={`flex-1 text-[11px] font-black uppercase py-4 h-auto rounded-xl transition-all active:scale-95 ${vet.estadoValidacion === 'VERIFICADO' ? 'text-rose-600 border-rose-200 hover:bg-rose-50' : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
 }`}
 >
 {vet.estadoValidacion === 'VERIFICADO' ? 'Desactivar' : 'Activar'}
 </Button>
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* Premium Pagination Section */}
 <div className="shrink-0 px-8 py-5 bg-white/60 backdrop-blur-2xl border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
 <div className="flex items-center gap-3">
 <div className="p-2 bg-[#1ea59c]/10 rounded-lg">
 <Stethoscope size={16} className="text-[#1ea59c]" />
 </div>
 <span className="text-xs font-bold text-slate-500 ">
 Mostrando <strong className="text-[#2D3E82] mx-1">{filteredVeterinarios.length}</strong> de <strong className="text-[#2D3E82] mx-1">{veterinarios.length}</strong> especialistas registrados
 </span>
 </div>
 </div>
 </div>
 </div>

 <VeterinarioDetailModal
 isOpen={isDetailModalOpen}
 onClose={() => setIsDetailModalOpen(false)}
 veterinario={selectedVeterinario}
 />
 </>
 );
};
