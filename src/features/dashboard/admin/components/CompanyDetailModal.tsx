import { X, Globe, Mail, Phone, MapPin, Calendar, HardDrive, ShieldCheck, Building2 } from "lucide-react";
import { Button } from "../../../../components/ui/Button";
import type { Company } from "../types/admin.types";

interface CompanyDetailModalProps {
 isOpen: boolean;
 onClose: () => void;
 company: Company | null;
}

export const CompanyDetailModal = ({ isOpen, onClose, company }: CompanyDetailModalProps) => {
 if (!isOpen || !company) return null;

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
 <div className="bg-white/90 w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-white/40 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300 backdrop-blur-2xl">

 {/* Header - High Premium */}
 <div className="relative px-8 py-10 overflow-hidden">
 <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#1ea59c]/20 to-[#2D3E82]/20 blur-3xl rounded-full -mr-20 -mt-20" />

 <div className="relative flex items-center justify-between">
 <div className="flex items-center gap-6">
 <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-[#1ea59c] to-[#2D3E82] flex items-center justify-center text-white shadow-xl shadow-[#2D3E82]/20 border border-white/20 font-black text-3xl">
 {company.nombreComercial.charAt(0)}
 </div>
 <div className="space-y-1">
 <h2 className="text-3xl font-black text-[#2D3E82] tracking-tight leading-none">
 {company.nombreComercial}
 </h2>
 <div className="flex items-center gap-2">
 <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase border ${company.estadoValidacion === 'VERIFICADO'
 ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
 : company.estadoValidacion === 'PENDIENTE'
 ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
 : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
 }`}>
 {company.estadoValidacion}
 </span>
 <span className="text-xs text-slate-400 font-medium font-mono">ID ENTITY: #{company.id.toString().padStart(5, '0')}</span>
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
 <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#1ea59c]">Información Corporativa</h3>

 <InfoItem icon={<HardDrive size={18} />} label="RUC / Identificación" value={company.ruc} mono />
 <InfoItem icon={<Building2 size={18} />} label="Tipo de Servicio" value={company.tipoServicio || "No especificado"} />
 <InfoItem icon={<Mail size={18} />} label="Email Corporativo" value={company.emailContacto} />
 <InfoItem icon={<Phone size={18} />} label="Teléfono Directo" value={company.telefonoContacto} />
 <InfoItem icon={<ShieldCheck size={18} />} label="Owner Acc" value={company.ownerEmail} />
 </div>

 {/* Location & Meta */}
 <div className="space-y-6">
 <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#2D3E82] ">Ubicación y Registro</h3>

 <InfoItem icon={<MapPin size={18} />} label="Dirección Física" value={company.direccion} italic />
 <InfoItem icon={<Globe size={18} />} label="Ciudad / País" value={`${company.ciudad}, ${company.pais}`} />
 <InfoItem icon={<Calendar size={18} />} label="Fecha de Registro" value={new Date(company.createdAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })} />
 </div>

 </div>

 {/* Action Footer integrated */}
 <div className="mt-12 pt-8 border-t border-gray-100 flex gap-4">
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
