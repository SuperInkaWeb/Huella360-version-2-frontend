import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Loader2, Send, Mail, User } from "lucide-react";
import Swal from "sweetalert2";
import { createPortal } from "react-dom";
import { Button } from "../../../../../components/ui/Button";
import { adoptionService } from "../services/adoptionService";
import type { AdoptionResponse } from "../types/adoption.types";

const applyAdoptionSchema = z.object({
 mensajePresentacion: z.string().min(20, "El mensaje debe tener al menos 20 caracteres para presentarte y explicar por qué quieres adoptar.").max(1000, "Máximo 1000 caracteres"),
});

type ApplyAdoptionFormValues = z.infer<typeof applyAdoptionSchema>;

interface PostularAdopcionModalProps {
 isOpen: boolean;
 onClose: () => void;
 adopcion: AdoptionResponse | null;
}

export const PostularAdopcionModal = ({ isOpen, onClose, adopcion }: PostularAdopcionModalProps) => {

 const {
 register,
 handleSubmit,
 reset,
 formState: { errors, isSubmitting },
 } = useForm<ApplyAdoptionFormValues>({
 resolver: zodResolver(applyAdoptionSchema),
 defaultValues: {
 mensajePresentacion: ""
 }
 });

 useEffect(() => {
 if (!isOpen) {
 reset();
 }
 }, [isOpen, reset]);

 const onSubmit: SubmitHandler<ApplyAdoptionFormValues> = async (data) => {
 if (!adopcion) return;

 try {
 await adoptionService.applyForAdoption(adopcion.id, data);

 Swal.fire({
 icon: "success",
 title: "¡Postulación Enviada!",
 text: "El dueño de la mascota revisará tu solicitud pronto.",
 timer: 2500,
 showConfirmButton: false,
 });

 onClose();
 } catch (error: any) {
 const errorMessage = error.response?.data?.message || "Ocurrió un error al enviar tu postulación.";
 Swal.fire("Error", errorMessage, "error");
 }
 };

 if (!isOpen || !adopcion) return null;

 return createPortal(
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm sm:p-6">
 <div
 className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col"
 role="dialog"
 aria-modal="true"
 >
 <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
 <div className="flex items-center gap-3">
 <div className="p-2 bg-primary/10 rounded-lg text-primary">
 <Send size={20} />
 </div>
 <h2 className="text-xl font-bold tracking-tight text-slate-900">
 Postular a Adopción
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

 <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100 flex items-center gap-4">
 {adopcion.mascotaFotoUrl ? (
 <img
 src={adopcion.mascotaFotoUrl}
 alt={adopcion.mascotaNombre}
 className="w-16 h-16 rounded-lg object-cover bg-slate-200"
 />
 ) : (
 <div className="w-16 h-16 rounded-lg bg-slate-200 flex items-center justify-center shrink-0">
 <span className="text-slate-400 text-sm font-medium">Sin foto</span>
 </div>
 )}
 <div>
 <h3 className="text-base font-bold text-slate-900 leading-tight">
 {adopcion.mascotaNombre}
 </h3>
 <p className="text-sm text-slate-500 line-clamp-1">{adopcion.titulo}</p>
 <div className="flex items-center gap-1 text-xs font-medium text-slate-400 mt-1">
 <User size={12} />
 Publicado por: {adopcion.publicadoPorNombre}
 </div>
 </div>
 </div>

 <form id="postular-adopcion-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
 <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm border border-blue-100 flex items-start gap-3">
 <Mail className="shrink-0 mt-0.5" size={18} />
 <p>
 Redacta un mensaje presentándote. Habla sobre tu experiencia cuidando mascotas, el espacio que tienes en casa, y por qué quieres adoptar a <strong>{adopcion.mascotaNombre}</strong>.
 </p>
 </div>

 <div className="space-y-1">
 <label className="text-sm font-semibold text-slate-700">
 Mensaje de Presentación <span className="text-red-500">*</span>
 </label>
 <textarea
 {...register("mensajePresentacion")}
 placeholder="Hola, me encantaría darle un hogar a... Tengo mucha experiencia con animales..."
 className={`w-full px-3 py-3 border rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:outline-none transition-shadow resize-y min-h-[150px] ${errors.mensajePresentacion ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-primary"
 }`}
 />
 {errors.mensajePresentacion && (
 <p className="text-sm text-red-500">{errors.mensajePresentacion.message}</p>
 )}
 </div>
 </form>
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
 form="postular-adopcion-form"
 disabled={isSubmitting}
 className="gap-2 px-4 py-2"
 >
 {isSubmitting ? (
 <Loader2 className="animate-spin" size={18} />
 ) : (
 <Send size={18} />
 )}
 Enviar Solicitud
 </Button>
 </div>
 </div>
 </div>,
 document.body
 );
};
