import { useState, useEffect } from "react";
import { adoptionService } from "../../shared/adopciones/services/adoptionService";
import type { ApplicationResponse } from "../../shared/adopciones/types/adoption.types";
import { Loader2, Calendar, Inbox, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "../../../../components/ui/Button";

export const MisSolicitudesPage = () => {
 const [myApplications, setMyApplications] = useState<ApplicationResponse[]>([]);
 const [isLoading, setIsLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);

 useEffect(() => {
 fetchMyApplications();
 }, []);

 const fetchMyApplications = async () => {
 try {
 setIsLoading(true);
 setError(null);
 const data = await adoptionService.getMySentApplications();
 setMyApplications(data);
 } catch (err) {
 setError("Error al cargar tus solicitudes de adopción enviadas.");
 console.error(err);
 } finally {
 setIsLoading(false);
 }
 };

 const getAppStatusIcon = (status: string) => {
 switch (status) {
 case "PENDIENTE": return <Clock size={20} className="text-amber-500" />;
 case "APROBADA": return <CheckCircle size={20} className="text-green-500" />;
 case "RECHAZADA": return <XCircle size={20} className="text-red-500" />;
 default: return null;
 }
 };

 const getStatusColors = (status: string) => {
 switch (status) {
 case "PENDIENTE":
 return "bg-amber-100 text-amber-700 border-amber-200 ";
 case "APROBADA":
 return "bg-green-100 text-green-700 border-green-200 ";
 case "RECHAZADA":
 return "bg-red-100 text-red-700 border-red-200 ";
 default:
 return "bg-slate-100 text-slate-700 border-slate-200 ";
 }
 };

 if (isLoading) {
 return (
 <div className="flex flex-col items-center justify-center p-12 text-slate-500">
 <Loader2 className="animate-spin mb-4 text-primary" size={40} />
 <p className="text-lg">Cargando tus solicitudes...</p>
 </div>
 );
 }

 if (error) {
 return (
 <div className="p-12 text-center text-red-500">
 <p className="text-lg">{error}</p>
 <Button onClick={fetchMyApplications} variant="outline" className="mt-4 mx-auto">
 Reintentar
 </Button>
 </div>
 );
 }

 return (
 <div className="space-y-6">
 <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 ">
 <h1 className="text-2xl font-bold text-slate-900 mb-2">
 Mis Solicitudes de Adopción
 </h1>
 <p className="text-slate-500 ">
 Sigue el estado de las solicitudes que has enviado para adoptar a una mascota.
 </p>
 </div>

 <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 ">
 {myApplications.length === 0 ? (
 <div className="text-center py-16 text-slate-500 rounded-xl border border-dashed border-slate-200 ">
 <Inbox size={48} className="mx-auto text-slate-300 mb-4" />
 <p>Aún no has enviado ninguna solicitud para adoptar una mascota.</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {myApplications.map(app => (
 <div key={app.id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col h-full transform transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
 <div className="flex items-start justify-between mb-4">
 <div className="flex items-center gap-2">
 {getAppStatusIcon(app.estado)}
 <h3 className="font-bold text-slate-900 ">Estado de Solicitud</h3>
 </div>
 <span className={`text-xs uppercase font-bold px-3 py-1 rounded-full border ${getStatusColors(app.estado)}`}>
 {app.estado}
 </span>
 </div>
 <div className="flex-1 space-y-4">
 <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 ">
 <p className="text-sm font-medium text-slate-700 mb-2">Tu mensaje de presentación:</p>
 <p className="text-sm text-slate-600 italic line-clamp-3">
 "{app.mensajePresentacion}"
 </p>
 </div>

 {app.estado === "RECHAZADA" && app.motivoRechazo && (
 <div className="bg-red-50 p-4 rounded-lg border border-red-100 ">
 <p className="text-sm font-medium text-red-800 mb-1">Motivo de rechazo:</p>
 <p className="text-sm text-red-700 ">
 {app.motivoRechazo}
 </p>
 </div>
 )}

 <div className="flex items-center gap-2 text-xs text-slate-500 mt-auto pt-4 border-t border-slate-100 ">
 <Calendar size={14} />
 <span>Enviada: {new Date(app.fechaSolicitud).toLocaleDateString()}</span>
 </div>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>
 );
};
