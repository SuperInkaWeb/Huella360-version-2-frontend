import { useState, useEffect } from "react";
import { User, Settings, Save, ShieldCheck, Briefcase, Award, FileText, Camera, Lock } from "lucide-react";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "../../../../components/ui/Button";
import { vetService } from "../services/vetService";
import { authService } from "../../../auth/services/authService";
import { useAuth } from "../../../auth/context/useAuth";
import { useVetProfile } from "../hooks/useVetProfile";
import Swal from "sweetalert2";

const vetProfileSchema = z.object({
 nombres: z.string().min(2, "Los nombres deben tener al menos 2 caracteres"),
 apellidos: z.string().min(2, "Los apellidos deben tener al menos 2 caracteres"),
 especialidad: z.string().optional().or(z.literal("")),
 biografia: z.string().optional().or(z.literal("")),
 aniosExperiencia: z.number().min(0, "Los años de experiencia no pueden ser negativos"),
 numeroColegiatura: z.string().optional().or(z.literal("")).refine(
 (val) => !val || /^\d+$/.test(val),
 "El número de colegiatura debe ser numérico"
 ),
  fotoPerfilUrl: z.string().optional().or(z.literal("")),
});

export const VetConfiguracionPage = () => {
 const { logout } = useAuth();
 const queryClient = useQueryClient();
 const { data: profile, isLoading } = useVetProfile();
 const [activeTab, setActiveTab] = useState<"perfil" | "seguridad" | "pagos">("perfil");
 const [isSaving, setIsSaving] = useState(false);

 // Form state
 const [formData, setFormData] = useState({
   nombres: "",
   apellidos: "",
   especialidad: "",
   biografia: "",
   aniosExperiencia: 0,
   numeroColegiatura: "",
    fotoPerfilUrl: ""
  });

 useEffect(() => {
   if (profile) {
     setFormData({
       nombres: profile.nombres,
       apellidos: profile.apellidos,
       especialidad: profile.especialidad || "",
       biografia: profile.biografia || "",
       aniosExperiencia: profile.aniosExperiencia || 0,
       numeroColegiatura: profile.numeroColegiatura || "",
        fotoPerfilUrl: profile.fotoPerfilUrl || ""
      });
   }
 }, [profile]);

 const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
 const { name, value } = e.target;
 setFormData(prev => ({
 ...prev,
 [name]: name === "aniosExperiencia" ? parseInt(value) || 0 : value
 }));
 };

 const handleSave = async (e: React.FormEvent) => {
   e.preventDefault();

   const result = vetProfileSchema.safeParse(formData);
   if (!result.success) {
     const firstError = Object.values(result.error.flatten().fieldErrors)[0]?.[0];
     Swal.fire("Error de validación", firstError || "Corrige los errores del formulario", "error");
     return;
   }

   setIsSaving(true);
   try {
     await vetService.updateProfile(formData);
     queryClient.invalidateQueries({ queryKey: ["vet-profile"] });
     Swal.fire({
       icon: "success",
       title: "Perfil Actualizado",
       text: "Tus cambios se han guardado correctamente.",
       timer: 2000,
       showConfirmButton: false,
     });
   } catch (error: any) {
     Swal.fire("Error", error.response?.data?.message || "No se pudo actualizar el perfil", "error");
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
 confirmButtonColor: "#14b8a6",
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
 return <div className="p-8 text-center animate-pulse">Cargando perfil...</div>;
 }

 return (
 <div className="h-full flex flex-col p-4 md:p-6 lg:p-8 overflow-y-auto custom-scrollbar">
 <div className="mb-8">
 <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
 <Settings className="text-teal-500" /> Mi Configuración
 </h1>
 <p className="text-sm text-slate-500 mt-1">
 Gestiona tu información profesional y personal.
 </p>
 </div>

 {/* Tabs Navigation */}
 <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit mb-8 shadow-inner">
 <button
 onClick={() => setActiveTab("perfil")}
 className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === "perfil"
 ? "bg-white text-teal-600 shadow-sm"
 : "text-slate-500 hover:text-slate-700 :text-slate-300"
 }`}
 >
 <User size={18} />
 Mi Perfil
 </button>
  <button
  onClick={() => setActiveTab("seguridad")}
  className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === "seguridad"
  ? "bg-white text-teal-600 shadow-sm"
  : "text-slate-500 hover:text-slate-700 :text-slate-300"
  }`}
  >
  <Lock size={18} />
  Seguridad
  </button>
  </div>

 <div className="max-w-6xl">
 {activeTab === "perfil" && (
 <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
 {/* Left Column - Avatar & Core Info */}
 <div className="lg:col-span-1 space-y-6">
 <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm text-center">
 <div className="relative inline-block mb-4">
 <div className="h-32 w-32 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 overflow-hidden shadow-lg ring-4 ring-white flex items-center justify-center">
 {formData.fotoPerfilUrl ? (
 <img src={formData.fotoPerfilUrl} alt="Perfil" className="h-full w-full object-cover" />
 ) : (
 <User size={64} className="text-white" />
 )}
 </div>
 <button
 type="button"
 className="absolute -bottom-2 -right-2 p-2.5 bg-white rounded-xl shadow-lg border border-slate-100 text-teal-600 hover:text-teal-700 transition-all hover:scale-110"
 >
 <Camera size={18} />
 </button>
 </div>
 <h2 className="text-xl font-bold text-slate-900 ">
 Dr. {profile?.nombres} {profile?.apellidos}
 </h2>
 <p className="text-sm text-slate-500">{profile?.email}</p>

 <div className="mt-6 pt-6 border-t border-slate-50 flex justify-center gap-4">
 <div className="text-center">
 <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Estado</p>
 <p className={`text-sm font-semibold ${profile?.estadoValidacion === 'VEREFICADO' ? 'text-emerald-500' : 'text-amber-500'}`}>
 {profile?.estadoValidacion}
 </p>
 </div>
 <div className="w-px h-8 bg-slate-100 "></div>
 <div className="text-center">
 <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Experiencia</p>
 <p className="text-sm font-semibold text-slate-700 ">{profile?.aniosExperiencia} años</p>
 </div>
 </div>
 </div>

 <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 ">
 <div className="flex items-center gap-3 text-emerald-700 mb-2">
 <ShieldCheck size={20} />
 <h3 className="font-bold text-sm">Validación Profesional</h3>
 </div>
 <p className="text-xs text-emerald-600/80 leading-relaxed">
 Tu número de colegiatura y especialidad son visibles para las empresas que buscan reclutar talento.
 </p>
 </div>
 </div>

 {/* Right Column - Form Fields */}
 <div className="lg:col-span-2 space-y-6">
 <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
 <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50 flex items-center gap-3">
 <Briefcase size={18} className="text-teal-500" />
 <h3 className="font-bold text-slate-900 ">Información Profesional</h3>
 </div>
 <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="space-y-2">
 <label className="text-sm font-medium text-slate-700 ">Especialidad</label>
 <input
 type="text"
 name="especialidad"
 value={formData.especialidad}
 onChange={handleChange}
 className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-teal-500 transition-all outline-none"
 />
 </div>
 <div className="space-y-2">
 <label className="text-sm font-medium text-slate-700 ">Años de Experiencia</label>
 <input
 type="number"
 name="aniosExperiencia"
 value={formData.aniosExperiencia}
 onChange={handleChange}
 className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-teal-500 transition-all outline-none"
 />
 </div>
 <div className="space-y-2 md:col-span-2">
 <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
 <Award size={16} className="text-teal-500" /> Número de Colegiatura
 </label>
 <input
 type="text"
 name="numeroColegiatura"
 value={formData.numeroColegiatura}
 onChange={handleChange}
 className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-teal-500 transition-all outline-none"
 />
 </div>
 <div className="space-y-2 md:col-span-2">
 <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
 <FileText size={16} className="text-teal-500" /> Biografía
 </label>
 <textarea
 name="biografia"
 value={formData.biografia}
 onChange={handleChange}
 rows={4}
 className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-teal-500 transition-all outline-none resize-none"
 placeholder="Cuéntanos sobre tu trayectoria y pasión por los animales..."
 />
 </div>
 </div>
 </div>

 <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
 <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50 ">
 <h3 className="font-bold text-slate-900 ">Información Personal</h3>
 </div>
 <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="space-y-2">
 <label className="text-sm font-medium text-slate-700 ">Nombres</label>
 <input
 type="text"
 name="nombres"
 value={formData.nombres}
 onChange={handleChange}
 className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-teal-500 transition-all outline-none"
 />
 </div>
 <div className="space-y-2">
 <label className="text-sm font-medium text-slate-700 ">Apellidos</label>
 <input
 type="text"
 name="apellidos"
 value={formData.apellidos}
 onChange={handleChange}
 className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-teal-500 transition-all outline-none"
 />
 </div>
 </div>
 </div>

 <div className="flex justify-end pt-4">
 <Button type="submit" disabled={isSaving} className="gap-2 px-8 bg-teal-500 hover:bg-teal-600">
 <Save size={18} />
 {isSaving ? "Guardando..." : "Guardar Cambios"}
 </Button>
 </div>
 </div>
 </form>
 )}

 {activeTab === "seguridad" && (
 <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-2xl">
 <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
 <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50 flex items-center gap-3">
 <Lock size={18} className="text-teal-500" />
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
 <Settings size={16} className="text-slate-400 group-hover:text-teal-500 transition-colors ml-4" />
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

  {activeTab === "pagos" && (
  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-2xl">
  <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
  <div className="p-8">
  <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl">
  <p className="text-sm text-blue-800 font-medium leading-relaxed">
  Los cobros se procesan de forma centralizada a través de la plataforma Huella360. No necesitas configurar tu propia cuenta de Mercado Pago; el equipo gestiona los pagos y su liquidación de forma manual.
  </p>
  </div>
  </div>
  </div>
  </div>
  )}
 </div>
 </div>
 );
};
