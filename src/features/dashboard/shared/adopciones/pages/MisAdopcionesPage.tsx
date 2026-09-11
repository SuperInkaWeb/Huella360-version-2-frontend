import { useState, useEffect } from "react";
import { adoptionService } from "../services/adoptionService";
import type { AdoptionResponse, ApplicationResponse } from "../types/adoption.types";
import { Loader2, Calendar, Users, Inbox, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "../../../../../components/ui/Button";
import { GestionarSolicitudModal } from "../components/GestionarSolicitudModal";

export const MisAdopcionesPage = () => {
 const [myAdoptions, setMyAdoptions] = useState<AdoptionResponse[]>([]);
 const [isLoading, setIsLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);

 const [selectedAdoption, setSelectedAdoption] = useState<AdoptionResponse | null>(null);
 const [applications, setApplications] = useState<ApplicationResponse[]>([]);
 const [isLoadingApps, setIsLoadingApps] = useState(false);

 const [isManageModalOpen, setIsManageModalOpen] = useState(false);
 const [selectedApplication, setSelectedApplication] = useState<ApplicationResponse | null>(null);

 useEffect(() => {
 fetchMyAdoptions();
 }, []);

 const fetchMyAdoptions = async () => {
 try {
 setIsLoading(true);
 setError(null);
 const data = await adoptionService.getMyAdoptions();
 setMyAdoptions(data);
 } catch (err) {
 setError("Error al cargar tus publicaciones de adopción.");
 console.error(err);
 } finally {
 setIsLoading(false);
 }
 };

 const handleViewApplications = async (adoption: AdoptionResponse) => {
 setSelectedAdoption(adoption);
 try {
 setIsLoadingApps(true);
 const apps = await adoptionService.getApplicationsForMyAdoption(adoption.id);
 setApplications(apps);
 } catch (err) {
 console.error("Error al cargar solicitudes:", err);
 } finally {
 setIsLoadingApps(false);
 }
 };

 const handleManageApplication = (app: ApplicationResponse) => {
 setSelectedApplication(app);
 setIsManageModalOpen(true);
 };

 const handleApplicationProcessed = () => {
 if (selectedAdoption) {
 handleViewApplications(selectedAdoption);
 }
 fetchMyAdoptions();
 };

 const getStatusColors = (status: string) => {
 switch (status) {
 case "DISPONIBLE":
 return "bg-green-100 text-green-700 border-green-200";
 case "ADOPTADO":
 return "bg-blue-100 text-blue-700 border-blue-200";
 case "PAUSADO":
 return "bg-slate-100 text-slate-700 border-slate-200";
 default:
 return "bg-slate-100 text-slate-700 border-slate-200";
 }
 };

 const getAppStatusIcon = (status: string) => {
 switch (status) {
 case "PENDIENTE": return <Clock size={16} className="text-amber-500" />;
 case "APROBADA": return <CheckCircle size={16} className="text-green-500" />;
 case "RECHAZADA": return <XCircle size={16} className="text-red-500" />;
 default: return null;
 }
 };

 if (isLoading) {
 return (
 <div className="flex flex-col items-center justify-center p-12 text-slate-500">
 <Loader2 className="animate-spin mb-4 text-primary" size={40} />
 <p className="text-lg">Cargando tus publicaciones...</p>
 </div>
 );
 }

 if (error) {
 return (
 <div className="p-12 text-center text-red-500">
 <p className="text-lg">{error}</p>
 <Button onClick={fetchMyAdoptions} variant="outline" className="mt-4 mx-auto">
 Reintentar
 </Button>
 </div>
 );
 }

 return (
 <div className="space-y-6">
 <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
 <h1 className="text-2xl font-bold text-slate-900 mb-2">
 Mis Publicaciones de Adopción
 </h1>
 <p className="text-slate-500">
 Gestiona las mascotas que has puesto en adopción y revisa las solicitudes recibidas.
 </p>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

 <div className="lg:col-span-1 space-y-4">
 <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
 <Inbox size={20} className="text-primary" />
 Tus Publicaciones ({myAdoptions.length})
 </h2>

 {myAdoptions.length === 0 ? (
 <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-slate-100">
 <p className="text-slate-500">No tienes mascotas publicadas en adopción actualmente.</p>
 </div>
 ) : (
 <div className="space-y-3">
 {myAdoptions.map(adoption => (
 <div
 key={adoption.id}
 onClick={() => handleViewApplications(adoption)}
 className={`bg-white rounded-xl p-4 shadow-sm border transition-all cursor-pointer hover:shadow-md ${selectedAdoption?.id === adoption.id
 ? "border-primary ring-1 ring-primary/20"
 : "border-slate-100 hover:border-primary/50"
 }`}
 >
 <div className="flex gap-4">
 <div className="w-16 h-16 rounded-lg bg-slate-100 shrink-0 overflow-hidden">
 {adoption.mascotaFotoUrl ? (
  <img src={adoption.mascotaFotoUrl} alt={adoption.mascotaNombre} className="w-full h-full object-cover" loading="lazy" />
 ) : (
 <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">Sin foto</div>
 )}
 </div>
 <div className="flex-1 min-w-0">
 <h3 className="font-bold text-slate-900 truncate">
 {adoption.mascotaNombre}
 </h3>
 <p className="text-xs text-slate-500 truncate mb-2">{adoption.titulo}</p>
 <div className="flex items-center justify-between">
 <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${getStatusColors(adoption.estado)}`}>
 {adoption.estado}
 </span>
 <span className="text-xs text-slate-400 flex items-center gap-1">
 <Calendar size={12} />
 {new Date(adoption.fechaPublicacion).toLocaleDateString()}
 </span>
 </div>
 </div>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>

 <div className="lg:col-span-2">
 {selectedAdoption ? (
 <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[600px]">
 <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
 <div>
 <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
 <Users size={20} className="text-primary" />
 Solicitudes para {selectedAdoption.mascotaNombre}
 </h2>
 <p className="text-sm text-slate-500 mt-1">
 {applications.length} {applications.length === 1 ? 'solicitud recibida' : 'solicitudes recibidas'}
 </p>
 </div>
 <span className={`text-xs uppercase font-bold px-3 py-1 rounded-full border ${getStatusColors(selectedAdoption.estado)}`}>
 {selectedAdoption.estado}
 </span>
 </div>

 <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
 {isLoadingApps ? (
 <div className="flex justify-center py-12">
 <Loader2 className="animate-spin text-primary" size={32} />
 </div>
 ) : applications.length === 0 ? (
 <div className="text-center py-16 text-slate-500 bg-white rounded-xl border border-dashed border-slate-200">
 <Inbox size={48} className="mx-auto text-slate-300 mb-4" />
 <p>Aún no has recibido solicitudes de adopción para la mascota.</p>
 <p className="text-sm mt-1">Cuando alguien envíe una solicitud, aparecerá aquí.</p>
 </div>
 ) : (
 <div className="space-y-4">
 {applications.map(app => (
 <div key={app.id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
 <div className="flex items-start justify-between mb-4">
 <div>
 <div className="flex items-center gap-2 mb-1">
 <h4 className="font-bold text-slate-900">
 <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
 {app.interesadoEmail}
 </span>
 </h4>
 </div>
 <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
 <span className="flex items-center gap-1">
 <Calendar size={14} />
 Recibida: {new Date(app.fechaSolicitud).toLocaleDateString()}
 </span>
 <span className="flex items-center gap-1">
 Estado: {getAppStatusIcon(app.estado)} {app.estado}
 </span>
 </div>
 </div>
 <Button
 variant={app.estado === 'PENDIENTE' ? 'primary' : 'outline'}
 className="h-8 text-xs px-3"
 onClick={() => handleManageApplication(app)}
 >
 {app.estado === 'PENDIENTE' ? 'Revisar & Responder' : 'Ver Detalles'}
 </Button>
 </div>
 <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
 <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
 "{app.mensajePresentacion}"
 </p>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>
 ) : (
 <div className="bg-white rounded-2xl shadow-sm border border-slate-100 h-[600px] flex flex-col items-center justify-center text-slate-500 p-8 text-center">
 <Users size={64} className="text-slate-200 mb-6" />
 <h3 className="text-xl font-bold text-slate-700 mb-2">
 Selecciona una publicación
 </h3>
 <p className="max-w-md">
 Haz clic en una de tus mascotas de la lista izquierda para ver las solicitudes de adopción que ha recibido y poder gestionarlas.
 </p>
 </div>
 )}
 </div>
 </div>

 <GestionarSolicitudModal
 isOpen={isManageModalOpen}
 onClose={() => setIsManageModalOpen(false)}
 application={selectedApplication}
 onSuccess={handleApplicationProcessed}
 />
 </div>
 );
};
