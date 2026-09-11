import { useEffect, useState } from "react";
import { Calendar, Clock, PawPrint, X, Check, Loader2 } from "lucide-react";
import { appointmentService } from "../../shared/appointments/appointmentService";
import type { CitaResponse } from "../../shared/appointments/appointmentService";

const STATUS_STYLES: Record<string, string> = {
 SOLICITADA: "bg-blue-100 text-blue-700 ",
 CONFIRMADA: "bg-emerald-100 text-emerald-700 ",
 COMPLETADA: "bg-slate-100 text-slate-700 ",
 RECHAZADA: "bg-red-100 text-red-700 ",
 CANCELADA: "bg-red-100 text-red-700 ",
 NOSHOW: "bg-orange-100 text-orange-700 ",
};

const STATUS_LABELS: Record<string, string> = {
 SOLICITADA: "Solicitada",
 CONFIRMADA: "Confirmada",
 COMPLETADA: "Completada",
 RECHAZADA: "Rechazada",
 CANCELADA: "Cancelada",
 NOSHOW: "No asistió",
};

export const MisCitasPage = () => {
 const [citas, setCitas] = useState<CitaResponse[]>([]);
 const [isLoading, setIsLoading] = useState(true);

 useEffect(() => {
 const load = async () => {
 try {
 const data = await appointmentService.getMyCitas();
 setCitas(data);
 } catch (err) {
 console.error("Error fetching citas:", err);
 } finally {
 setIsLoading(false);
 }
 };
 load();
 }, []);

 return (
 <div className="p-6 max-w-4xl mx-auto">
 <div className="mb-8">
 <h1 className="text-3xl font-black text-slate-900 mb-2 flex items-center gap-3">
 <Calendar className="text-blue-500" size={32} />
 Mis Citas
 </h1>
 <p className="text-slate-500">Aquí puedes ver el estado de todas las citas que has solicitado.</p>
 </div>

 {isLoading ? (
 <div className="flex flex-col items-center justify-center py-20">
 <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
 <p className="text-slate-400">Cargando tus citas...</p>
 </div>
 ) : citas.length === 0 ? (
 <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 ">
 <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
 <Calendar className="w-10 h-10 text-slate-400" />
 </div>
 <h2 className="text-2xl font-bold text-slate-900 mb-2">Sin citas aún</h2>
 <p className="text-slate-500 max-w-sm mx-auto">
 Aún no tienes citas agendadas. Compra un servicio en el Marketplace y solicita un turno.
 </p>
 </div>
 ) : (
 <div className="space-y-4">
 {citas.map((cita) => (
 <div key={cita.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col md:flex-row gap-5">
 {/* Date/Time Block */}
 <div className="flex md:flex-col items-center justify-center bg-blue-50 rounded-2xl px-5 py-4 shrink-0 gap-2 md:gap-0 md:text-center md:w-28">
 <span className="text-2xl font-black text-blue-600 ">
 {cita.horaInicio?.slice(0, 5) ?? "--:--"}
 </span>
 <span className="text-xs font-semibold text-slate-500 md:mt-1">
 {cita.fechaProgramada
 ? new Date(cita.fechaProgramada + "T00:00:00").toLocaleDateString("es-EC", { day: "numeric", month: "short", year: "numeric" })
 : "Sin fecha"}
 </span>
 </div>

 {/* Info */}
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 mb-1 flex-wrap">
 <h3 className="font-bold text-lg text-slate-900 truncate">
 {cita.servicioNombre}
 </h3>
 <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase ${STATUS_STYLES[cita.estado] ?? "bg-slate-100 text-slate-600"}`}>
 {STATUS_LABELS[cita.estado] ?? cita.estado}
 </span>
 </div>

 <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
 <span className="flex items-center gap-1.5">
 <PawPrint size={14} className="text-blue-400" />
 {cita.mascotaNombre || "Sin mascota"}
 </span>
 <span className="flex items-center gap-1.5">
 <Clock size={14} />
 Hasta las {cita.horaFin?.slice(0, 5) ?? "--:--"}
 </span>
 {cita.veterinarioNombre && cita.veterinarioNombre !== "Pendiente" && (
 <span className="flex items-center gap-1.5">
 <Check size={14} className="text-emerald-500" />
 {cita.veterinarioNombre}
 </span>
 )}
 </div>

 {cita.notasCliente && (
 <p className="mt-2 text-xs italic text-slate-400 line-clamp-2">
 {cita.notasCliente}
 </p>
 )}
 {cita.notasInternas && (
 <p className="mt-2 text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100 ">
 <span className="font-semibold">Nota de la clínica:</span> {cita.notasInternas}
 </p>
 )}
 </div>

 {/* Status icon */}
 <div className="flex items-center justify-center md:pl-4">
 {cita.estado === "RECHAZADA" || cita.estado === "CANCELADA" ? (
 <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-500">
 <X size={20} />
 </div>
 ) : cita.estado === "COMPLETADA" ? (
 <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-500">
 <Check size={20} />
 </div>
 ) : (
 <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-500">
 <Clock size={20} />
 </div>
 )}
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 );
};
