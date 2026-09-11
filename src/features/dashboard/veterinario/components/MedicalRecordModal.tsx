import { useState, useEffect } from "react";
import { X, Plus, Calendar, User, FileText, Activity, Save } from "lucide-react";
import { z } from "zod";
import { Button } from "../../../../components/ui/Button";
import { vetService } from "../services/vetService";
import Swal from "sweetalert2";

const medicalRecordSchema = z.object({
 diagnostico: z.string().min(2, "El diagnóstico es requerido"),
 tratamiento: z.string().min(2, "El tratamiento es requerido"),
 notas: z.string().optional().or(z.literal("")),
 pesoKg: z.string().optional().or(z.literal("")).refine(
 (val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) > 0),
 "El peso debe ser un número positivo"
 ),
});

interface MedicalRecordModalProps {
 isOpen: boolean;
 onClose: () => void;
 patientId: number;
 patientName: string;
}

interface MedicalRecord {
 id: number;
 nombreVeterinario: string;
 diagnostico: string;
 tratamiento: string;
 notas?: string;
 pesoKg?: number;
 fechaRegistro: string;
}

export const MedicalRecordModal = ({ isOpen, onClose, patientId, patientName }: MedicalRecordModalProps) => {
 const [history, setHistory] = useState<MedicalRecord[]>([]);
 const [isLoading, setIsLoading] = useState(true);
 const [showForm, setShowForm] = useState(false);
 const [isSaving, setIsSaving] = useState(false);

 const [formData, setFormData] = useState({
 diagnostico: "",
 tratamiento: "",
 notas: "",
 pesoKg: ""
 });

 const fetchHistory = async () => {
 setIsLoading(true);
 try {
 const data = await vetService.getMedicalHistory(patientId);
 setHistory(data);
 } catch (error) {
 console.error("Error fetching history:", error);
 } finally {
 setIsLoading(false);
 }
 };

 useEffect(() => {
 if (isOpen && patientId) {
 fetchHistory();
 }
 }, [isOpen, patientId]);

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();

 const schemaResult = medicalRecordSchema.safeParse(formData);
 if (!schemaResult.success) {
 const firstError = Object.values(schemaResult.error.flatten().fieldErrors)[0]?.[0];
 Swal.fire("Error de validación", firstError || "Corrige los errores del formulario", "error");
 return;
 }

 setIsSaving(true);
 try {
 await vetService.addMedicalRecord({
 ...formData,
 mascotaId: patientId,
 pesoKg: formData.pesoKg ? parseFloat(formData.pesoKg) : null
 });
 Swal.fire({
 title: "¡Éxito!",
 text: "Historia clínica actualizada.",
 icon: "success",
 timer: 2000,
 showConfirmButton: false
 });
 setFormData({ diagnostico: "", tratamiento: "", notas: "", pesoKg: "" });
 setShowForm(false);
 fetchHistory();
 } catch (error) {
 console.error("Error saving record:", error);
 Swal.fire("Error", "No se pudo guardar el registro médico.", "error");
 } finally {
 setIsSaving(false);
 }
 };

 if (!isOpen) return null;

 return (
 <div className="fixed inset-0 z-[100] flex items-center justify-end">
 <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

 <div className="relative w-full max-w-2xl h-full bg-white shadow-2xl flex flex-col transform transition-transform duration-300">
 {/* Header */}
 <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
 <div>
 <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
 <FileText className="text-teal-500" /> Historia Clínica
 </h2>
 <p className="text-sm text-slate-500 font-medium">Paciente: {patientName}</p>
 </div>
 <button onClick={onClose} className="p-2 hover:bg-slate-50 :bg-slate-800 rounded-xl transition-colors">
 <X size={20} className="text-slate-400" />
 </button>
 </div>

 {/* Content */}
 <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar space-y-6">
 {!showForm ? (
 <div className="flex justify-between items-center bg-teal-50 p-4 rounded-2xl border border-teal-100 ">
 <div className="text-sm text-teal-700 font-medium">
 ¿Deseas agregar un nuevo registro médico?
 </div>
 <Button onClick={() => setShowForm(true)} className="h-9 px-4 bg-teal-500 hover:bg-teal-600 text-white">
 <Plus size={16} className="mr-1.5" /> Nuevo Registro
 </Button>
 </div>
 ) : (
 <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
 <h3 className="font-bold flex items-center gap-2 text-slate-800 ">
 <Plus size={18} className="text-teal-500" /> Nueva Entrada
 </h3>
 <form onSubmit={handleSubmit} className="space-y-4">
 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-1.5 col-span-2">
 <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Diagnóstico</label>
 <textarea
 required
 value={formData.diagnostico}
 onChange={e => setFormData({ ...formData, diagnostico: e.target.value })}
 className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 text-sm"
 rows={2}
 placeholder="Describa el diagnóstico..."
 />
 </div>
 <div className="space-y-1.5 col-span-2">
 <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Tratamiento</label>
 <textarea
 required
 value={formData.tratamiento}
 onChange={e => setFormData({ ...formData, tratamiento: e.target.value })}
 className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 text-sm"
 rows={2}
 placeholder="Detalle el tratamiento a seguir..."
 />
 </div>
 <div className="space-y-1.5 col-span-2 sm:col-span-1">
 <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Peso (Kg)</label>
 <input
 type="number"
 step="0.01"
 value={formData.pesoKg}
 onChange={e => setFormData({ ...formData, pesoKg: e.target.value })}
 className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 text-sm"
 placeholder="Ej: 15.5"
 />
 </div>
 <div className="space-y-1.5 col-span-2 sm:col-span-1">
 <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Notas Adicionales</label>
 <input
 type="text"
 value={formData.notas}
 onChange={e => setFormData({ ...formData, notas: e.target.value })}
 className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 text-sm"
 placeholder="..."
 />
 </div>
 </div>
 <div className="flex justify-end gap-3 pt-2">
 <Button variant="ghost" type="button" onClick={() => setShowForm(false)} className="h-9 px-4">Cancelar</Button>
 <Button className="h-9 px-4 bg-teal-500 hover:bg-teal-600 text-white" disabled={isSaving}>
 {isSaving ? "Guardando..." : <><Save size={16} className="mr-2" /> Guardar Entrada</>}
 </Button>
 </div>
 </form>
 </div>
 )
 }

 <div className="space-y-4">
 <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Historial de Consultas</h3>
 {isLoading ? (
 <div className="space-y-3">
 {[1, 2].map(i => <div key={i} className="h-32 bg-slate-50 rounded-2xl animate-pulse" />)}
 </div>
 ) : history.length === 0 ? (
 <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-3xl">
 <p className="text-slate-400 text-sm">No hay registros médicos previos.</p>
 </div>
 ) : (
 <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-teal-500/20 before:via-slate-200 :via-slate-800 before:to-transparent">
 {history.map((record) => (
 <div key={record.id} className="relative pl-12 group">
 <div className="absolute left-0 top-1 w-10 h-10 rounded-full bg-white border-4 border-teal-500/10 flex items-center justify-center group-hover:border-teal-500/40 transition-all">
 <div className="w-2.5 h-2.5 rounded-full bg-teal-500" />
 </div>
 <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
 <div className="flex justify-between items-start mb-3">
 <div className="flex items-center gap-2 text-xs font-bold text-teal-600 ">
 <Calendar size={14} /> {new Date(record.fechaRegistro).toLocaleDateString()}
 </div>
 <div className="flex items-center gap-1.5 text-xs text-slate-400">
 <User size={12} /> {record.nombreVeterinario}
 </div>
 </div>

 <div className="space-y-3">
 <div>
 <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Diagnóstico</span>
 <p className="text-sm text-slate-700 leading-relaxed font-medium">{record.diagnostico}</p>
 </div>
 <div>
 <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Tratamiento</span>
 <p className="text-sm text-slate-600 leading-relaxed">{record.tratamiento}</p>
 </div>
 {record.pesoKg && (
 <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-600 ">
 <Activity size={12} /> {record.pesoKg} Kg
 </div>
 )}
 {record.notas && (
 <div className="mt-2 text-[11px] text-slate-400 italic">
 * {record.notas}
 </div>
 )}
 </div>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 );
};
