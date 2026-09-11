import { useState, useEffect } from "react";
import { X, Calendar, Clock, PawPrint, Loader2, CheckCircle } from "lucide-react";
import { z } from "zod";
import { petService } from "../../cliente/services/petService";
import { appointmentService } from "./appointmentService";
import type { Pet } from "../../cliente/types/pet.types";
import type { CitaRequest } from "./appointmentService";

const formatSlot = (slot: string) => slot.slice(0, 5);

const agendarCitaSchema = z.object({
 mascotaId: z.string().optional().or(z.literal("")),
 fechaProgramada: z.string().min(1, "La fecha es requerida"),
 horaInicio: z.string().min(1, "La hora es requerida"),
 notasCliente: z.string().optional().or(z.literal("")),
});

interface AgendarCitaModalProps {
 isOpen: boolean;
 onClose: () => void;
 servicioId: number;
 empresaId: number;
 servicioNombre: string;
}

export const AgendarCitaModal = ({ isOpen, onClose, servicioId, empresaId, servicioNombre }: AgendarCitaModalProps) => {
 const [pets, setPets] = useState<Pet[]>([]);
 const [isLoadingPets, setIsLoadingPets] = useState(true);
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [success, setSuccess] = useState(false);
 const [availableSlots, setAvailableSlots] = useState<string[]>([]);
 const [isLoadingSlots, setIsLoadingSlots] = useState(false);
 const [slotsError, setSlotsError] = useState<string | null>(null);

 const today = new Date().toISOString().split("T")[0];

 const [form, setForm] = useState<{
 mascotaId: string;
 fechaProgramada: string;
 horaInicio: string;
 notasCliente: string;
 }>({
 mascotaId: "",
 fechaProgramada: today,
 horaInicio: "",
 notasCliente: "",
 });

 useEffect(() => {
 if (!isOpen) return;
 setSuccess(false);
 setForm({ mascotaId: "", fechaProgramada: today, horaInicio: "", notasCliente: "" });
 const load = async () => {
 setIsLoadingPets(true);
 try {
 const data = await petService.getMyPets();
 setPets(data);
 if (data.length > 0) setForm(f => ({ ...f, mascotaId: String(data[0].id) }));
 } catch {
 // No pets is fine
 } finally {
 setIsLoadingPets(false);
 }
 };
 load();
 }, [isOpen]);

 useEffect(() => {
 if (!isOpen || !form.fechaProgramada) return;
 setIsLoadingSlots(true);
 setSlotsError(null);
 appointmentService
 .getAvailableSlots(empresaId, servicioId, form.fechaProgramada)
 .then(slots => setAvailableSlots(slots))
 .catch(() => setSlotsError("No se pudieron cargar los horarios disponibles."))
 .finally(() => setIsLoadingSlots(false));
 }, [isOpen, form.fechaProgramada, empresaId, servicioId]);

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();

 const schemaResult = agendarCitaSchema.safeParse(form);
 if (!schemaResult.success) {
 const firstError = Object.values(schemaResult.error.flatten().fieldErrors)[0]?.[0];
 alert(firstError || "Corrige los errores del formulario");
 return;
 }

 setIsSubmitting(true);
 try {
 const request: CitaRequest = {
 servicioId,
 empresaId,
 fechaProgramada: form.fechaProgramada,
 horaInicio: form.horaInicio,
 notasCliente: form.notasCliente || undefined,
 };
 if (form.mascotaId) request.mascotaId = Number(form.mascotaId);
 await appointmentService.create(request);
 setSuccess(true);
 } catch (err: any) {
 console.error("Error creating appointment:", err);
 alert(err?.response?.data?.message || "No se pudo agendar la cita. Intenta con otro horario.");
 } finally {
 setIsSubmitting(false);
 }
 };

 const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
 setForm(f => ({ ...f, [e.target.name]: e.target.value }));
 };

 if (!isOpen) return null;

 return (
 <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
 <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] border border-slate-100 overflow-y-auto">
 <div className="flex items-center justify-between p-6 border-b border-slate-100">
 <div>
 <h2 className="text-xl font-black text-slate-900">Agendar Cita</h2>
 <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">{servicioNombre}</p>
 </div>
 <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
 <X size={20} />
 </button>
 </div>

 {success ? (
 <div className="p-10 flex flex-col items-center text-center gap-4">
 <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
 <CheckCircle className="text-emerald-500" size={40} />
 </div>
 <h3 className="text-xl font-black text-slate-900">¡Cita Solicitada!</h3>
 <p className="text-slate-500 text-sm max-w-[260px]">
 Tu solicitud fue enviada. La empresa o veterinario confirmará tu cita pronto.
 </p>
 <button
 onClick={onClose}
 className="mt-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all"
 >
 Entendido
 </button>
 </div>
 ) : (
 <form onSubmit={handleSubmit} className="p-6 space-y-5">
 <div>
 <label className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-2">
 <PawPrint size={16} className="text-blue-500" /> Mascota
 </label>
 {isLoadingPets ? (
 <div className="h-11 bg-slate-100 rounded-xl animate-pulse" />
 ) : pets.length > 0 ? (
 <select
 name="mascotaId"
 value={form.mascotaId}
 onChange={handleChange}
 className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
 >
 <option value="">Sin mascota específica</option>
 {pets.map(p => (
 <option key={p.id} value={p.id}>{p.nombre} ({p.especie})</option>
 ))}
 </select>
 ) : (
 <p className="text-sm text-slate-400 italic p-3 bg-slate-50 rounded-xl">
 No tienes mascotas registradas. La cita se agendará sin mascota específica.
 </p>
 )}
 </div>

 <div>
 <label className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-2">
 <Calendar size={16} className="text-blue-500" /> Fecha preferida
 </label>
 <input
 type="date"
 name="fechaProgramada"
 value={form.fechaProgramada}
 min={today}
 onChange={(e) => setForm(f => ({ ...f, fechaProgramada: e.target.value, horaInicio: "" }))}
 required
 className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
 />
 </div>

 <div>
 <label className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-2">
 <Clock size={16} className="text-blue-500" /> Hora disponible
 </label>
 {isLoadingSlots ? (
 <div className="flex items-center justify-center py-4">
 <Loader2 size={18} className="animate-spin text-blue-500" />
 </div>
 ) : slotsError ? (
 <p className="text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2">{slotsError}</p>
 ) : availableSlots.length === 0 ? (
 <p className="text-xs text-slate-500 bg-slate-50 rounded-xl px-3 py-2">
 No hay horarios disponibles para esta fecha, prueba con otro día.
 </p>
 ) : (
 <div className="grid grid-cols-3 gap-2">
 {availableSlots.map((slot) => {
 const value = formatSlot(slot);
 const selected = form.horaInicio === value;
 return (
 <button
 key={slot}
 type="button"
 onClick={() => setForm(f => ({ ...f, horaInicio: value }))}
 className={`py-2 rounded-xl text-sm font-semibold border transition-all ${selected
 ? "bg-blue-600 border-blue-600 text-white"
 : "bg-slate-50 border-slate-200 text-slate-700 hover:border-blue-300"
 }`}
 >
 {value}
 </button>
 );
 })}
 </div>
 )}
 </div>

 <div>
 <label className="text-sm font-semibold text-slate-700 mb-2 block">
 Notas adicionales <span className="text-slate-400 font-normal">(opcional)</span>
 </label>
 <textarea
 name="notasCliente"
 value={form.notasCliente}
 onChange={handleChange}
 rows={3}
 placeholder="Síntomas, motivo de la consulta, preferencias..."
 className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
 />
 </div>

 <div className="flex gap-3 pt-2">
 <button
 type="button"
 onClick={onClose}
 className="flex-1 py-3 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-all"
 >
 Cancelar
 </button>
 <button
 type="submit"
 disabled={isSubmitting || !form.horaInicio}
 className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
 >
 {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Calendar size={18} />}
 {isSubmitting ? "Enviando..." : "Solicitar Cita"}
 </button>
 </div>
 </form>
 )}
 </div>
 </div>
 );
};
