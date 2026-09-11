import { useState, useEffect } from "react";
import { X, Save, Upload, Image as ImageIcon } from "lucide-react";
import { z } from "zod";
import { Button } from "../../../../components/ui/Button";
import type { Service, ModalidadServicio } from "../../../catalog/types/service.types";
import { vetService } from "../services/vetService";
import Swal from "sweetalert2";

const MODALIDADES = ["PRESENCIAL", "VIRTUAL", "DOMICILIO", "HIBRIDO"] as const;

const vetServiceSchema = z.object({
 nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
 descripcion: z.string().optional().or(z.literal("")),
 precio: z.string().refine((val) => {
 const num = parseFloat(val);
 return !isNaN(num) && num > 0;
 }, "El precio debe ser mayor a 0"),
 duracionMinutos: z.string().refine((val) => {
 const num = parseInt(val);
 return !isNaN(num) && num >= 1;
 }, "La duración debe ser al menos 1 minuto"),
 modalidad: z.enum(MODALIDADES, { error: "Selecciona una modalidad" }),
 visible: z.boolean(),
 activo: z.boolean(),
});

interface VetServiceModalProps {
 isOpen: boolean;
 onClose: () => void;
 onSuccess: () => void;
 serviceToEdit?: Service | null;
}

export const VetServiceModal = ({ isOpen, onClose, onSuccess, serviceToEdit }: VetServiceModalProps) => {
 const [isLoading, setIsLoading] = useState(false);

 // Estados para la imagen
 const [imagenFile, setImagenFile] = useState<File | null>(null);
 const [imagenPreview, setImagenPreview] = useState<string | null>(null);

 const [formData, setFormData] = useState({
 nombre: "",
 descripcion: "",
 precio: "",
 duracionMinutos: "30",
 modalidad: "PRESENCIAL" as ModalidadServicio,
 visible: true,
 activo: true
 });

 useEffect(() => {
 if (serviceToEdit) {
 setFormData({
 nombre: serviceToEdit.nombre,
 descripcion: serviceToEdit.descripcion || "",
 precio: serviceToEdit.precio.toString(),
 duracionMinutos: serviceToEdit.duracionMinutos ? serviceToEdit.duracionMinutos.toString() : "30",
 modalidad: serviceToEdit.modalidad,
 visible: serviceToEdit.visible,
 activo: serviceToEdit.activo
 });
 setImagenPreview(serviceToEdit.imagenUrl || null);
 setImagenFile(null); // Reseteamos el archivo
 } else {
 setFormData({
 nombre: "",
 descripcion: "",
 precio: "",
 duracionMinutos: "30",
 modalidad: "PRESENCIAL",
 visible: true,
 activo: true
 });
 setImagenPreview(null);
 setImagenFile(null);
 }
 }, [serviceToEdit, isOpen]);

 if (!isOpen) return null;

 // Manejador para el input de tipo file
 const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0];
 if (file) {
 setImagenFile(file);
 // Crear una URL temporal para la previsualización
 const previewUrl = URL.createObjectURL(file);
 setImagenPreview(previewUrl);
 }
 };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();

 if (!serviceToEdit && !imagenFile) {
 Swal.fire({
 icon: 'warning',
 title: 'Imagen requerida',
 text: 'Debes subir una imagen para crear el servicio.',
 confirmButtonColor: '#14b8a6'
 });
 return;
 }

 const schemaResult = vetServiceSchema.safeParse(formData);
 if (!schemaResult.success) {
 const firstError = Object.values(schemaResult.error.flatten().fieldErrors)[0]?.[0];
 Swal.fire("Error de validación", firstError || "Corrige los errores del formulario", "error");
 return;
 }

 setIsLoading(true);

 try {
 const payload = {
 ...formData,
 precio: parseFloat(formData.precio),
 duracionMinutos: parseInt(formData.duracionMinutos) || 30,
 };

 if (serviceToEdit) {
 // Pasamos imagenFile (puede ser null si no la cambió)
 await vetService.updateService(serviceToEdit.id, payload, imagenFile || undefined);
 Swal.fire({ title: "Actualizado", text: "Servicio actualizado correctamente", icon: "success", timer: 2000, showConfirmButton: false });
 } else {
 // Ya sabemos que imagenFile existe por la validación de arriba
 // Al crear, eliminamos 'activo' para que coincida con lo que el backend espera
 const { activo, ...creationPayload } = payload;
 await vetService.createService(creationPayload, imagenFile!);
 Swal.fire({ title: "Creado", text: "Servicio creado correctamente", icon: "success", timer: 2000, showConfirmButton: false });
 }
 onSuccess();
 onClose();
 } catch (error) {
 console.error("Error saving service:", error);
 Swal.fire("Error", "Ocurrió un error al guardar el servicio", "error");
 } finally {
 setIsLoading(false);
 }
 };

 return (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
 <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

 <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all flex flex-col max-h-[90vh]">

 <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
 <h2 className="text-xl font-bold text-slate-900 ">
 {serviceToEdit ? "Editar Servicio" : "Nuevo Servicio"}
 </h2>
 <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 :text-slate-200 rounded-xl hover:bg-slate-50 :bg-slate-800 transition-colors">
 <X size={20} />
 </button>
 </div>

 <div className="flex-1 overflow-y-auto px-6 py-5 custom-scrollbar">
 <form id="serviceForm" onSubmit={handleSubmit} className="space-y-5">

 {/* INPUT DE IMAGEN */}
 <div className="space-y-1.5">
 <label className="text-sm font-semibold text-slate-700 ">
 Imagen del Servicio {!serviceToEdit && <span className="text-red-500">*</span>}
 </label>

 <div className="relative group flex items-center justify-center w-full h-40 border-2 border-dashed rounded-xl transition-all overflow-hidden bg-slate-50 border-slate-300 hover:border-teal-500 :border-teal-400">
 <input
 type="file"
 accept="image/*"
 onChange={handleImageChange}
 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
 />

 {imagenPreview ? (
 <>
 <img src={imagenPreview} alt="Preview" className="w-full h-full object-cover" />
 <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
 <span className="text-white font-medium flex items-center gap-2">
 <Upload size={18} /> Cambiar imagen
 </span>
 </div>
 </>
 ) : (
 <div className="flex flex-col items-center justify-center text-slate-500 group-hover:text-teal-500 transition-colors">
 <div className="p-3 bg-slate-100 rounded-full mb-2 group-hover:bg-teal-50 :bg-teal-900/30">
 <ImageIcon size={24} />
 </div>
 <p className="text-sm font-medium">Haz clic o arrastra una imagen</p>
 <p className="text-xs mt-1 opacity-75">PNG, JPG, WEBP (Max. 5MB)</p>
 </div>
 )}
 </div>
 </div>

 {/* EL RESTO DEL FORMULARIO SE MANTIENE EXACTAMENTE IGUAL */}
 <div className="space-y-1.5">
 <label className="text-sm font-semibold text-slate-700 ">Nombre del Servicio <span className="text-red-500">*</span></label>
 <input
 type="text"
 required
 value={formData.nombre}
 onChange={e => setFormData({ ...formData, nombre: e.target.value })}
 placeholder="Ej: Consulta General"
 className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-900 placeholder:text-slate-400 transition-all text-sm"
 />
 </div>

 <div className="space-y-1.5">
 <label className="text-sm font-semibold text-slate-700 ">Descripción</label>
 <textarea
 value={formData.descripcion}
 onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
 placeholder="Detalles sobre lo que incluye el servicio..."
 rows={3}
 className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-900 placeholder:text-slate-400 transition-all text-sm resize-none"
 />
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-1.5">
 <label className="text-sm font-semibold text-slate-700 ">Precio (S/) <span className="text-red-500">*</span></label>
 <input
 type="number"
 required
 min="0.01"
 step="0.01"
 value={formData.precio}
 onChange={e => setFormData({ ...formData, precio: e.target.value })}
 placeholder="0.00"
 className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-900 placeholder:text-slate-400 transition-all text-sm"
 />
 </div>
 <div className="space-y-1.5">
 <label className="text-sm font-semibold text-slate-700 ">Duración (minutos) <span className="text-red-500">*</span></label>
 <input
 type="number"
 required
 min="1"
 step="1"
 value={formData.duracionMinutos}
 onChange={e => setFormData({ ...formData, duracionMinutos: e.target.value })}
 placeholder="30"
 className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-900 placeholder:text-slate-400 transition-all text-sm"
 />
 </div>
 </div>

 <div className="space-y-1.5">
 <label className="text-sm font-semibold text-slate-700 ">Modalidad <span className="text-red-500">*</span></label>
 <select
 required
 value={formData.modalidad}
 onChange={e => setFormData({ ...formData, modalidad: e.target.value as ModalidadServicio })}
 className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-900 appearance-none transition-all text-sm"
 >
 {MODALIDADES.map(m => (
 <option key={m} value={m}>{m}</option>
 ))}
 </select>
 </div>

 <div className="flex gap-4">
 <label className="flex items-center gap-2 cursor-pointer">
 <input
 type="checkbox"
 checked={formData.visible}
 onChange={e => setFormData({ ...formData, visible: e.target.checked })}
 className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
 />
 <span className="text-sm text-slate-700 font-medium">Visible en catálogo</span>
 </label>

 {serviceToEdit && (
 <label className="flex items-center gap-2 cursor-pointer">
 <input
 type="checkbox"
 checked={formData.activo}
 onChange={e => setFormData({ ...formData, activo: e.target.checked })}
 className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
 />
 <span className="text-sm text-slate-700 font-medium">Servicio activo</span>
 </label>
 )}
 </div>
 </form>
 </div>

 <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 shrink-0 bg-slate-50 ">
 <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
 Cancelar
 </Button>
 <Button type="submit" form="serviceForm" className="bg-teal-500 hover:bg-teal-600 text-white min-w-[120px]" disabled={isLoading}>
 {isLoading ? (
 <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
 ) : (
 <><Save size={18} className="mr-2" /> Guardar</>
 )}
 </Button>
 </div>
 </div>
 </div>
 );
};