import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Stethoscope, Check, Camera, Image as ImageIcon } from "lucide-react";
import { Button } from "../../../../components/ui/Button";
import { serviceService } from "../services/serviceService";
import type { Service, CreateServiceRequest } from "../../../catalog/types/service.types";
import Swal from "sweetalert2";



const MODALIDADES = ["PRESENCIAL", "VIRTUAL", "DOMICILIO", "HIBRIDO"] as const;

const serviceSchema = z.object({
    nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    descripcion: z.string().optional(),
    precio: z.number().min(0, "El precio no puede ser negativo"),
    duracionMinutos: z.number().int().positive("La duración debe ser mayor a 0").optional().nullable(),
    modalidad: z.enum(MODALIDADES, { error: "Selecciona una modalidad" }),
    visible: z.boolean(),
});

type ServiceFormData = z.infer<typeof serviceSchema>;



interface ServiceFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    service?: Service | null;
}



export const ServiceFormModal = ({
    isOpen,
    onClose,
    onSuccess,
    service,
}: ServiceFormModalProps) => {
    const [fotoFile, setFotoFile] = useState<File | undefined>();
    const [fotoPreview, setFotoPreview] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ServiceFormData>({
        resolver: zodResolver(serviceSchema),
        defaultValues: { visible: true, modalidad: "PRESENCIAL" },
    });


    useEffect(() => {
        if (!isOpen) return;

        if (service) {
            reset({
                nombre: service.nombre,
                descripcion: service.descripcion ?? "",
                precio: service.precio,
                duracionMinutos: service.duracionMinutos ?? null,
                modalidad: service.modalidad,
                visible: service.visible,
            });
            setFotoPreview(service.imagenUrl ?? null);
        } else {
            reset({
                nombre: "",
                descripcion: "",
                precio: 0,
                duracionMinutos: 30,
                modalidad: "PRESENCIAL",
                visible: true,
            });
            setFotoPreview(null);
            setFotoFile(undefined);
        }
    }, [isOpen, service, reset]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFotoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setFotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };



    const onSubmit = async (data: ServiceFormData) => {
        try {
            if (!service && !fotoFile) {
                Swal.fire("Imagen obligatoria", "Debes subir una imagen para el servicio", "warning");
                return;
            }

            const payload: CreateServiceRequest = {
                ...data,
                duracionMinutos: data.duracionMinutos ?? undefined,
                descripcion: data.descripcion || undefined,
            };

            if (service) {
                await serviceService.updateService(service.id, payload, fotoFile);
                Swal.fire("¡Éxito!", "Servicio actualizado correctamente", "success");
            } else {
                await serviceService.createService(payload, fotoFile);
                Swal.fire("¡Éxito!", "Servicio creado correctamente", "success");
            }

            onSuccess();
            onClose();
        } catch (error: any) {
            const msg = error.response?.data?.message || "Ocurrió un error al procesar el servicio";
            Swal.fire("Error", msg, "error");
        }
    };

    if (!isOpen) return null;



    const MODALIDAD_LABELS: Record<string, string> = {
        PRESENCIAL: "Presencial",
        VIRTUAL: "Virtual",
        DOMICILIO: "A Domicilio",
        HIBRIDO: "Híbrido",
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
            <div className="bg-white w-full max-w-2xl rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[95vh] sm:max-h-[90vh] flex flex-col transition-all duration-300">
                <div className="p-4 sm:p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary shrink-0">
                            <Stethoscope size={20} className="sm:hidden" />
                            <Stethoscope size={24} className="hidden sm:block" />
                        </div>
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                            {service ? "Editar Servicio" : "Nuevo Servicio"}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-thin">
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="flex flex-col items-center gap-4 shrink-0">
                            <div className="relative group">
                                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-slate-50 flex items-center justify-center transition-transform group-hover:scale-[1.02]">
                                    {fotoPreview ? (
                                        <img src={fotoPreview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center text-slate-400">
                                            <ImageIcon size={40} strokeWidth={1.5} />
                                            <span className="text-[10px] mt-2 font-medium">SIN IMAGEN</span>
                                        </div>
                                    )}
                                </div>
                                <label className="absolute -bottom-2 -right-2 p-2.5 bg-primary text-white rounded-xl shadow-lg border-4 border-white cursor-pointer hover:scale-110 active:scale-95 transition-all">
                                    <Camera size={18} />
                                    <input type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
                                </label>
                            </div>
                            <div className="text-center">
                                <p className="text-[11px] text-slate-400 font-medium">Imagen del servicio</p>
                                <p className="text-[9px] text-slate-500 mt-0.5">* Requerido para marketplace</p>
                            </div>
                        </div>

                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-semibold text-slate-700">
                                    Nombre del Servicio
                                </label>
                                <input
                                    {...register("nombre")}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white transition-all focus:ring-2 focus:ring-primary/20 outline-none"
                                    placeholder="Ej: Consulta General, Vacunación, Cirugía"
                                />
                                {errors.nombre && <p className="text-xs text-red-500">{errors.nombre.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">
                                    Precio (S/)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    {...register("precio", { valueAsNumber: true })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white font-mono transition-all focus:ring-2 focus:ring-primary/20 outline-none"
                                />
                                {errors.precio && <p className="text-xs text-red-500">{errors.precio.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">
                                    Duración (minutos)
                                </label>
                                <input
                                    type="number"
                                    {...register("duracionMinutos", { valueAsNumber: true })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white transition-all focus:ring-2 focus:ring-primary/20 outline-none"
                                    placeholder="30"
                                />
                                {errors.duracionMinutos && (
                                    <p className="text-xs text-red-500">{errors.duracionMinutos.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">
                                    Modalidad
                                </label>
                                <select
                                    {...register("modalidad")}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white transition-all focus:ring-2 focus:ring-primary/20 outline-none"
                                >
                                    {MODALIDADES.map((m) => (
                                        <option key={m} value={m}>
                                            {MODALIDAD_LABELS[m]}
                                        </option>
                                    ))}
                                </select>
                                {errors.modalidad && <p className="text-xs text-red-500">{errors.modalidad.message}</p>}
                            </div>


                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-semibold text-slate-700">
                                    Descripción
                                </label>
                                <textarea
                                    {...register("descripcion")}
                                    rows={3}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white resize-none transition-all focus:ring-2 focus:ring-primary/20 outline-none"
                                    placeholder="Describe en qué consiste el servicio..."
                                />
                            </div>
                        </div>
                    </div>
                </form>

                <div className="p-4 sm:p-6 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        type="button"
                        className="w-full sm:w-auto order-2 sm:order-1"
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSubmit(onSubmit)}
                        disabled={isSubmitting}
                        className="w-full sm:w-auto gap-2 order-1 sm:order-2 rounded-xl py-2.5"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center gap-2">
                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Procesando
                            </span>
                        ) : (
                            <>
                                <Check size={20} />
                                <span>{service ? "Guardar Cambios" : "Crear Servicio"}</span>
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};
