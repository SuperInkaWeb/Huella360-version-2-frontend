import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Calendar, Clock, User, Mail, Phone, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { appointmentService } from "../../shared/appointments/appointmentService";
import type { CrearCitaEmpresaRequest } from "../../shared/appointments/appointmentService";
import { serviceService } from "../services/serviceService";
import { useAuth } from "../../../auth/context/AuthContext";
import Swal from "sweetalert2";

const formatSlot = (slot: string) => slot.slice(0, 5);

const citaSchema = z.object({
    servicioId: z.coerce.number().min(1, "Selecciona un servicio"),
    fechaProgramada: z.string().min(1, "La fecha es requerida"),
    horaInicio: z.string().min(1, "La hora es requerida"),
    guestNombre: z.string().optional(),
    guestEmail: z.string().email("Correo inválido").optional().or(z.literal("")),
    guestTelefono: z.string().optional(),
    notasCliente: z.string().optional(),
    notasInternas: z.string().optional(),
});

type CitaFormData = z.infer<typeof citaSchema>;

interface CrearCitaEmpresaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const CrearCitaEmpresaModal = ({ isOpen, onClose, onSuccess }: CrearCitaEmpresaModalProps) => {
    const { empresaId } = useAuth();
    const queryClient = useQueryClient();
    const [esInvitado, setEsInvitado] = useState(true);
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    const [slotsError, setSlotsError] = useState<string | null>(null);

    const { data: servicios = [] } = useQuery({
        queryKey: ["empresa-servicios-select", empresaId],
        queryFn: async () => {
            const data = await serviceService.getMyServices(0, 100);
            return data.content.filter((s) => s.activo && s.visible);
        },
        enabled: isOpen && !!empresaId,
    });

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm<CitaFormData>({
        resolver: zodResolver(citaSchema) as any,
    });

    const servicioIdValue = watch("servicioId");
    const fechaProgramadaValue = watch("fechaProgramada");
    const horaInicioValue = watch("horaInicio");

    useEffect(() => {
        if (!isOpen || !empresaId || !servicioIdValue || !fechaProgramadaValue) {
            setAvailableSlots([]);
            return;
        }
        setIsLoadingSlots(true);
        setSlotsError(null);
        appointmentService
            .getAvailableSlots(empresaId, Number(servicioIdValue), fechaProgramadaValue)
            .then((slots) => setAvailableSlots(slots))
            .catch(() => setSlotsError("No se pudieron cargar los horarios disponibles."))
            .finally(() => setIsLoadingSlots(false));
    }, [isOpen, empresaId, servicioIdValue, fechaProgramadaValue]);

