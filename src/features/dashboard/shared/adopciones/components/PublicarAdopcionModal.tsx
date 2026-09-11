import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Loader2, Heart, Dog } from "lucide-react";
import Swal from "sweetalert2";
import { createPortal } from "react-dom";
import { Button } from "../../../../../components/ui/Button";
import { Input } from "../../../../../components/ui/Input";
import { adoptionService } from "../services/adoptionService";

import { petService } from "../../../cliente/services/petService";
import type { Pet } from "../../../cliente/types/pet.types";

const publicAdoptionSchema = z.object({
 mascotaId: z.coerce.number().min(1, "Debe seleccionar una mascota"),
 titulo: z.string().min(5, "El título debe tener al menos 5 caracteres").max(100, "Máximo 100 caracteres"),
 historia: z.string().min(10, "Cuente un poco sobre la mascota").max(500, "Máximo 500 caracteres"),
 requisitos: z.string().min(5, "Indique los requisitos para adoptar").max(300, "Máximo 300 caracteres"),
 ubicacionCiudad: z.string().min(3, "Indique la ciudad de ubicación").max(100, "Máximo 100 caracteres"),
});

type PublicAdoptionFormValues = z.infer<typeof publicAdoptionSchema>;

interface PublicarAdopcionModalProps {
 isOpen: boolean;
 onClose: () => void;
 onSuccess: () => void;
}

