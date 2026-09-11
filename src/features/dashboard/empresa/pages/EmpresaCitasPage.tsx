import { useState } from "react";
import { Calendar, Clock, Check, X, Loader2, Info, Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { appointmentService } from "../../shared/appointments/appointmentService";
import { useAuth } from "../../../auth/context/AuthContext";
import { CrearCitaEmpresaModal } from "../components/CrearCitaEmpresaModal";
import Swal from "sweetalert2";

const STATUS_STYLES: Record<string, string> = {
    SOLICITADA: "bg-blue-100 text-blue-700",
    CONFIRMADA: "bg-emerald-100 text-emerald-700",
    COMPLETADA: "bg-slate-100 text-slate-700",
    RECHAZADA: "bg-red-100 text-red-700",
    CANCELADA: "bg-red-100 text-red-700",
    NOSHOW: "bg-orange-100 text-orange-700",
};

export const EmpresaCitasPage = () => {
    const { empresaId } = useAuth();
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data: citas = [], isLoading, error } = useQuery({
        queryKey: ["empresa-citas", empresaId],
        queryFn: () => appointmentService.getCitasByEmpresa(empresaId!),
        enabled: !!empresaId,
        staleTime: 1 * 60 * 1000,
    });

    const updateMutation = useMutation({
        mutationFn: ({ citaId, nuevoEstado }: { citaId: number; nuevoEstado: string }) =>
            appointmentService.updateStatus(citaId, nuevoEstado),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["empresa-citas"] });
        },
    });

    const handleUpdateStatus = async (citaId: number, nuevoEstado: string) => {
        const labels: Record<string, string> = {
            CONFIRMADA: "confirmar",
            RECHAZADA: "rechazar",
            COMPLETADA: "marcar como completada",
        };
        const result = await Swal.fire({
            title: `¿Deseas ${labels[nuevoEstado] ?? nuevoEstado} esta cita?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí",
            cancelButtonText: "No",
        });
        if (!result.isConfirmed) return;
        try {
            await updateMutation.mutateAsync({ citaId, nuevoEstado });
            Swal.fire({ icon: "success", title: "Estado actualizado", timer: 1500, showConfirmButton: false });
        } catch {
            Swal.fire({ icon: "error", title: "Error", text: "No se pudo actualizar el estado." });
        }
    };

    const errorMsg = !empresaId
        ? "No se pudo identificar tu empresa. Completa tu perfil de empresa primero."
        : error?.message || "Error al cargar las citas. Intenta de nuevo.";

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 mb-2 flex items-center gap-3">
                        <Calendar className="text-teal-500" size={32} />
                        Gestión de Citas
                    </h1>
                    <p className="text-slate-500">Revisa y gestiona todas las citas solicitadas a tu empresa.</p>
                </div>
                {empresaId && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="h-10 px-5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold transition-colors flex items-center gap-2 shrink-0"
                    >
                        <Plus size={18} />
                        Nueva Cita
                    </button>
                )}
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-12 h-12 text-teal-500 animate-spin mb-4" />
                    <p className="text-slate-400">Cargando citas...</p>
                </div>
            ) : error || !empresaId ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-red-200">
                    <Info size={48} className="text-red-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-red-700">Error</h3>
                    <p className="text-sm text-red-500 mt-2 max-w-xs mx-auto">{errorMsg}</p>
                </div>
            ) : citas.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                    <Calendar size={48} className="text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-900">Sin citas por gestionar</h3>
                    <p className="text-sm text-slate-500 mt-2 max-w-xs mx-auto">
                        Cuando un cliente agende una cita con tus servicios, aparecerá aquí.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {citas.map((cita) => (
                        <div key={cita.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:border-teal-500/30 transition-all group">
                            <div className="p-5 flex flex-col md:flex-row md:items-center gap-5">
                                {/* Time Block */}
                                <div className="flex md:flex-col items-center justify-center bg-slate-50 rounded-xl px-4 py-3 md:w-28 shrink-0 gap-2 md:gap-0 md:text-center">
                                    <span className="text-lg font-black text-teal-600">
                                        {cita.horaInicio?.slice(0, 5) ?? "--:--"}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase md:mt-0.5">
                                        {cita.fechaProgramada
                                            ? new Date(cita.fechaProgramada + "T00:00:00").toLocaleDateString("es-EC", { day: "numeric", month: "short" })
                                            : "Sin fecha"}
                                    </span>
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <h3 className="font-bold text-lg text-slate-900 truncate group-hover:text-teal-600 transition-colors">
                                            {cita.mascotaNombre || "Sin mascota"}
                                        </h3>
                                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase ${STATUS_STYLES[cita.estado] ?? "bg-slate-100 text-slate-600"}`}>
                                            {cita.estado}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                                        <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                                            <Clock size={14} className="text-teal-500" />
                                            {cita.servicioNombre}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Info size={14} />
                                            Cliente: {cita.clienteNombre}
                                        </span>
                                    </div>
                                    {cita.notasCliente && (
                                        <p className="mt-2 text-xs italic text-slate-400 line-clamp-1">"{cita.notasCliente}"</p>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 md:flex-col lg:flex-row shrink-0">
                                    {cita.estado === "SOLICITADA" && (
                                        <>
                                            <button
                                                onClick={() => handleUpdateStatus(cita.id, "CONFIRMADA")}
                                                className="flex-1 lg:flex-none h-9 px-4 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                                            >
                                                <Check size={14} /> Confirmar
                                            </button>
                                            <button
                                                onClick={() => handleUpdateStatus(cita.id, "RECHAZADA")}
                                                className="flex-1 lg:flex-none h-9 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                                            >
                                                <X size={14} /> Rechazar
                                            </button>
                                        </>
                                    )}
                                    {cita.estado === "CONFIRMADA" && (
                                        <button
                                            onClick={() => handleUpdateStatus(cita.id, "COMPLETADA")}
                                            className="h-9 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                                        >
                                            <Check size={14} /> Completar
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <CrearCitaEmpresaModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => setIsModalOpen(false)}
            />
        </div>
    );
};
