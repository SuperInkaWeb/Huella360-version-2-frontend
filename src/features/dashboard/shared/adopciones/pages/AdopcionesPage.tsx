import { useState, useEffect } from "react";
import { adoptionService } from "../services/adoptionService";
import type { AdoptionResponse } from "../types/adoption.types";
import { Loader2, MapPin, Calendar, Info, Heart } from "lucide-react";
import { Button } from "../../../../../components/ui/Button";
import { PublicarAdopcionModal } from "../components/PublicarAdopcionModal";
import { PostularAdopcionModal } from "../components/PostularAdopcionModal";

export const AdopcionesPage = () => {
 const [adopciones, setAdopciones] = useState<AdoptionResponse[]>([]);
 const [isLoading, setIsLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

 const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
 const [selectedAdoption, setSelectedAdoption] = useState<AdoptionResponse | null>(null);

 useEffect(() => {
 fetchAdopciones();
 }, []);

 const fetchAdopciones = async () => {
 try {
 setIsLoading(true);
 const data = await adoptionService.getAvailableAdoptions(0, 50);
 setAdopciones(data.content);
 } catch (err) {
 console.error(err);
 setError("Error al cargar las adopciones disponibles.");
 } finally {
 setIsLoading(false);
 }
 };

 if (isLoading) {
 return (
 <div className="h-full flex items-center justify-center">
 <Loader2 className="animate-spin text-primary" size={32} />
 </div>
 );
 }

 if (error) {
 return (
 <div className="h-full flex items-center justify-center text-red-500">
 {error}
 </div>
 );
 }

 return (
 <div className="h-full flex flex-col p-4 md:p-6 lg:p-8 overflow-y-auto custom-scrollbar">
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
 <div>
 <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
 <Heart className="text-primary" /> Centro de Adopciones
 </h1>
 <p className="text-sm text-slate-500 mt-1">
 Encuentra a tu nuevo mejor amigo o publicita una adopción responsable en nuestra red.
 </p>
 </div>
 <Button className="shrink-0 gap-2 px-4 py-2" onClick={() => setIsPublishModalOpen(true)}>
 Publicar Adopción
 </Button>
 </div>

 {adopciones.length === 0 ? (
 <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-white rounded-2xl border border-slate-200">
 <Heart size={48} className="text-slate-300 mb-4" />
 <h3 className="text-xl font-semibold text-slate-700">
 No hay adopciones publicadas
 </h3>
 <p className="text-slate-500 mt-2 max-w-sm">
 Actualmente no hay ninguna mascota buscando un nuevo hogar. Regresa más tarde.
 </p>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
 {adopciones.map((adopcion) => (
 <div
 key={adopcion.id}
 className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow group"
 >
 <div className="h-48 bg-slate-100 relative">
 {adopcion.mascotaFotoUrl ? (
 <img
 src={adopcion.mascotaFotoUrl}
 alt={adopcion.mascotaNombre}
 className="w-full h-full object-cover"
 />
 ) : (
 <div className="w-full h-full flex items-center justify-center text-slate-400">
 <Heart size={48} strokeWidth={1} />
 </div>
 )}
 <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-medium text-primary shadow-sm">
 {adopcion.estado}
 </div>
 </div>

 <div className="p-5 flex-1 flex flex-col">
 <h3 className="text-lg font-bold text-slate-900 mb-1 line-clamp-1">
 {adopcion.titulo}
 </h3>
 <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-3 font-medium">
 {adopcion.mascotaNombre}
 </div>

 <div className="space-y-2 mb-4 flex-1">
 <div className="flex items-start gap-2 text-sm text-slate-600">
 <MapPin size={16} className="mt-0.5 shrink-0 text-slate-400" />
 <span className="line-clamp-1">{adopcion.ubicacionCiudad}</span>
 </div>
 <div className="flex items-start gap-2 text-sm text-slate-600">
 <Info size={16} className="mt-0.5 shrink-0 text-slate-400" />
 <span className="line-clamp-2">{adopcion.historia}</span>
 </div>
 </div>

 <hr className="border-slate-100 mb-4" />

 <div className="flex items-center justify-between">
 <div className="flex items-center gap-1.5 text-xs text-slate-500">
 <Calendar size={14} />
 {new Date(adopcion.fechaPublicacion).toLocaleDateString()}
 </div>
 <Button
 variant="outline"
 className="text-xs px-3 py-1.5 h-auto"
 onClick={() => {
 setSelectedAdoption(adopcion);
 setIsApplyModalOpen(true);
 }}
 >
 Postularse
 </Button>
 </div>
 </div>
 </div>
 ))}
 </div>
 )}

 <PublicarAdopcionModal
 isOpen={isPublishModalOpen}
 onClose={() => setIsPublishModalOpen(false)}
 onSuccess={fetchAdopciones}
 />

 <PostularAdopcionModal
 isOpen={isApplyModalOpen}
 onClose={() => setIsApplyModalOpen(false)}
 adopcion={selectedAdoption}
 />
 </div>
 );
};
