import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Save, User, UserCircle, MapPin, Phone, Loader2, Camera } from "lucide-react";
import { Button } from "../../../../components/ui/Button";
import { useAuth } from "../../../auth/context/useAuth";
import { clienteService } from "../services/clienteService";
import Swal from "sweetalert2";

/* ── Schema ─────────────────────────────────────────────────── */
const formSchema = z.object({
 nombres: z.string().min(2, "Los nombres deben tener al menos 2 caracteres"),
 apellidos: z.string().min(2, "Los apellidos deben tener al menos 2 caracteres"),
 telefono: z.string().min(6, "El teléfono debe tener un formato válido").max(15, "Teléfono demasiado largo").regex(/^\d+$/, "Solo números permitidos"),
 direccion: z.string().min(5, "La dirección debe ser más descriptiva").optional().or(z.literal("")),
 fotoPerfilUrl: z.string().optional().or(z.literal("")),
});

type FormData = z.infer<typeof formSchema>;

/* ── Component ──────────────────────────────────────────────── */
export const MiPerfilPage = () => {
 const { nombre } = useAuth();
 const [isLoading, setIsLoading] = useState(true);
 const [isSaving, setIsSaving] = useState(false);
 const [selectedFile, setSelectedFile] = useState<File | null>(null);

 const {
 register,
 handleSubmit,
 setValue,
 watch,
 formState: { errors, isDirty },
 } = useForm<FormData>({
 resolver: zodResolver(formSchema),
 defaultValues: {
 nombres: "",
 apellidos: "",
 telefono: "",
 direccion: "",
 fotoPerfilUrl: "",
 },
 });

 const photoUrl = watch("fotoPerfilUrl");

 useEffect(() => {
 const fetchProfile = async () => {
 try {
 const data = await clienteService.getMyProfile();
 setValue("nombres", data.nombres);
 setValue("apellidos", data.apellidos);
 setValue("telefono", data.telefono || "");
 setValue("direccion", data.direccion || "");
 setValue("fotoPerfilUrl", data.fotoPerfilUrl || "");
 } catch (error) {
 console.error("Error fetching client profile:", error);
 } finally {
 setIsLoading(false);
 }
 };
 fetchProfile();
 }, [setValue]);

 const onSubmit = async (data: FormData) => {
 setIsSaving(true);
 try {
 // Enviamos el objeto de datos y el archivo seleccionado (si hay uno)
 await clienteService.updateMyProfile(data, selectedFile || undefined);

 Swal.fire({
 icon: "success",
 title: "¡Perfil Actualizado!",
 text: "Tus datos han sido guardados exitosamente.",
 timer: 2000,
 showConfirmButton: false,
 });
 // Reset selected file after upload
 setSelectedFile(null);
 } catch (error: any) {
 Swal.fire("Error", error.response?.data?.message || "Hubo un problema al actualizar tu perfil.", "error");
 } finally {
 setIsSaving(false);
 }
 };

 if (isLoading) {
 return (
 <div className="h-full flex items-center justify-center">
 <Loader2 className="animate-spin text-primary" size={32} />
 </div>
 );
 }

 return (
 <div className="h-full flex flex-col p-4 md:p-6 lg:p-8 overflow-y-auto custom-scrollbar">
 <div className="max-w-4xl w-full mx-auto space-y-6">

 <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
 {/* Cover Header */}
 <div className="h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600"></div>

 {/* Avatar Section */}
 <div className="px-6 md:px-10 pb-6 -mt-16 sm:-mt-20 flex flex-col sm:flex-row sm:items-end gap-6 sm:gap-8 relative">
 <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-slate-100 ring-4 ring-white shadow-lg shrink-0 flex items-center justify-center mx-auto sm:mx-0 relative group">
 <input
 type="file"
 accept="image/*"
 className="hidden"
 id="avatar-upload"
 onChange={(e) => {
 const file = e.target.files?.[0];
 if (file) {
 setSelectedFile(file);
 const objectUrl = URL.createObjectURL(file);
 setValue("fotoPerfilUrl", objectUrl, { shouldDirty: true });
 }
 }}
 />
 <label
 htmlFor="avatar-upload"
 className="absolute inset-0 rounded-full cursor-pointer z-10 overflow-hidden"
 >
 {/* Base Image */}
 {photoUrl ? (
 <img src={photoUrl} alt="Perfil" className="w-full h-full object-cover" />
 ) : (
 <div className="w-full h-full flex items-center justify-center bg-slate-100 ">
 <UserCircle size={80} className="text-slate-400" strokeWidth={1} />
 </div>
 )}

 {/* Hover Overlay */}
 <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
 <Camera size={28} className="mb-2" />
 <span className="text-xs font-medium">Cambiar foto</span>
 </div>
 </label>
 </div>
 <div className="flex-1 text-center sm:text-left pb-2">
 <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 ">
 Mi Perfil Personal
 </h1>
 <p className="text-slate-500 mt-1 flex justify-center sm:justify-start items-center gap-1.5">
 <User size={16} /> {nombre || "Usuario"}
 </p>
 </div>
 </div>

 <div className="h-px bg-slate-200 mx-6 md:mx-10" />

 {/* Form */}
 <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-10 space-y-8">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="md:col-span-2 text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">
 Datos Básicos
 </div>

 <div className="space-y-2">
 <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
 <User size={16} className="text-slate-400" /> Nombres
 </label>
 <input
 {...register("nombres")}
 placeholder="Ej. Juan Carlos"
 className={`w-full px-4 py-2 rounded-xl border bg-slate-50 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${errors.nombres ? "border-red-500 focus:ring-red-500" : "border-slate-200 "}`}
 />
 {errors.nombres && <p className="text-red-500 text-xs mt-1">{errors.nombres.message}</p>}
 </div>

 <div className="space-y-2">
 <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
 <User size={16} className="text-slate-400" /> Apellidos
 </label>
 <input
 {...register("apellidos")}
 placeholder="Ej. Pérez Gómez"
 className={`w-full px-4 py-2 rounded-xl border bg-slate-50 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${errors.apellidos ? "border-red-500 focus:ring-red-500" : "border-slate-200 "}`}
 />
 {errors.apellidos && <p className="text-red-500 text-xs mt-1">{errors.apellidos.message}</p>}
 </div>

 <div className="space-y-2">
 <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
 <Phone size={16} className="text-slate-400" /> Teléfono
 </label>
 <input
 {...register("telefono")}
 placeholder="Ej. +51 987 654 321"
 className={`w-full px-4 py-2 rounded-xl border bg-slate-50 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${errors.telefono ? "border-red-500 focus:ring-red-500" : "border-slate-200 "}`}
 />
 {errors.telefono && <p className="text-red-500 text-xs mt-1">{errors.telefono.message}</p>}
 </div>

 <div className="space-y-2 md:col-span-2">
 <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
 <MapPin size={16} className="text-slate-400" /> Dirección
 </label>
 <input
 {...register("direccion")}
 placeholder="Av. Principal 123, Ciudad"
 className={`w-full px-4 py-2 rounded-xl border bg-slate-50 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${errors.direccion ? "border-red-500 focus:ring-red-500" : "border-slate-200 "}`}
 />
 {errors.direccion && <p className="text-red-500 text-xs mt-1">{errors.direccion.message}</p>}
 </div>


 </div>

 <div className="pt-8 border-t border-slate-200 flex justify-end">
 <Button type="submit" disabled={isSaving || !isDirty} className="gap-2 px-8">
 {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
 {isSaving ? "Guardando..." : "Guardar Cambios"}
 </Button>
 </div>
 </form>
 </div>

 </div>
 </div>
 );
};
