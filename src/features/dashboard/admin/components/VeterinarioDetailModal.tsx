import { X, Mail, BookOpen, Fingerprint, Calendar, Activity, Award } from "lucide-react";
import { Button } from "../../../../components/ui/Button";
import type { AdminVeterinario } from "../types/admin.types";

interface VeterinarioDetailModalProps {
 isOpen: boolean;
 onClose: () => void;
 veterinario: AdminVeterinario | null;
}

export const VeterinarioDetailModal = ({ isOpen, onClose, veterinario }: VeterinarioDetailModalProps) => {
 if (!isOpen || !veterinario) return null;

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
 <div className="bg-white/90 w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-white/40 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300 backdrop-blur-2xl">

 {/* Header - High Premium */}
 <div className="relative px-8 py-10 overflow-hidden">
 <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#1ea59c]/20 to-[#2D3E82]/20 blur-3xl rounded-full -mr-20 -mt-20" />

 <div className="relative flex items-center justify-between">
 <div className="flex items-center gap-6">
 <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-[#1ea59c] to-[#2D3E82] flex items-center justify-center text-white shadow-xl shadow-[#2D3E82]/20 border border-white/20 font-black text-3xl overflow-hidden">
 {veterinario.fotoPerfilUrl ? (
 <img src={veterinario.fotoPerfilUrl} alt={veterinario.nombres} className="w-full h-full object-cover" loading="lazy" />
 ) : (
 veterinario.nombres.charAt(0)
 )}
 </div>
 <div className="space-y-1">
 <h2 className="text-3xl font-black text-[#2D3E82] tracking-tight leading-none">
 Dr. {veterinario.nombres} {veterinario.apellidos}
 </h2>
 <div className="flex items-center gap-2">
 <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase border ${veterinario.estadoValidacion === 'VERIFICADO'
 ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
 : veterinario.estadoValidacion === 'PENDIENTE'
 ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
 : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
 }`}>
 {veterinario.estadoValidacion}
 </span>
 <span className="text-xs text-slate-400 font-medium font-mono">ID: #{veterinario.id.toString().padStart(5, '0')}</span>
 </div>
 </div>
 </div>
 <button
 onClick={onClose}
 className="p-3 text-slate-400 hover:text-[#2D3E82] :text-white hover:bg-white/50 :bg-white/5 rounded-2xl transition-all border border-transparent hover:border-slate-200 :border-white/10"
 >
 <X size={24} />
 </button>
 </div>
 </div>

 {/* Content - Two columns grid */}
 <div className="flex-1 overflow-y-auto px-8 pb-10 custom-scrollbar">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

 {/* Primary Details */}
 <div className="space-y-6">
 <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#1ea59c]">Perfil Profesional</h3>

 <InfoItem icon={<Fingerprint size={18} />} label="Nº de Colegiatura" value={veterinario.numeroColegiatura || 'No especificado'} mono />
 <InfoItem icon={<Award size={18} />} label="Especialidad" value={veterinario.especialidad || 'General'} />
 <InfoItem icon={<BookOpen size={18} />} label="Experiencia" value={`${veterinario.aniosExperiencia || 0} años`} />

 </div>

 {/* Contact & Meta */}
 <div className="space-y-6">
 <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#2D3E82] ">Contacto y Registro</h3>

 <InfoItem icon={<Mail size={18} />} label="Correo Electrónico" value={veterinario.correo || 'No disponible'} />
 <InfoItem icon={<Calendar size={18} />} label="Fecha de Registro" value={veterinario.createdAt ? new Date(veterinario.createdAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' }) : 'N/A'} />
 <div className="group flex items-start gap-4 pt-2">
 <div className="mt-1 w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-[#1ea59c] transition-colors border border-transparent group-hover:border-[#1ea59c]/20">
 <Activity size={18} />
 </div>
 <div className="min-w-0">
 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Acceso Sistema</p>
 <div className="flex items-center gap-2">
 <div className={`w-2 h-2 rounded-full animate-pulse ${veterinario.usuarioActivo ? 'bg-emerald-500' : 'bg-rose-500'}`} />
 <span className="text-sm font-bold text-[#2D3E82] ">{veterinario.usuarioActivo ? 'ACTIVO' : 'INACTIVO'}</span>
 </div>
 </div>
 </div>
 </div>

 </div>

 {/* Biography block */}
 {veterinario.biografia && (
 <div className="mt-8 pt-6 border-t border-gray-100 ">
 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Biografía / Acerca de</h3>
 <p className="text-sm text-slate-600 leading-relaxed italic">"{veterinario.biografia}"</p>
 </div>
 )}

 {/* Action Footer integrated */}
 <div className="mt-12 flex gap-4">
 <Button className="flex-1 rounded-2xl h-14 font-black uppercase text-xs tracking-widest bg-[#2D3E82] hover:bg-[#1ea59c] text-white shadow-lg shadow-[#2D3E82]/20" onClick={onClose}>
 Cerrar Detalles
 </Button>
 </div>
 </div>
 </div>
 </div>
 );
};

const InfoItem = ({ icon, label, value, mono = false, italic = false }: { icon: React.ReactNode, label: string, value: string, mono?: boolean, italic?: boolean }) => (
 <div className="group flex items-start gap-4">
 <div className="mt-1 w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-[#1ea59c] transition-colors border border-transparent group-hover:border-[#1ea59c]/20">
 {icon}
 </div>
 <div className="min-w-0">
 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
 <p className={`text-sm font-bold text-[#2D3E82] truncate ${mono ? 'font-mono' : ''} ${italic ? 'italic font-medium' : ''}`}>
 {value}
 </p>
 </div>
 </div>
);
