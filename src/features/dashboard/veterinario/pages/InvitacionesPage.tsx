import { useState, useEffect } from "react";
import { Mail, Check, X, Briefcase, Building2 } from "lucide-react";
import { vetService } from "../services/vetService";
import type { StaffInvitation } from "../types/vet.types";
import Swal from "sweetalert2";

export const InvitacionesPage = () => {
 const [invitations, setInvitations] = useState<StaffInvitation[]>([]);
 const [isLoading, setIsLoading] = useState(true);

 useEffect(() => {
 const fetch = async () => {
 try {
 const data = await vetService.getMyInvitations();
 setInvitations(data);
 } catch (error) {
 console.error("Error fetching invitations:", error);
 } finally {
 setIsLoading(false);
 }
 };
 fetch();
 }, []);

 const handleAccept = async (staffId: number) => {
 try {
 await vetService.acceptInvitation(staffId);
 setInvitations((prev) => prev.filter((i) => i.idStaff !== staffId));
 Swal.fire("¡Aceptada!", "Ahora eres parte del equipo.", "success");
 } catch (error: any) {
 Swal.fire("Error", error.response?.data?.message || "No se pudo aceptar la invitación.", "error");
 }
 };

 const handleReject = async (staffId: number) => {
 const result = await Swal.fire({
 title: "¿Rechazar invitación?",
 text: "No podrás unirte al equipo a menos que te vuelvan a invitar.",
 icon: "warning",
 showCancelButton: true,
 confirmButtonColor: "#ef4444",
 cancelButtonColor: "#64748b",
 confirmButtonText: "Sí, rechazar",
 cancelButtonText: "Cancelar",
 });

 if (result.isConfirmed) {
 try {
 await vetService.rejectInvitation(staffId);
 setInvitations((prev) => prev.filter((i) => i.idStaff !== staffId));
 Swal.fire("Rechazada", "La invitación ha sido rechazada.", "info");
 } catch {
 Swal.fire("Error", "No se pudo rechazar la invitación.", "error");
 }
 }
 };

 return (
 <div className="h-full flex flex-col p-4 md:p-6 gap-4 md:gap-6 overflow-hidden">
 {/* Header */}
 <div className="shrink-0 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
 <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
 Invitaciones
 </h1>
 <p className="text-sm mt-1 text-slate-500 ">
 Empresas que te han invitado a formar parte de su equipo veterinario.
 </p>
 </div>

 {/* Content */}
 <div className="flex-1 flex flex-col min-h-0 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
 <div className="flex-1 overflow-auto custom-scrollbar p-4 md:p-6">
 {isLoading ? (
 <div className="space-y-4">
 {Array.from({ length: 3 }).map((_, i) => (
 <div key={i} className="h-20 bg-slate-50 rounded-xl animate-pulse" />
 ))}
 </div>
 ) : invitations.length === 0 ? (
 <div className="text-center py-16">
 <div className="h-16 w-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4">
 <Mail size={32} className="text-slate-400" />
 </div>
 <h3 className="text-lg font-semibold text-slate-900 mb-1">Sin invitaciones</h3>
 <p className="text-sm text-slate-500 ">
 No tienes invitaciones pendientes por el momento.
 </p>
 </div>
 ) : (
 <div className="space-y-4">
 {invitations.map((inv) => (
 <div
 key={inv.idStaff}
 className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200/60 hover:border-teal-200 :border-teal-800 transition-colors"
 >
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-md">
 <Building2 size={22} />
 </div>
 <div>
 <h3 className="text-base font-bold text-slate-900 ">
 {inv.empresaNombre || "Empresa"}
 </h3>
 <div className="flex items-center gap-3 mt-1">
 <span className="inline-flex items-center gap-1 text-xs text-slate-500">
 <Briefcase size={12} /> {inv.rolInterno}
 </span>
 </div>
 </div>
 </div>

 <div className="flex gap-2 sm:shrink-0">
 <button
 onClick={() => handleAccept(inv.idStaff)}
 className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold transition-all hover:shadow-lg hover:shadow-teal-500/20 hover:-translate-y-0.5 active:translate-y-0"
 >
 <Check size={16} /> Aceptar
 </button>
 <button
 onClick={() => handleReject(inv.idStaff)}
 className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 :bg-slate-700 transition-all"
 >
 <X size={16} /> Rechazar
 </button>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>

 {/* Footer */}
 <div className="shrink-0 px-6 py-4 bg-slate-50 border-t border-slate-200 ">
 <span className="text-sm font-medium text-slate-500 ">
 <span className="text-slate-900 ">{invitations.length}</span> invitaciones pendientes
 </span>
 </div>
 </div>
 </div>
 );
};
