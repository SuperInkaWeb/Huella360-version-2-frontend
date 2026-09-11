import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Settings,
    Building2,
    Save,
    Loader2,
    Mail,
    Phone,
    MapPin,
    Camera,
    Image as ImageIcon,
    Lock,
    Search,
    Clock
} from "lucide-react";
import { Button } from "../../../../components/ui/Button";
import { api } from "../../../../shared/http/api";
import { useAuth } from "../../../auth/context/useAuth";
import { authService } from "../../../auth/services/authService";
import Swal from "sweetalert2";
import { MapPicker } from "../components/MapPicker";
import { geocodeAddress } from "../../../../shared/utils/geocoding";
import { horarioService } from "../services/horarioService";
import { DIAS_SEMANA } from "../types/horario.types";
import type { HorarioAtencion, DiaSemana } from "../types/horario.types";

const generalDataSchema = z.object({
    nombreComercial: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    emailContacto: z.string().email("Email inválido"),
    telefono: z.string().min(7, "Teléfono inválido").regex(/^\d+$/, "Solo números permitidos"),
    tipoServicio: z.string().min(2, "Requerido"),
    tipoServicioOtro: z.string().optional(),
    direccion: z.string().min(5, "La dirección es muy corta"),
    descripcion: z.string().optional(),
    latitud: z.number().optional().nullable(),
    longitud: z.number().optional().nullable(),
}).refine((data) => data.tipoServicio !== "OTRO" || (data.tipoServicioOtro && data.tipoServicioOtro.trim().length > 0), {
    message: "Debe especificar el tipo de servicio",
    path: ["tipoServicioOtro"],
});

type GeneralDataValues = z.infer<typeof generalDataSchema>;

