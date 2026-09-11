import { useState, useEffect } from "react";
import { Search, Users, Shield, Ban, CheckCircle, Mail, UserCheck } from "lucide-react";
import { Button } from "../../../../components/ui/Button";
import { adminService } from "../services/adminService";
import type { AdminUser } from "../types/admin.types";
import { UserDetailModal } from "../components/UserDetailModal";
import Swal from "sweetalert2";

export const UsuariosPage = () => {
 const [users, setUsers] = useState<AdminUser[]>([]);
 const [isLoading, setIsLoading] = useState(true);
 const [searchTerm, setSearchTerm] = useState("");

 // Modal State
 const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
 const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

 const fetchUsers = async () => {
 setIsLoading(true);
 try {
 const data = await adminService.getUsers(0, 50);
 setUsers(data.content);
 } catch (error) {
 console.error("Error fetching users:", error);
 } finally {
 setIsLoading(false);
 }
 };

 useEffect(() => {
 fetchUsers();
 }, []);

 const handleToggleStatus = async (user: AdminUser) => {
 const result = await Swal.fire({
 title: user.estado ? '¿Desactivar usuario?' : '¿Activar usuario?',
 text: `El usuario ${user.correo} cambiará su estado de acceso al sistema.`,
 icon: 'warning',
 showCancelButton: true,
 confirmButtonColor: user.estado ? '#ef4444' : '#1ea59c',
 confirmButtonText: user.estado ? 'Sí, desactivar' : 'Sí, activar',
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
 await adminService.toggleUserStatus(user.id);
 setUsers(users.map(u =>
 u.id === user.id ? { ...u, estado: !u.estado } : u
 ));
 Swal.fire({
 title: '¡Éxito!',
 text: 'Estado del usuario actualizado correctamente.',
 icon: 'success',
 timer: 2000,
 showConfirmButton: false,
 customClass: { popup: 'rounded-[1.5rem]' }
 });
 } catch (error) {
 Swal.fire({
 title: 'Error',
 text: 'No se pudo actualizar el estado del usuario.',
 icon: 'error',
 customClass: { popup: 'rounded-[1.5rem]' }
 });
 }
 }
 };

 const filteredUsers = users.filter(u => {
 const name = u.nombre?.toLowerCase() ?? "";
 const correo = u.correo?.toLowerCase() ?? "";
 const term = searchTerm.toLowerCase();

 return name.includes(term) || correo.includes(term);
 });

 return (
 <>
 <div className="h-full flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
 {/* Header Container */}
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
 <div className="space-y-1">
 <h1 className="text-4xl font-black text-[#2D3E82] tracking-tight flex items-center gap-3">
 <Users className="text-[#1ea59c]" size={36} />
 Gestión de Usuarios
 </h1>
 <p className="text-slate-500 font-medium max-w-lg">
 Control centralizado de accesos, roles y perfiles para todos los usuarios de la plataforma Huella360.
 </p>
 </div>

 {/* Search Bar - Matching Style */}
 <div className="flex flex-col sm:flex-row items-center gap-3">
 <div className="relative group w-full sm:w-80">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1ea59c] transition-colors" size={18} />
 <input
 type="text"
 placeholder="Buscar por nombre o email..."
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
 <div className="hidden md:block min-w-[900px]">
 <table className="w-full text-left border-collapse">
 <thead className="sticky top-0 z-20">
 <tr className="bg-white/60 backdrop-blur-2xl border-b border-gray-100 ">
 <th className="px-8 py-6 text-[11px] uppercase tracking-[0.2em] font-black text-slate-400 ">Identidad</th>
 <th className="px-8 py-6 text-[11px] uppercase tracking-[0.2em] font-black text-slate-400 ">Privilegios</th>
 <th className="px-8 py-6 text-[11px] uppercase tracking-[0.2em] font-black text-slate-400 ">Fecha Registro</th>
 <th className="px-8 py-6 text-[11px] uppercase tracking-[0.2em] font-black text-slate-400 ">Acceso</th>
 <th className="px-8 py-6 text-[11px] uppercase tracking-[0.2em] font-black text-slate-400 text-right">Acciones</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100/50 ">
 {isLoading ? (
 Array.from({ length: 6 }).map((_, i) => (
 <tr key={i} className="animate-pulse">
 <td colSpan={5} className="px-8 py-8">
 <div className="flex items-center gap-4">
 <div className="h-12 w-12 rounded-full bg-slate-200 " />
 <div className="space-y-2">
 <div className="h-4 w-32 bg-slate-200 rounded" />
 <div className="h-3 w-24 bg-slate-100 rounded" />
 </div>
 </div>
 </td>
 </tr>
 ))
 ) : filteredUsers.length === 0 ? (
 <tr>
 <td colSpan={5} className="px-8 py-24 text-center">
 <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-4">
 <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
 <Users size={40} />
 </div>
 <h3 className="text-xl font-bold text-[#2D3E82] ">Sin usuarios encontrados</h3>
 <p className="text-sm text-slate-500 ">No hay coincidencias para "<span className="font-bold text-[#1ea59c]">{searchTerm}</span>".</p>
 </div>
 </td>
 </tr>
 ) : (
 filteredUsers.map((user) => (
 <tr key={user.id} className="hover:bg-white/60 :bg-white/5 transition-all duration-300 group">
 <td className="px-8 py-6">
 <div className="flex items-center gap-4">
 <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#1ea59c]/20 to-[#2D3E82]/20 flex items-center justify-center text-[#1ea59c] shrink-0 border border-[#1ea59c]/20 shadow-sm group-hover:scale-110 transition-transform duration-500">
 <Mail size={18} />
 </div>
 <div className="min-w-0">
 <p className="text-sm font-bold text-[#2D3E82] tracking-tight truncate group-hover:text-[#1ea59c] transition-colors">{user.nombre || 'Usuario sin nombre'}</p>
 <p className="text-[11px] text-slate-500 font-medium truncate">{user.correo}</p>
 </div>
 </div>
 </td>
 <td className="px-8 py-6">
 <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase bg-slate-100 text-slate-600 border border-slate-200 group-hover:border-[#1ea59c]/30 transition-colors">
 <Shield size={12} className="text-[#1ea59c]" />
 {user.rol}
 </span>
 </td>
 <td className="px-8 py-6">
 <div className="flex items-center gap-2 text-slate-500 font-medium text-sm">
 {new Date(user.createdAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
 </div>
 </td>
 <td className="px-8 py-6">
 <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all duration-300 ${user.estado
 ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
 : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
 }`}>
 <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${user.estado ? 'bg-emerald-500' : 'bg-rose-500'}`} />
 {user.estado ? 'ACTIVO' : 'INACTIVO'}
 </span>
 </td>
 <td className="px-8 py-6 text-right">
 <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
 <button
 onClick={() => handleToggleStatus(user)}
 className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 border border-transparent shadow-sm ${user.estado
 ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 hover:border-rose-500/20'
 : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-500/10 hover:border-emerald-500/20'
 }`}
 title={user.estado ? "Desactivar" : "Activar"}
 >
 {user.estado ? <Ban size={18} /> : <CheckCircle size={18} />}
 </button>
 <button
 onClick={() => {
 setSelectedUser(user);
 setIsDetailModalOpen(true);
 }}
 className="w-10 h-10 flex items-center justify-center text-white bg-[#2D3E82] hover:bg-[#1ea59c] rounded-xl transition-all duration-300 shadow-md active:scale-95"
 title="Ver Perfil Completo"
 >
 <UserCheck size={18} />
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
 {filteredUsers.length === 0 ? (
 <div className="text-center py-12">
 <Users size={40} className="mx-auto text-slate-300 mb-4" />
 <h3 className="text-xl font-bold text-[#2D3E82] ">Sin usuarios encontrados</h3>
 <p className="text-sm text-slate-500 mt-1">No se encontraron usuarios con los filtros aplicados.</p>
 </div>
 ) : filteredUsers.map((user) => (
 <div key={user.id} className="relative group overflow-hidden bg-white/40 p-6 rounded-[2rem] border border-white/40 shadow-soft animate-in zoom-in-95 duration-500">
 <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#1ea59c]/5 to-[#2D3E82]/5 blur-3xl rounded-full" />

 <div className="flex items-center gap-4 mb-6">
 <div className="h-14 w-14 rounded-full bg-[#1ea59c]/10 flex items-center justify-center text-[#1ea59c] shrink-0 border border-[#1ea59c]/10 shadow-sm font-black text-xl">
 <Mail size={24} />
 </div>
 <div className="flex-1 min-w-0">
 <h3 className="text-base font-black text-[#2D3E82] tracking-tight truncate">{user.nombre || 'Usuario'}</h3>
 <p className="text-xs text-slate-500 truncate">{user.correo}</p>
 </div>
 </div>

 <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
 <div className="space-y-1">
 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rol asignado</p>
 <div className="flex items-center gap-1.5 py-1">
 <Shield size={10} className="text-[#1ea59c]" />
 <span className="text-xs font-bold ">{user.rol}</span>
 </div>
 </div>
 <div className="space-y-1 text-right">
 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Acceso</p>
 <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${user.estado ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
 }`}>
 {user.estado ? 'ACTIVO' : 'INACTIVO'}
 </span>
 </div>
 </div>

 <div className="flex gap-3 pt-5 border-t border-gray-100 ">
 <Button
 variant="outline"
 onClick={() => {
 setSelectedUser(user);
 setIsDetailModalOpen(true);
 }}
 className="flex-1 text-[11px] font-black uppercase py-4 h-auto rounded-xl bg-white/50 backdrop-blur-md"
 >
 Perfil
 </Button>
 <Button
 variant="outline"
 onClick={() => handleToggleStatus(user)}
 className={`flex-1 text-[11px] font-black uppercase py-4 h-auto rounded-xl transition-all active:scale-95 ${user.estado ? 'text-rose-600 border-rose-200 hover:bg-rose-50' : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
 }`}
 >
 {user.estado ? 'Desactivar' : 'Activar'}
 </Button>
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* Pagination Section */}
 <div className="shrink-0 px-8 py-5 bg-white/60 backdrop-blur-2xl border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
 <div className="flex items-center gap-3">
 <div className="p-2 bg-[#1ea59c]/10 rounded-lg">
 <Users size={16} className="text-[#1ea59c]" />
 </div>
 <span className="text-xs font-bold text-slate-500 ">
 Mostrando <strong className="text-[#2D3E82] mx-1">{filteredUsers.length}</strong> de <strong className="text-[#2D3E82] mx-1">{users.length}</strong> cuentas activas
 </span>
 </div>
 </div>
 </div>
 </div>
 <UserDetailModal
 isOpen={isDetailModalOpen}
 onClose={() => setIsDetailModalOpen(false)}
 user={selectedUser}
 />
 </>
 );
};