export const PublicarAdopcionModal = ({ isOpen, onClose, onSuccess }: PublicarAdopcionModalProps) => {
 const [pets, setPets] = useState<Pet[]>([]);
 const [isLoadingPets, setIsLoadingPets] = useState(true);

 const {
 register,
 handleSubmit,
 reset,
 formState: { errors, isSubmitting },
 } = useForm<PublicAdoptionFormValues>({
 resolver: zodResolver(publicAdoptionSchema) as any,
 defaultValues: {
 mascotaId: 0,
 titulo: "",
 historia: "",
 requisitos: "",
 ubicacionCiudad: ""
 }
 });

 useEffect(() => {
 if (isOpen) {
 fetchMyPets();
 } else {
 reset();
 }
 }, [isOpen, reset]);

 const fetchMyPets = async () => {
 try {
 setIsLoadingPets(true);
 const myPets = await petService.getMyPets();
 setPets(myPets);
 if (myPets.length === 0) {
 Swal.fire(
 "Sin Mascotas",
 "Necesitas registrar al menos una mascota en tu cuenta antes de poder publicarla en adopción.",
 "warning"
 );
 onClose();
 }
 } catch (error) {
 console.error("Error al cargar mascotas:", error);
 Swal.fire("Error", "No se pudieron cargar tus mascotas.", "error");
 } finally {
 setIsLoadingPets(false);
 }
 };

 const onSubmit: SubmitHandler<PublicAdoptionFormValues> = async (data) => {
 try {
 await adoptionService.publishAdoption(data);

 Swal.fire({
 icon: "success",
 title: "¡Publicada!",
 text: "La mascota ha sido publicada en adopción exitosamente",
 timer: 2000,
 showConfirmButton: false,
 });

 onSuccess();
 onClose();
 reset();
 } catch (error: any) {
 const errorMessage = error.response?.data?.message || "Ocurrió un error al publicar la mascota";
 Swal.fire("Error", errorMessage, "error");
 }
 };

 if (!isOpen) return null;

 return createPortal(
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm sm:p-6">
 <div
 className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col"
 role="dialog"
 aria-modal="true"
 >
 <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
 <div className="flex items-center gap-3">
 <div className="p-2 bg-primary/10 rounded-lg text-primary">
 <Heart size={20} />
 </div>
 <h2 className="text-xl font-bold tracking-tight text-slate-900">
 Dar en Adopción
 </h2>
 </div>
 <button
 onClick={onClose}
 className="p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-slate-100"
 disabled={isSubmitting}
 >
 <X size={20} />
 </button>
 </div>

 <div className="p-6 overflow-y-auto custom-scrollbar max-h-[80vh]">
 {isLoadingPets ? (
 <div className="flex flex-col items-center justify-center py-12 text-slate-500">
 <Loader2 className="animate-spin mb-4 text-primary" size={32} />
 <p>Cargando tus mascotas...</p>
 </div>
 ) : (
 <form id="publicar-adopcion-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">

 <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm border border-blue-100 flex items-start gap-3">
 <Dog className="shrink-0 mt-0.5" size={18} />
 <p>
 Solo puedes dar en adopción a mascotas que ya estén registradas en tu perfil.
 Una vez aprobada una solicitud, la mascota será transferida a su nuevo dueño.
 </p>
 </div>

 <div className="space-y-2">
 <label className="text-sm font-semibold text-slate-700">
 Selecciona tu mascota <span className="text-red-500">*</span>
 </label>
 <select
 {...register("mascotaId")}
 className={`w-full px-4 py-2.5 rounded-xl border bg-white text-slate-900 transition-shadow focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none ${errors.mascotaId
 ? "border-red-500 focus:ring-red-500/20"
 : "border-slate-200"
 }`}
 >
 <option value="">-- Selecciona una mascota --</option>
 {pets.map((pet) => (
 <option key={pet.id} value={pet.id}>
 {pet.nombre} ({pet.especie} - {pet.raza})
 </option>
 ))}
 </select>
 {errors.mascotaId && (
 <p className="text-sm text-red-500">{errors.mascotaId.message}</p>
 )}
 </div>

 <div className="space-y-4">
 <Input
 label="Título de la publicación"
 placeholder="Ej. Cachorro juguetón busca hogar"
 error={errors.titulo?.message}
 {...register("titulo")}
 required
 />

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <Input
 label="Ubicación (Ciudad)"
 placeholder="Ej. Lima, Perú"
 error={errors.ubicacionCiudad?.message}
 {...register("ubicacionCiudad")}
 required
 />
 </div>

 <div className="space-y-1">
 <label className="text-sm font-medium text-slate-700">
 Historia de la Mascota <span className="text-red-500">*</span>
 </label>
 <textarea
 {...register("historia")}
 placeholder="Cuéntanos un poco sobre su historia, personalidad, y por qué está en adopción..."
 className={`w-full px-3 py-2 border rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:outline-none transition-shadow resize-y min-h-[100px] ${errors.historia ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-primary"
 }`}
 />
 {errors.historia && (
 <p className="text-sm text-red-500">{errors.historia.message}</p>
 )}
 </div>

 <div className="space-y-1">
 <label className="text-sm font-medium text-slate-700">
 Requisitos para Adopción <span className="text-red-500">*</span>
 </label>
 <textarea
 {...register("requisitos")}
 placeholder="Ej. Casa con patio cerrado, disponibilidad para visitas de seguimiento..."
 className={`w-full px-3 py-2 border rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:outline-none transition-shadow resize-y min-h-[80px] ${errors.requisitos ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-primary"
 }`}
 />
 {errors.requisitos && (
 <p className="text-sm text-red-500">{errors.requisitos.message}</p>
 )}
 </div>
 </div>
 </form>
 )}
 </div>

 <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100 shrink-0">
 <Button
 type="button"
 variant="outline"
 onClick={onClose}
 disabled={isSubmitting}
 className="px-4 py-2"
 >
 Cancelar
 </Button>
 <Button
 type="submit"
 form="publicar-adopcion-form"
 disabled={isSubmitting || isLoadingPets}
 className="gap-2 px-4 py-2"
 >
 {isSubmitting ? (
 <Loader2 className="animate-spin" size={18} />
 ) : (
 <Heart size={18} />
 )}
 Publicar Mascota
 </Button>
 </div>
 </div>
 </div>,
 document.body
 );
};