export const EmpresaConfigPage = () => {
    const { logout } = useAuth();
    const [activeTab, setActiveTab] = useState<"general" | "pago" | "seguridad" | "horarios">("general");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isGeocoding, setIsGeocoding] = useState(false);

    const [horarios, setHorarios] = useState<HorarioAtencion[]>([]);
    const [isLoadingHorarios, setIsLoadingHorarios] = useState(false);
    const [isSavingHorarios, setIsSavingHorarios] = useState(false);
    const [horariosLoaded, setHorariosLoaded] = useState(false);

    // Image states
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [bannerFile, setBannerFile] = useState<File | null>(null);

    const {
        register: registerGeneral,
        handleSubmit: handleSubmitGeneral,
        reset: resetGeneral,
        watch: watchGeneral,
        setValue: setGeneralValue,
        formState: { errors: errorsGeneral },
    } = useForm<GeneralDataValues>({
        resolver: zodResolver(generalDataSchema),
    });

    const tipoServicio = watchGeneral("tipoServicio");
    const latitud = watchGeneral("latitud");
    const longitud = watchGeneral("longitud");

    useEffect(() => {
        fetchCompanyData();
    }, []);

    useEffect(() => {
        if (activeTab === "horarios" && !horariosLoaded) {
            fetchHorarios();
        }
    }, [activeTab, horariosLoaded]);

    const buildDefaultHorarios = (existentes: HorarioAtencion[]): HorarioAtencion[] => {
        return DIAS_SEMANA.map(({ value }) => {
            const existente = existentes.find((h) => h.diaSemana === value);
            return (
                existente || {
                    diaSemana: value,
                    horaInicio: "09:00",
                    horaFin: "18:00",
                    capacidad: 1,
                    activo: false,
                }
            );
        });
    };

    const fetchHorarios = async () => {
        setIsLoadingHorarios(true);
        try {
            const data = await horarioService.getHorarios();
            setHorarios(buildDefaultHorarios(data));
            setHorariosLoaded(true);
        } catch (error) {
            console.error("Error al cargar horarios de atención:", error);
            setHorarios(buildDefaultHorarios([]));
        } finally {
            setIsLoadingHorarios(false);
        }
    };

    const updateHorario = (dia: DiaSemana, campo: keyof HorarioAtencion, valor: string | number | boolean) => {
        setHorarios((prev) =>
            prev.map((h) => (h.diaSemana === dia ? { ...h, [campo]: valor } : h))
        );
    };

    const handleGuardarHorarios = async () => {
        setIsSavingHorarios(true);
        try {
            const data = await horarioService.guardarHorarios(horarios);
            setHorarios(buildDefaultHorarios(data));
            Swal.fire({
                icon: "success",
                title: "Horarios guardados",
                timer: 1500,
                showConfirmButton: false,
            });
        } catch (error: any) {
            Swal.fire("Error", error.response?.data?.message || "No se pudieron guardar los horarios.", "error");
        } finally {
            setIsSavingHorarios(false);
        }
    };

    const fetchCompanyData = async () => {
        try {
            setIsLoading(true);
            const response = await api.get("/companies/me");
            const data = response.data.data;

            const knownTypes = ["VETERINARIA", "PETSHOP", "GROOMING", "HIBRIDO"];
            const isCustom = !knownTypes.includes(data.tipoServicio);

            resetGeneral({
                nombreComercial: data.nombreComercial,
                emailContacto: data.emailContacto,
                telefono: data.telefono,
                direccion: data.direccion,
                descripcion: data.descripcion || "",
                tipoServicio: isCustom ? "OTRO" : data.tipoServicio,
                tipoServicioOtro: isCustom ? data.tipoServicio : "",
                latitud: data.latitud,
                longitud: data.longitud
            });

            if (data.logoUrl) setLogoPreview(data.logoUrl);
            if (data.bannerUrl) setBannerPreview(data.bannerUrl);

        } catch (error) {
            console.error("Error al cargar datos de empresa:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const onUpdateGeneral = async (data: GeneralDataValues) => {
        setIsSaving(true);
        try {
            const finalData = {
                ...data,
                tipoServicio: data.tipoServicio === "OTRO" ? (data.tipoServicioOtro || "").trim() || "OTRO" : data.tipoServicio,
                latitud: data.latitud,
                longitud: data.longitud
            };

            const formData = new FormData();
            // El backend espera el objeto DTO en una parte llamada "data" como JSON
            formData.append("data", new Blob([JSON.stringify(finalData)], { type: "application/json" }));

            if (logoFile) {
                formData.append("logo", logoFile);
            }
            if (bannerFile) {
                formData.append("banner", bannerFile);
            }

            await api.put("/companies", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            Swal.fire({
                icon: "success",
                title: "¡Actualizado!",
                text: "Los datos generales han sido guardados.",
                timer: 2000,
                showConfirmButton: false,
            });

            // Refresh to get new signed URLs if any
            fetchCompanyData();
            setLogoFile(null);
            setBannerFile(null);

        } catch (error) {
            console.error("Error al actualizar empresa:", error);
            Swal.fire("Error", "No se pudieron guardar los cambios.", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleGeocodeAddress = async () => {
        const address = watchGeneral("direccion");
        if (!address || address.trim().length < 5) {
            Swal.fire("Atención", "Escribe una dirección válida antes de buscarla en el mapa.", "warning");
            return;
        }

        setIsGeocoding(true);
        try {
            const result = await geocodeAddress(address);
            if (result) {
                setGeneralValue("latitud", result.lat);
                setGeneralValue("longitud", result.lng);
            } else {
                Swal.fire("Sin resultados", "No se encontró esa dirección. Ajusta el punto manualmente en el mapa.", "info");
            }
        } catch {
            Swal.fire("Error", "No se pudo buscar la dirección. Intenta de nuevo o ubícala manualmente.", "error");
        } finally {
            setIsGeocoding(false);
        }
    };

    const handleLogoutAll = async () => {
        const result = await Swal.fire({
            title: "¿Cerrar todas las sesiones?",
            text: "Se cerrará tu sesión actual y todas las sesiones en otros dispositivos.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sí, cerrar todas",
            cancelButtonText: "Cancelar"
        });

        if (result.isConfirmed) {
            try {
                await authService.logoutAll();
            } catch {
                // Continue with local logout even if backend fails
            }
            logout();
            Swal.fire({
                icon: "success",
                title: "Sesiones cerradas",
                text: "Has cerrado todas las sesiones exitosamente.",
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
            <div className="h-full flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col p-4 md:p-6 lg:p-8 overflow-y-auto custom-scrollbar">
            <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
                    <Settings className="text-primary" /> Configuración de Empresa
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    Gestiona la información pública de tu veterinaria y tus integraciones de pago.
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                <div className="w-full lg:w-64 flex flex-row lg:flex-col gap-2 shrink-0">
                    <button
                        onClick={() => setActiveTab("general")}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === "general"
                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                            : "bg-white text-slate-600 border border-slate-100 hover:bg-slate-50"
                            }`}
                    >
                        <Building2 size={18} />
                        <span>Datos Generales</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("seguridad")}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === "seguridad"
                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                            : "bg-white text-slate-600 border border-slate-100 hover:bg-slate-50"
                            }`}
                    >
                        <Lock size={18} />
                        <span>Seguridad</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("horarios")}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === "horarios"
                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                            : "bg-white text-slate-600 border border-slate-100 hover:bg-slate-50"
                            }`}
                    >
                        <Clock size={18} />
                        <span>Horario de Atención</span>
                    </button>
                </div>

                <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    {activeTab === "general" ? (
                        <div className="p-6 md:p-8">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                                    <Building2 size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">Perfil de la Empresa</h2>
                                    <p className="text-sm text-slate-500">Información básica que verán tus clientes.</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmitGeneral(onUpdateGeneral)} className="space-y-8">
                                {/* Visual Identity Section */}
                                <div className="space-y-6">
                                    <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                                        Identidad Visual
                                    </div>

                                    {/* Banner Upload */}
                                    <div className="relative group rounded-3xl overflow-hidden bg-slate-100 border-2 border-dashed border-slate-200 h-48">
                                        {bannerPreview ? (
                                            <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                                <ImageIcon size={48} strokeWidth={1} />
                                                <span className="text-sm mt-2">Banner de la veterinaria</span>
                                            </div>
                                        )}
                                        <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        setBannerFile(file);
                                                        setBannerPreview(URL.createObjectURL(file));
                                                    }
                                                }}
                                            />
                                            <div className="flex flex-col items-center text-white">
                                                <Camera size={24} className="mb-1" />
                                                <span className="text-sm font-bold">Cambiar Banner</span>
                                            </div>
                                        </label>
                                    </div>

                                    {/* Logo Upload */}
                                    <div className="flex flex-col sm:flex-row items-center gap-6">
                                        <div className="relative group w-32 h-32 rounded-3xl overflow-hidden bg-white border-2 border-dashed border-slate-200 shrink-0">
                                            {logoPreview ? (
                                                <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-2" />
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                                    <Building2 size={32} strokeWidth={1} />
                                                </div>
                                            )}
                                            <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            setLogoFile(file);
                                                            setLogoPreview(URL.createObjectURL(file));
                                                        }
                                                    }}
                                                />
                                                <Camera size={20} className="text-white" />
                                            </label>
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="font-bold text-slate-900">Logo de la Veterinaria</h4>
                                            <p className="text-sm text-slate-500">Se recomienda una imagen cuadrada de al menos 400x400px.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px bg-slate-100" />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2 text-sm font-bold text-slate-400 uppercase tracking-widest">
                                        Información de Contacto
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">
                                            Nombre de la Veterinaria
                                        </label>
                                        <div className="relative group">
                                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                                            <input
                                                {...registerGeneral("nombreComercial")}
                                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                            />
                                        </div>
                                        {errorsGeneral.nombreComercial && <p className="text-xs text-red-500">{errorsGeneral.nombreComercial.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Email de Contacto</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                                            <input
                                                {...registerGeneral("emailContacto")}
                                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                            />
                                        </div>
                                        {errorsGeneral.emailContacto && <p className="text-xs text-red-500">{errorsGeneral.emailContacto.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Teléfono</label>
                                        <div className="relative group">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                                            <input
                                                {...registerGeneral("telefono")}
                                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                            />
                                        </div>
                                        {errorsGeneral.telefono && <p className="text-xs text-red-500">{errorsGeneral.telefono.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Tipo de Servicio</label>
                                        <div className="relative group">
                                            <Settings className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                                            <select
                                                {...registerGeneral("tipoServicio")}
                                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none appearance-none"
                                            >
                                                <option value="VETERINARIA">Veterinaria / Clínica</option>
                                                <option value="PETSHOP">Pet Shop / Tienda</option>
                                                <option value="GROOMING">Peluquería / Grooming</option>
                                                <option value="HIBRIDO">Servicio Híbrido (Todo junto)</option>
                                                <option value="OTRO">Otros (Especificar)</option>
                                            </select>
                                        </div>
                                    </div>

                                    {tipoServicio === "OTRO" && (
                                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                            <label className="text-sm font-semibold text-slate-700">Especificar Servicio</label>
                                            <input
                                                {...registerGeneral("tipoServicioOtro")}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                                placeholder="Ej: Guardería, Adiestramiento..."
                                            />
                                            {errorsGeneral.tipoServicioOtro && (
                                                <p className="text-xs text-red-500">{errorsGeneral.tipoServicioOtro.message}</p>
                                            )}
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Dirección Física</label>
                                        <div className="flex gap-2">
                                            <div className="relative group flex-1">
                                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                                                <input
                                                    {...registerGeneral("direccion")}
                                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleGeocodeAddress}
                                                disabled={isGeocoding}
                                                title="Buscar dirección en el mapa"
                                                className="shrink-0 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 hover:text-primary hover:border-primary/40 transition-all disabled:opacity-50"
                                            >
                                                {isGeocoding ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                                            </button>
                                        </div>
                                        <p className="text-[11px] text-slate-400">Escribe la dirección y presiona buscar para ubicarla automáticamente en el mapa. Puedes ajustar el punto manualmente después.</p>
                                        {errorsGeneral.direccion && <p className="text-xs text-red-500">{errorsGeneral.direccion.message}</p>}
                                    </div>

                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Ubicación en el Mapa</label>
                                        <p className="text-xs text-slate-500">Mueve el marcador o haz clic en el mapa para indicar dónde se encuentra tu local.</p>
                                        <MapPicker
                                            lat={latitud || 0}
                                            lng={longitud || 0}
                                            onChange={(lat, lng) => {
                                                setGeneralValue("latitud", lat);
                                                setGeneralValue("longitud", lng);
                                            }}
                                        />
                                        {(latitud && longitud) && (
                                            <div className="flex gap-4 text-[10px] text-slate-400 font-mono">
                                                <span>LAT: {latitud.toFixed(6)}</span>
                                                <span>LNG: {longitud.toFixed(6)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Descripción / Historia</label>
                                    <textarea
                                        {...registerGeneral("descripcion")}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none h-32"
                                        placeholder="Cuéntanos un poco sobre tu centro..."
                                    />
                                </div>

                                <div className="flex justify-end pt-4">
                                    <Button disabled={isSaving} className="gap-2 px-10 h-12 rounded-2xl shadow-xl shadow-primary/20 font-bold transition-all active:scale-95">
                                        {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                        {isSaving ? "Guardando..." : "Guardar Cambios"}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    ) : activeTab === "seguridad" ? (
                        <div className="p-6 md:p-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                                    <Lock size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">Seguridad de la Cuenta</h2>
                                    <p className="text-sm text-slate-500">Protege tu cuenta y gestiona tus sesiones.</p>
                                </div>
                            </div>

                            <div className="space-y-8 max-w-2xl">
                                <div className="p-6 rounded-3xl border border-slate-100 space-y-4">
                                    <div>
                                        <h3 className="font-bold text-slate-900 mb-1 text-lg">Contraseña</h3>
                                        <p className="text-sm text-slate-500">Actualiza tu contraseña regularmente para mayor seguridad.</p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        type="button"
                                        onClick={handleChangePassword}
                                        className="w-full sm:w-auto justify-between items-center group font-medium text-slate-700 rounded-xl px-6"
                                    >
                                        <span>Cambiar mi contraseña</span>
                                        <Settings size={16} className="text-slate-400 group-hover:text-primary transition-colors ml-4" />
                                    </Button>
                                </div>

                                <div className="p-6 rounded-3xl border border-slate-100 space-y-4">
                                    <div>
                                        <h3 className="font-bold text-slate-900 mb-1 text-lg text-red-500">Cerrar Sesión Global</h3>
                                        <p className="text-sm text-slate-500 text-pretty">Si sospechas de actividad inusual, puedes cerrar todas las sesiones activas en otros dispositivos.</p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        type="button"
                                        onClick={handleLogoutAll}
                                        className="w-full sm:w-auto text-red-500 border-red-100 hover:bg-red-50 rounded-xl"
                                    >
                                        Cerrar todas las sesiones
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : activeTab === "horarios" ? (
                        <div className="p-6 md:p-8">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                                    <Clock size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">Horario de Atención</h2>
                                    <p className="text-sm text-slate-500">Define qué días atiendes y cuántas citas simultáneas soportas por horario.</p>
                                </div>
                            </div>

                            {isLoadingHorarios ? (
                                <div className="flex items-center justify-center py-16">
                                    <Loader2 className="animate-spin text-primary" size={28} />
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    <div className="space-y-3">
                                        {horarios.map((h) => {
                                            const label = DIAS_SEMANA.find((d) => d.value === h.diaSemana)?.label || h.diaSemana;
                                            return (
                                                <div
                                                    key={h.diaSemana}
                                                    className={`grid grid-cols-1 sm:grid-cols-[auto_1fr_1fr_auto] items-center gap-3 p-4 rounded-2xl border transition-all ${h.activo ? "border-primary/20 bg-primary/5" : "border-slate-100 bg-slate-50"
                                                        }`}
                                                >
                                                    <label className="flex items-center gap-2 min-w-[120px]">
                                                        <input
                                                            type="checkbox"
                                                            checked={h.activo}
                                                            onChange={(e) => updateHorario(h.diaSemana, "activo", e.target.checked)}
                                                            className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/20"
                                                        />
                                                        <span className="text-sm font-semibold text-slate-700">{label}</span>
                                                    </label>

                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="time"
                                                            value={h.horaInicio}
                                                            disabled={!h.activo}
                                                            onChange={(e) => updateHorario(h.diaSemana, "horaInicio", e.target.value)}
                                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:ring-2 focus:ring-primary/20 outline-none disabled:opacity-50 disabled:bg-slate-100"
                                                        />
                                                        <span className="text-slate-400 text-sm">a</span>
                                                        <input
                                                            type="time"
                                                            value={h.horaFin}
                                                            disabled={!h.activo}
                                                            onChange={(e) => updateHorario(h.diaSemana, "horaFin", e.target.value)}
                                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:ring-2 focus:ring-primary/20 outline-none disabled:opacity-50 disabled:bg-slate-100"
                                                        />
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-slate-500 whitespace-nowrap">Cupo simultáneo</span>
                                                        <input
                                                            type="number"
                                                            min={1}
                                                            value={h.capacidad}
                                                            disabled={!h.activo}
                                                            onChange={(e) => updateHorario(h.diaSemana, "capacidad", Math.max(1, Number(e.target.value)))}
                                                            className="w-20 px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:ring-2 focus:ring-primary/20 outline-none disabled:opacity-50 disabled:bg-slate-100"
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="flex justify-end pt-2">
                                        <Button
                                            onClick={handleGuardarHorarios}
                                            disabled={isSavingHorarios}
                                            className="gap-2 px-8 h-12 rounded-2xl shadow-xl shadow-primary/20 font-bold transition-all active:scale-95"
                                        >
                                            {isSavingHorarios ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                            {isSavingHorarios ? "Guardando..." : "Guardar Horarios"}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="p-6 md:p-8 space-y-4">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Pagos</h2>
                                <p className="text-sm text-slate-500">Procesamiento de pagos centralizado.</p>
                            </div>
                            <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl">
                                <p className="font-bold mb-1 text-blue-800">Pagos centralizados en la plataforma</p>
                                <p className="text-sm text-blue-800">Los cobros se procesan a través de la cuenta oficial de Huella360. No necesitas configurar tu propia cuenta de Mercado Pago; el equipo gestiona los pagos y su liquidación de forma manual.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
