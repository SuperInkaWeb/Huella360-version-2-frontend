import { X, Mail, Shield, Calendar, Fingerprint, Activity, Info } from "lucide-react";
import { Button } from "../../../../components/ui/Button";
import type { AdminUser } from "../types/admin.types";

interface UserDetailModalProps {
 isOpen: boolean;
 onClose: () => void;
 user: AdminUser | null;
}

export const UserDetailModal = ({ isOpen, onClose, user }: UserDetailModalProps) => {
 if (!isOpen || !user) return null;

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
 <div className="bg-white/90 w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-white/40 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300 backdrop-blur-2xl">

 {/* Header - High Premium */}
 <div className="relative px-8 py-10 overflow-hidden">
 <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-[#1ea59c]/20 to-[#2D3E82]/20 blur-3xl rounded-full -mr-16 -mt-16" />

 <div className="relative flex items-center justify-between">
 <div className="flex items-center gap-6">
 <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#1ea59c] to-[#2D3E82] flex items-center justify-center text-white shadow-xl shadow-[#2D3E82]/20 border border-white/20 font-black text-2xl">
 {user.nombre?.charAt(0) || user.correo.charAt(0).toUpperCase()}
 </div>
 <div className="space-y-1">
 <h2 className="text-2xl font-black text-[#2D3E82] tracking-tight leading-none truncate max-w-[200px]">
 {user.nombre || 'Usuario Registrado'}
 </h2>
 <div className="flex items-center gap-2">
 <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-black tracking-widest uppercase border ${user.estado
 ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
 : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
 }`}>
 {user.estado ? 'ACTIVO' : 'INACTIVO'}
 </span>
 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">ROLE: {user.rol}</span>
 </div>
 </div>
 </div>
 <button
 onClick={onClose}
 className="p-2.5 text-slate-400 hover:text-[#2D3E82] :text-white hover:bg-white/50 :bg-white/5 rounded-2xl transition-all border border-transparent hover:border-slate-200 :border-white/10"
 >
 <X size={20} />
 </button>
 </div>
 </div>

 {/* Content Section */}
 <div className="flex-1 overflow-y-auto px-8 pb-10 custom-scrollbar space-y-8">

 {/* Identity Info */}
 <div className="grid grid-cols-1 gap-6">
 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1ea59c] flex items-center gap-2">
 <Fingerprint size={12} /> Perfil Identitario
 </h3>

 <div className="space-y-5">
 <UserDetailItem icon={<Mail size={16} />} label="Correo Electrónico" value={user.correo} />
 <UserDetailItem icon={<Shield size={16} />} label="Permisos del Sistema" value={user.rol} />
 <UserDetailItem icon={<Calendar size={16} />} label="Miembro desde" value={new Date(user.createdAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })} />
 </div>
 </div>

 {/* System Metadata */}
 <div className="grid grid-cols-1 gap-6 bg-[#2D3E82]/5 p-6 rounded-[2rem] border border-[#2D3E82]/5 ">
 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2D3E82] flex items-center gap-2">
 <Activity size={12} /> Estado del Sistema
 </h3>
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className={`w-3 h-3 rounded-full animate-pulse ${user.estado ? 'bg-emerald-500' : 'bg-rose-500'}`} />
 <span className="text-sm font-bold text-slate-700 ">Conexión Permitida</span>
 </div>
 <Info size={16} className="text-slate-300" />
 </div>
 </div>

 {/* Buttons */}
 <div className="flex gap-3 pt-4">
 <Button className="flex-1 rounded-2xl h-12 font-black uppercase text-[10px] tracking-widest bg-[#2D3E82] hover:bg-[#1ea59c] text-white" onClick={onClose}>
 Cerrar Detalles
 </Button>
 </div>
 </div>
 </div>
 </div>
 );
};

const UserDetailItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
 <div className="flex items-center gap-4 group">
 <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 group-hover:text-[#1ea59c] group-hover:bg-[#1ea59c]/5 transition-all border border-slate-100 group-hover:border-[#1ea59c]/20">
 {icon}
 </div>
 <div className="min-w-0">
 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
 <p className="text-sm font-bold text-[#2D3E82] truncate">
 {value}
 </p>
 </div>
 </div>
);