    const createMutation = useMutation({
        mutationFn: (request: CrearCitaEmpresaRequest) =>
            appointmentService.createForEmpresa(request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["empresa-citas"] });
            reset();
            onSuccess();
            Swal.fire({ icon: "success", title: "Cita creada", timer: 1500, showConfirmButton: false });
        },
        onError: (err: any) => {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: err?.response?.data?.message || "No se pudo crear la cita.",
            });
        },
    });

    const onSubmit = (data: CitaFormData) => {
        if (!esInvitado && !data.guestEmail) {
            Swal.fire({ icon: "warning", title: "Campo requerido", text: "Ingresa el correo del cliente." });
            return;
        }

        const request: CrearCitaEmpresaRequest = {
            servicioId: data.servicioId,
            fechaProgramada: data.fechaProgramada,
            horaInicio: data.horaInicio,
            guestNombre: esInvitado ? data.guestNombre : undefined,
            guestEmail: esInvitado ? data.guestEmail : undefined,
            guestTelefono: esInvitado ? data.guestTelefono : undefined,
            notasCliente: data.notasCliente || undefined,
            notasInternas: data.notasInternas || undefined,
        };

        createMutation.mutate(request);
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/30" onClick={handleClose} />
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
                    <h2 className="text-lg font-bold text-slate-900">Nueva Cita</h2>
                    <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                        <X size={18} className="text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                    {/* Tipo de cliente */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Tipo de cliente</label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setEsInvitado(true)}
                                className={`flex-1 h-10 rounded-xl text-sm font-semibold transition-all border ${
                                    esInvitado
                                        ? "bg-teal-50 border-teal-300 text-teal-700"
                                        : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                                }`}
                            >
                                Sin cuenta (invitado)
                            </button>
                            <button
                                type="button"
                                onClick={() => setEsInvitado(false)}
                                className={`flex-1 h-10 rounded-xl text-sm font-semibold transition-all border ${
                                    !esInvitado
                                        ? "bg-teal-50 border-teal-300 text-teal-700"
                                        : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                                }`}
                            >
                                Registrado
                            </button>
                        </div>
                    </div>

                    {/* Datos del invitado */}
                    {esInvitado && (
                        <div className="space-y-4 bg-slate-50 rounded-xl p-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Nombre completo</label>
                                <div className="relative">
                                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                                    <input
                                        type="text"
                                        {...register("guestNombre")}
                                        placeholder="Ej: María Pérez"
                                        className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Correo electrónico *</label>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                                    <input
                                        type="email"
                                        {...register("guestEmail")}
                                        placeholder="correo@ejemplo.com"
                                        className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400"
                                    />
                                </div>
                                {errors.guestEmail && (
                                    <p className="mt-1 text-xs text-red-500">{errors.guestEmail.message}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Teléfono</label>
                                <div className="relative">
                                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                                    <input
                                        type="tel"
                                        {...register("guestTelefono")}
                                        placeholder="0991234567"
                                        className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Servicio */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Servicio *</label>
                        <select
                            {...register("servicioId")}
                            className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400"
                        >
                            <option value="">Seleccionar servicio</option>
                            {servicios.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.nombre} — ${s.precio}
                                </option>
                            ))}
                        </select>
                        {errors.servicioId && (
                            <p className="mt-1 text-xs text-red-500">{errors.servicioId.message}</p>
                        )}
                    </div>

                    {/* Fecha */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Fecha *</label>
                        <div className="relative">
                            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                            <input
                                type="date"
                                {...register("fechaProgramada")}
                                className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400"
                            />
                        </div>
                        {errors.fechaProgramada && (
                            <p className="mt-1 text-xs text-red-500">{errors.fechaProgramada.message}</p>
                        )}
                    </div>

                    {/* Horarios disponibles */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
                            <Clock size={14} /> Hora disponible *
                        </label>
                        {!servicioIdValue || !fechaProgramadaValue ? (
                            <p className="text-xs text-slate-400 bg-slate-50 rounded-xl px-3 py-2">
                                Selecciona un servicio y una fecha para ver los horarios disponibles.
                            </p>
                        ) : isLoadingSlots ? (
                            <div className="flex items-center justify-center py-3">
                                <Loader2 size={16} className="animate-spin text-teal-500" />
                            </div>
                        ) : slotsError ? (
                            <p className="text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2">{slotsError}</p>
                        ) : availableSlots.length === 0 ? (
                            <p className="text-xs text-slate-500 bg-slate-50 rounded-xl px-3 py-2">
                                No hay horarios disponibles para esta fecha.
                            </p>
                        ) : (
                            <div className="grid grid-cols-3 gap-2">
                                {availableSlots.map((slot) => {
                                    const value = formatSlot(slot);
                                    const selected = horaInicioValue === value;
                                    return (
                                        <button
                                            key={slot}
                                            type="button"
                                            onClick={() => setValue("horaInicio", value, { shouldValidate: true })}
                                            className={`py-2 rounded-xl text-sm font-semibold border transition-all ${selected
                                                ? "bg-teal-500 border-teal-500 text-white"
                                                : "bg-white border-slate-200 text-slate-700 hover:border-teal-300"
                                                }`}
                                        >
                                            {value}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                        {errors.horaInicio && (
                            <p className="mt-1 text-xs text-red-500">{errors.horaInicio.message}</p>
                        )}
                    </div>

                    {/* Notas */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Notas del cliente</label>
                        <textarea
                            {...register("notasCliente")}
                            rows={2}
                            placeholder="Motivo de la cita, síntomas..."
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Notas internas (solo equipo)</label>
                        <textarea
                            {...register("notasInternas")}
                            rows={2}
                            placeholder="Anotaciones internas..."
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 resize-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 h-11 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={createMutation.isPending || !horaInicioValue}
                            className="flex-1 h-11 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold transition-colors disabled:opacity-50"
                        >
                            {createMutation.isPending ? "Creando..." : "Crear Cita"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
