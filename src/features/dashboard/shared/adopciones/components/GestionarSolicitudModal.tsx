import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Loader2, CheckCircle, XCircle, FileText } from "lucide-react";
import Swal from "sweetalert2";
import { createPortal } from "react-dom";
import { Button } from "../../../../../components/ui/Button";
import { adoptionService } from "../services/adoptionService";
import type { ApplicationResponse } from "../types/adoption.types";

const respondApplicationSchema = z.object({
 aprobar: z.boolean(),
 motivoRechazo: z.string().optional(),
}).refine(data => {
 if (!data.aprobar && (!data.motivoRechazo || data.motivoRechazo.trim().length < 5)) {
 return false;
 }
 return true;
}, {
 message: "Debe indicar un motivo de rechazo (mínimo 5 caracteres)",
 path: ["motivoRechazo"]
});

type RespondApplicationFormValues = z.infer<typeof respondApplicationSchema>;

interface GestionarSolicitudModalProps {
 isOpen: boolean;
 onClose: () => void;
 application: ApplicationResponse | null;
 onSuccess: () => void;
}

export const GestionarSolicitudModal = ({ isOpen, onClose, application, onSuccess }: GestionarSolicitudModalProps) => {
 const [action, setAction] = useState<"APROBAR" | "RECHAZAR" | null>(null);

 const {
 register,
 handleSubmit,
 reset,
 setValue,
 formState: { errors, isSubmitting },
 } = useForm<RespondApplicationFormValues>({
 resolver: zodResolver(respondApplicationSchema),
 defaultValues: {
 aprobar: false,
 motivoRechazo: ""
 }
 });

 useEffect(() => {
 if (!isOpen) {
 reset();
 setAction(null);
 }
 }, [isOpen, reset]);

 const onSubmit: SubmitHandler<RespondApplicationFormValues> = async (data) => {
 if (!application) return;

 try {
 await adoptionService.respondToApplication(application.id, data);

 Swal.fire({
 icon: "success",
 title: data.aprobar ? "¡Solicitud Aprobada!" : "Solicitud Rechazada",
 text: data.aprobar
 ? "La mascota ha sido transferida exitosamente al nuevo dueño."
 : "Se ha notificado al interesado sobre el rechazo.",
 timer: 3000,
 showConfirmButton: false,
 });

 onSuccess();
 onClose();
 } catch (error: any) {
 const errorMessage = error.response?.data?.message || "Ocurrió un error al procesar la solicitud.";
 Swal.fire("Error", errorMessage, "error");
 }
 };

 if (!isOpen || !application) return null;

 const isPending = application.estado === "PENDIENTE";

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
 <FileText size={20} />
 </div>
 <h2 className="text-xl font-bold tracking-tight text-slate-900">
 Gestionar Solicitud
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

 <div className="mb-6">
 <div className="flex items-end justify-between mb-2">
 <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
 Mensaje del Interesado
 </h3>
 <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${application.estado === 'PENDIENTE'
 ? 'bg-amber-100 text-amber-700 border-amber-200'
 : application.estado === 'APROBADA'
 ? 'bg-green-100 text-green-700 border-green-200'
 : 'bg-red-100 text-red-700 border-red-200'
 }`}>
 {application.estado}
 </span>
 </div>

 <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
 <p className="text-sm font-medium text-slate-900 mb-2">
 De: {application.interesadoEmail}
 </p>
 <p className="text-sm text-slate-600 whitespace-pre-wrap">
 "{application.mensajePresentacion}"
 </p>
 </div>
 </div>

 {!isPending && (
 <div className="space-y-4">
 <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
 <h4 className="text-sm font-semibold text-slate-700 mb-2">
 Esta solicitud ya fue procesada:
 </h4>
 {application.estado === 'APROBADA' && (
 <div className="flex items-center gap-2 text-green-600">
 <CheckCircle size={18} />
 <span>Aprobaste esta solicitud el {new Date(application.fechaRespuesta!).toLocaleDateString()}. La mascota fue transferida.</span>
 </div>
 )}
 {application.estado === 'RECHAZADA' && (
 <div className="space-y-2">
 <div className="flex items-center gap-2 text-red-600">
 <XCircle size={18} />
 <span>Rechazaste esta solicitud el {new Date(application.fechaRespuesta!).toLocaleDateString()}.</span>
 </div>
 <p className="text-sm text-slate-600 bg-slate-100 p-2 rounded-lg">
 <strong>Motivo:</strong> {application.motivoRechazo}
 </p>
 </div>
 )}
 </div>
 </div>
 )}

 {isPending && (
 <form id="gestionar-solicitud-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">

 <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-6">
 <button
 type="button"
 className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${action === "APROBAR"
 ? "border-green-500 bg-green-50 text-green-700"
 : "border-slate-200 text-slate-500 hover:border-green-200 hover:bg-green-50/50"
 }`}
 onClick={() => {
 setAction("APROBAR");
 setValue("aprobar", true);
 setValue("motivoRechazo", undefined);
 }}
 >
 <CheckCircle size={32} className="mb-2" />
 <span className="font-bold">Aprobar Solicitud</span>
 </button>

 <button
 type="button"
 className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${action === "RECHAZAR"
 ? "border-red-500 bg-red-50 text-red-700"
 : "border-slate-200 text-slate-500 hover:border-red-200 hover:bg-red-50/50"
 }`}
 onClick={() => {
 setAction("RECHAZAR");
 setValue("aprobar", false);
 }}
 >
 <XCircle size={32} className="mb-2" />
 <span className="font-bold">Rechazar Solicitud</span>
 </button>
 </div>

 {action === "APROBAR" && (
 <div className="bg-green-50 text-green-800 p-4 rounded-xl border border-green-200">
 <p className="text-sm">
 <strong>⚠️ Atención:</strong> Al aprobar esta solicitud, la propiedad de la mascota será transferida inmediatamente a <strong>{application.interesadoEmail}</strong> y no podrás deshacer esta acción. Las demás solicitudes pendientes serán rechazadas automáticamente.
 </p>
 </div>
 )}

 {action === "RECHAZAR" && (
 <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
 <label className="text-sm font-semibold text-slate-700">
 Motivo del Rechazo <span className="text-red-500">*</span>
 </label>
 <textarea
 {...register("motivoRechazo")}
 placeholder="Ej. Hemos decidido continuar con otra familia que tiene un patio más grande..."
 className={`w-full px-3 py-3 border rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:outline-none transition-shadow resize-none h-24 ${errors.motivoRechazo ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-primary"}`}
 />
 {errors.motivoRechazo && (
 <p className="text-sm text-red-500">{errors.motivoRechazo.message}</p>
 )}
 </div>
 )}

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
 Cerrar
 </Button>

 {isPending && (
 <Button
 type="submit"
 form="gestionar-solicitud-form"
 disabled={isSubmitting || !action}
 className={`gap-2 px-6 py-2 ${action === "APROBAR"
 ? "bg-green-600 hover:bg-green-700 text-white"
 : action === "RECHAZAR"
 ? "bg-red-600 hover:bg-red-700 text-white"
 : ""
 }`}
 >
 {isSubmitting ? (
 <Loader2 className="animate-spin" size={18} />
 ) : (
 "Confirmar Decisión"
 )}
 </Button>
 )}
 </div>
 </div>
 </div>,
 document.body
 );
};
