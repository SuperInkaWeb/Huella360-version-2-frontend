import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
 User,
 Settings,
 Save,
 ShieldCheck,
 Lock,
 Loader2,
 Camera,
 UserCircle,
 MapPin,
 Phone
} from "lucide-react";
import { Button } from "../../../../components/ui/Button";
import { useAuth } from "../../../auth/context/useAuth";
import { authService } from "../../../auth/services/authService";
import { clienteService } from "../services/clienteService";
import Swal from "sweetalert2";

/* ── Schema ─────────────────────────────────────────────────── */
const profileSchema = z.object({
 nombres: z.string().min(2, "Los nombres deben tener al menos 2 caracteres"),
 apellidos: z.string().min(2, "Los apellidos deben tener al menos 2 caracteres"),
 telefono: z.string().min(6, "El teléfono debe tener un formato válido").max(15, "Teléfono demasiado largo").regex(/^\d+$/, "Solo números permitidos"),
 direccion: z.string().min(5, "La dirección debe ser más descriptiva").optional().or(z.literal("")),
 fotoPerfilUrl: z.string().optional().or(z.literal("")),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export const ClienteConfigPage = () => {
 const { nombre, logout } = useAuth();
 const [activeTab, setActiveTab] = useState<"perfil" | "seguridad">("perfil");
 const [isLoading, setIsLoading] = useState(true);
 const [isSaving, setIsSaving] = useState(false);
 const [selectedFile, setSelectedFile] = useState<File | null>(null);

 const {
 register,
 handleSubmit,
 setValue,
 watch,
 formState: { errors, isDirty },
 } = useForm<ProfileFormData>({
 resolver: zodResolver(profileSchema),
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
 setIsLoading(true);
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

 const onSubmitProfile = async (data: ProfileFormData) => {
 setIsSaving(true);
 try {
 await clienteService.updateMyProfile(data, selectedFile || undefined);
 Swal.fire({
 icon: "success",
 title: "¡Perfil Actualizado!",
 text: "Tus datos han sido guardados exitosamente.",
 timer: 2000,
 showConfirmButton: false,
 });
 setSelectedFile(null);
 } catch (error: any) {
 Swal.fire("Error", error.response?.data?.message || "Hubo un problema al actualizar tu perfil.", "error");
 } finally {
 setIsSaving(false);
 }
 };

 const handleLogoutAll = async () => {
 const result = await Swal.fire({
 title: "¿Cerrar sesión?",
 text: "Se cerrará tu sesión actual.",
 icon: "warning",
 showCancelButton: true,
 confirmButtonColor: "#3085d6",
 cancelButtonColor: "#d33",
 confirmButtonText: "Sí, cerrar",
 cancelButtonText: "Cancelar"
 });

 if (result.isConfirmed) {
 logout();
 Swal.fire({
 icon: "success",
 title: "Sesión cerrada",
 text: "Has cerrado sesión exitosamente.",
 timer: 2000,
 showConfirmButton: false
 });
 }
 };

 const handleChangePassword = async () => {
 const { value: formValues } = await Swal.fire({
 title: "Cambiar Contraseña",
 html: `
 <div class="space-y-4 text-left">
 <div class="space-y-1">
 <label class="text-xs font-bold text-slate-500 uppercase">Contraseña Actual</label>
 <input id="swal-input1" type="password" class="swal2-input !mt-1 !mb-2 !w-full" placeholder="Contraseña actual">
 </div>
 <div class="space-y-1">
 <label class="text-xs font-bold text-slate-500 uppercase">Nueva Contraseña</label>
 <input id="swal-input2" type="password" class="swal2-input !mt-1 !mb-2 !w-full" placeholder="Nueva contraseña">
 </div>
 <div class="space-y-1">
 <label class="text-xs font-bold text-slate-500 uppercase">Confirmar Contraseña</label>
 <input id="swal-input3" type="password" class="swal2-input !mt-1 !w-full" placeholder="Confirmar contraseña">
 </div>
 </div>
 `,
 focusConfirm: false,
 showCancelButton: true,
 confirmButtonText: "Actualizar Contraseña",
 cancelButtonText: "Cancelar",
 preConfirm: () => {
 const oldPassword = (document.getElementById("swal-input1") as HTMLInputElement).value;
 const newPassword = (document.getElementById("swal-input2") as HTMLInputElement).value;
 const confirmPassword = (document.getElementById("swal-input3") as HTMLInputElement).value;

 if (!oldPassword || !newPassword || !confirmPassword) {
 Swal.showValidationMessage("Por favor completa todos los campos");
 return false;
 }
 if (newPassword.length < 8) {
 Swal.showValidationMessage("La nueva contraseña debe tener al menos 8 caracteres");
 return false;
 }
 if (newPassword !== confirmPassword) {
 Swal.showValidationMessage("Las contraseñas no coinciden");
 return false;
 }
 return { oldPassword, newPassword, confirmPassword };
 }
 });

 if (formValues) {
 try {
 await authService.changePassword(formValues);
 Swal.fire({
 icon: "success",
 title: "¡Contraseña Actualizada!",
 text: "Tu contraseña ha sido cambiada correctamente.",
 timer: 2000,
 showConfirmButton: false
 });
 } catch (error: any) {
 Swal.fire("Error", error.response?.data?.message || "No se pudo cambiar la contraseña.", "error");
 }
 }
 };

 if (isLoading) {
 return (
 <div className="h-full flex items-center justify-center min-h-[400px]">
 <Loader2 className="animate-spin text-primary" size={32} />
 </div>
 );
 }

 return (
 <div className="h-full flex flex-col p-4 md:p-6 lg:p-8 overflow-y-auto custom-scrollbar">
 <div className="mb-8">
 <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
 <Settings className="text-primary" /> Mi Configuración
 </h1>
 <p className="text-sm text-slate-500 mt-1">
 Administra tus datos personales y preferencias de seguridad.
 </p>
 </div>

 {/* Tabs Navigation */}
 <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit mb-8 shadow-inner">
 <button
 onClick={() => setActiveTab("perfil")}
 className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === "perfil"
 ? "bg-white text-primary shadow-sm"
 : "text-slate-500 hover:text-slate-700 :text-slate-300"
 }`}
 >
 <User size={18} />
 Mi Perfil
 </button>
 <button
 onClick={() => setActiveTab("seguridad")}
 className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === "seguridad"
 ? "bg-white text-primary shadow-sm"
 : "text-slate-500 hover:text-slate-700 :text-slate-300"
 }`}
 >
 <Lock size={18} />
 Seguridad
 </button>
 </div>

 <div className="max-w-4xl">
 {activeTab === "perfil" && (
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
 {/* Sidebar Info */}
 <div className="lg:col-span-1 space-y-6">
 <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm text-center">
 <div className="relative inline-block mb-4 group">
 <div className="h-32 w-32 rounded-full overflow-hidden ring-4 ring-primary/10 shadow-lg relative mx-auto">
 {photoUrl ? (
 <img src={photoUrl} alt="Perfil" className="w-full h-full object-cover" />
 ) : (
 <div className="w-full h-full flex items-center justify-center bg-slate-50 ">
 <UserCircle size={80} className="text-slate-300" />
 </div>
 )}
 <input
 type="file"
 accept="image/*"
 className="hidden"
 id="avatar-upload-config"
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
 htmlFor="avatar-upload-config"
 className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer"
 >
 <Camera size={24} />
 </label>
 </div>
 </div>
 <h2 className="text-xl font-bold text-slate-900 capitalize">
 {nombre || "Usuario"}
 </h2>
 <p className="text-sm text-slate-500 mb-6">Dueño de Mascota</p>

 <div className="pt-6 border-t border-slate-50 flex justify-center gap-4">
 <div className="text-center">
 <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Estado</p>
 <p className="text-xs font-bold text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full mt-1">Activo</p>
 </div>
 </div>
 </div>

 <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 ">
 <div className="flex items-center gap-3 text-blue-700 mb-2">
 <ShieldCheck size={20} />
 <h3 className="font-bold">Privacidad</h3>
 </div>
 <p className="text-xs text-blue-600/80 leading-relaxed">
 Tu información personal está protegida. Nunca compartimos tus datos con terceros sin tu consentimiento.
 </p>
 </div>
 </div>

 {/* Profile Form */}
 <div className="lg:col-span-2">
 <form onSubmit={handleSubmit(onSubmitProfile)} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
 <div className="p-6 md:p-8 space-y-6">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
 <div className="space-y-2">
 <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
 <User size={16} className="text-slate-400" /> Nombres
 </label>
 <input
 {...register("nombres")}
 className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50 outline-none focus:ring-2 focus:ring-primary/20 transition-all ${errors.nombres ? "border-red-500" : "border-slate-200 "}`}
 />
 {errors.nombres && <p className="text-red-500 text-xs">{errors.nombres.message}</p>}
 </div>

 <div className="space-y-2">
 <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
 <User size={16} className="text-slate-400" /> Apellidos
 </label>
 <input
 {...register("apellidos")}
 className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50 outline-none focus:ring-2 focus:ring-primary/20 transition-all ${errors.apellidos ? "border-red-500" : "border-slate-200 "}`}
 />
 {errors.apellidos && <p className="text-red-500 text-xs">{errors.apellidos.message}</p>}
 </div>

 <div className="space-y-2">
 <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
 <Phone size={16} className="text-slate-400" /> Teléfono
 </label>
 <input
 {...register("telefono")}
 className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50 outline-none focus:ring-2 focus:ring-primary/20 transition-all ${errors.telefono ? "border-red-500" : "border-slate-200 "}`}
 />
 {errors.telefono && <p className="text-red-500 text-xs">{errors.telefono.message}</p>}
 </div>

 <div className="space-y-2 md:col-span-2">
 <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
 <MapPin size={16} className="text-slate-400" /> Dirección
 </label>
 <input
 {...register("direccion")}
 className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50 outline-none focus:ring-2 focus:ring-primary/20 transition-all ${errors.direccion ? "border-red-500" : "border-slate-200 "}`}
 />
 {errors.direccion && <p className="text-red-500 text-xs">{errors.direccion.message}</p>}
 </div>
 </div>

 <div className="pt-6 border-t border-slate-50 flex justify-end">
 <Button type="submit" disabled={isSaving || !isDirty} className="gap-2 px-8">
 {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
 {isSaving ? "Guardando..." : "Guardar Cambios"}
 </Button>
 </div>
 </div>
 </form>
 </div>
 </div>
 )}

 {activeTab === "seguridad" && (
 <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-2xl">
 <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
 <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50 flex items-center gap-3">
 <Lock size={18} className="text-primary" />
 <h3 className="font-bold text-slate-900 ">Seguridad de la Cuenta</h3>
 </div>
 <div className="p-8 space-y-6">
 <div>
 <h4 className="font-bold text-slate-700 mb-2">Contraseña</h4>
 <p className="text-sm text-slate-500 mb-4">Te recomendamos cambiar tu contraseña periódicamente para mantener tu cuenta segura.</p>
 <Button
 variant="outline"
 onClick={handleChangePassword}
 className="w-full sm:w-auto justify-between items-center group font-medium text-slate-700 rounded-xl px-6"
 >
 <span>Cambiar mi contraseña</span>
 <Settings size={16} className="text-slate-400 group-hover:text-primary transition-colors ml-4" />
 </Button>
 </div>
 <div className="pt-6 border-t border-slate-50 ">
 <h4 className="font-bold text-slate-700 mb-2">Sesión</h4>
 <p className="text-sm text-slate-500 mb-4">Si crees que alguien más ha accedido a tu cuenta, puedes cerrar sesión en todos los dispositivos.</p>
 <Button
 variant="outline"
 onClick={handleLogoutAll}
 className="w-full sm:w-auto text-red-500 border-red-100 hover:bg-red-50 :bg-red-950/20 rounded-xl"
 >
 Cerrar todas las sesiones
 </Button>
 </div>
 </div>
 </div>
 </div>
 )}
 </div>
 </div>
 );
};
