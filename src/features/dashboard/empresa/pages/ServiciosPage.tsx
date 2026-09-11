import { useState, useMemo } from "react";
import {
    Plus,
    Search,
    Stethoscope,
    Edit2,
    Trash2,
    ArrowRight,
    Clock,
    MapPin,
    Monitor,
    Home,
    RefreshCw,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "../../../../components/ui/Button";
import { serviceService } from "../services/serviceService";
import { subscriptionService } from "../../shared/subscriptions/services/subscriptionService";
import type { Service, ModalidadServicio } from "../../../catalog/types/service.types";
import { ServiceFormModal } from "../components/ServiceFormModal";
import Swal from "sweetalert2";

/* ── Helpers ────────────────────────────────────────────────── */

const MODALIDAD_CONFIG: Record<ModalidadServicio, { label: string; icon: typeof MapPin; color: string }> = {
    PRESENCIAL: { label: "Presencial", icon: MapPin, color: "text-blue-600 bg-blue-50" },
    VIRTUAL: { label: "Virtual", icon: Monitor, color: "text-violet-600 bg-violet-50" },
    DOMICILIO: { label: "Domicilio", icon: Home, color: "text-amber-600 bg-amber-50" },
    HIBRIDO: { label: "Híbrido", icon: RefreshCw, color: "text-teal-600 bg-teal-50" },
};

const ModalidadBadge = ({ modalidad }: { modalidad: ModalidadServicio }) => {
    const config = MODALIDAD_CONFIG[modalidad];
    const Icon = config.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
            <Icon size={14} />
            {config.label}
        </span>
    );
};

/* ── Page Component ──────────────────────────────────────── */

export const ServiciosPage = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const queryClient = useQueryClient();

    const { data: services = [], isLoading, error } = useQuery({
        queryKey: ["empresa-servicios"],
        queryFn: async () => {
            const data = await serviceService.getMyServices(0, 50);
            return data.content;
        },
        staleTime: 2 * 60 * 1000,
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => serviceService.deleteService(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["empresa-servicios"] });
        },
    });

    /* ── Actions ───────────────────────────────────────────── */

    const handleOpenCreate = async () => {
        try {
            const freshUsage = await subscriptionService.getUsageMetrics();
            if (freshUsage.maxServices > 0 && freshUsage.currentServices >= freshUsage.maxServices) {
                Swal.fire({
                    title: "Límite de servicios alcanzado",
                    html: `
                        <div class="text-left space-y-3">
                            <p class="text-slate-600">Tu plan actual permite <strong>${freshUsage.maxServices} servicio${freshUsage.maxServices !== 1 ? 's' : ''}</strong> y ya tienes <strong>${freshUsage.currentServices}</strong> creados.</p>
                            <p class="text-slate-500 text-sm">Actualiza tu plan para agregar más servicios.</p>
                        </div>
                    `,
                    icon: "info",
                    showCancelButton: true,
                    confirmButtonText: "Ver planes",
                    cancelButtonText: "Cerrar",
                    confirmButtonColor: "#fe5c3c",
                    iconColor: "#3b82f6",
                }).then((result) => {
                    if (result.isConfirmed) window.location.href = "/empresa/suscripcion";
                });
                return;
            }
        } catch (e) {
            console.error("Error checking subscription limits:", e);
        }
        setEditingService(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (service: Service) => {
        setEditingService(service);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: "¿Desactivar servicio?",
            text: "El servicio se marcará como inactivo y dejará de ser visible.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#64748b",
            confirmButtonText: "Sí, desactivar",
            cancelButtonText: "Cancelar",
        });

        if (result.isConfirmed) {
            try {
                await deleteMutation.mutateAsync(id);
                Swal.fire("Desactivado", "El servicio ha sido desactivado.", "success");
            } catch {
                Swal.fire("Error", "No se pudo desactivar el servicio.", "error");
            }
        }
    };

    /* ── Filtering ─────────────────────────────────────────── */

    const filteredServices = useMemo(
        () =>
            services.filter((s) =>
                s.nombre.toLowerCase().includes(searchTerm.toLowerCase()),
            ),
        [services, searchTerm],
    );

    /* ── Render ────────────────────────────────────────────── */

    return (
        <div className="h-full flex flex-col p-4 md:p-6 gap-4 md:gap-6 overflow-hidden">
            {/* Header */}
            <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                        Catálogo de Servicios
                    </h1>
                    <p className="text-sm mt-1 text-slate-500">
                        Gestiona los servicios que ofrece tu clínica veterinaria.
                    </p>
                </div>
                <Button
                    onClick={handleOpenCreate}
                    className="group relative px-6 py-2.5 bg-primary hover:bg-primary/90 rounded-xl text-white font-medium transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                    <Plus size={20} className="transition-transform group-hover:rotate-90 duration-300" />
                    <span>Nuevo Servicio</span>
                </Button>
            </div>

            {/* Search */}
            <div className="shrink-0 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre del servicio..."
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none placeholder:text-slate-400 shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col min-h-0 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex-1 overflow-auto custom-scrollbar">
                    {/* Desktop Table */}
                    <div className="hidden md:block min-w-[700px]">
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
                                <tr>
                                    <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-slate-500">Servicio</th>
                                    <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-slate-500">Precio</th>
                                    <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-slate-500">Duración</th>
                                    <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-slate-500">Modalidad</th>
                                    <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-slate-500">Estado</th>
                                    <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-slate-500 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {isLoading
                                    ? Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={6} className="px-6 py-4 h-16 bg-slate-50/30" />
                                        </tr>
                                    ))
                                    : error
                                        ? (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-16 text-center">
                                                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                                                        <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                                            <span className="text-2xl">!</span>
                                                        </div>
                                                        <h3 className="text-lg font-semibold text-red-700 mb-1">Error al cargar</h3>
                                                        <p className="text-sm text-red-500 text-center mb-4">{error?.message || "Error desconocido"}</p>
                                                        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["empresa-servicios"] })} variant="outline" className="gap-2 rounded-lg">
                                                            Reintentar
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                        : filteredServices.length === 0
                                            ? (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-16 text-center">
                                                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                                                        <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                                            <Stethoscope size={32} className="text-slate-400" />
                                                        </div>
                                                        <h3 className="text-lg font-semibold text-slate-900 mb-1">No hay servicios</h3>
                                                        <p className="text-sm text-slate-500 text-center mb-4">
                                                            {searchTerm
                                                                ? "No encontramos coincidencias para tu búsqueda."
                                                                : "Comienza agregando tu primer servicio al catálogo."}
                                                        </p>
                                                        {!searchTerm && (
                                                            <Button onClick={handleOpenCreate} variant="outline" className="gap-2 rounded-lg">
                                                                Crear servicio <ArrowRight size={16} />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                        : filteredServices.map((service) => (
                                            <tr key={service.id} className="hover:bg-slate-50/80 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                                            <Stethoscope size={20} className="text-primary" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-semibold text-slate-900 truncate">{service.nombre}</p>
                                                            {service.descripcion && (
                                                                <p className="text-xs text-slate-500 truncate max-w-[240px]">{service.descripcion}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-semibold text-slate-900">
                                                        S/ {service.precio.toFixed(2)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                                        <Clock size={14} className="text-slate-400" />
                                                        {service.duracionMinutos} min
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <ModalidadBadge modalidad={service.modalidad} />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${service.activo
                                                                ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                                                                : "bg-slate-50 text-slate-700 ring-slate-600/20"
                                                            }`}
                                                    >
                                                        {service.activo ? "Activo" : "Inactivo"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            title="Editar"
                                                            onClick={() => handleOpenEdit(service)}
                                                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                        >
                                                            <Edit2 size={18} />
                                                        </button>
                                                        <button
                                                            title="Desactivar"
                                                            onClick={() => handleDelete(service.id)}
                                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden flex flex-col p-4 gap-4">
                        {isLoading
                            ? Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="bg-white p-4 rounded-2xl animate-pulse space-y-4 border border-slate-100">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 bg-slate-200 rounded-xl" />
                                        <div className="flex-1 space-y-3 py-1">
                                            <div className="h-4 bg-slate-200 rounded w-3/4" />
                                            <div className="h-3 bg-slate-200 rounded w-1/2" />
                                        </div>
                                    </div>
                                </div>
                            ))
                            : error
                                ? (
                                    <div className="py-12 px-6 rounded-2xl text-center bg-white border border-red-200">
                                        <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <span className="text-2xl">!</span>
                                        </div>
                                        <p className="text-red-700 font-semibold mb-2">Error al cargar</p>
                                        <p className="text-sm text-red-500 mb-4">{error?.message || "Error desconocido"}</p>
                                        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["empresa-servicios"] })} variant="outline" className="gap-2 rounded-lg">
                                            Reintentar
                                        </Button>
                                    </div>
                                )
                                : filteredServices.length === 0
                                    ? (
                                    <div className="py-12 px-6 rounded-2xl text-center">
                                        <Stethoscope size={40} className="mx-auto mb-3 text-slate-300" />
                                        <p className="text-slate-500 font-medium">No se encontraron servicios.</p>
                                    </div>
                                )
                                : filteredServices.map((service) => (
                                    <div key={service.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 space-y-3">
                                        {/* Top */}
                                        <div className="flex gap-3">
                                            <div className="w-11 h-11 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center">
                                                <Stethoscope size={20} className="text-primary" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-bold text-slate-900 truncate">{service.nombre}</h3>
                                                {service.descripcion && (
                                                    <p className="text-xs text-slate-500 truncate mt-0.5">{service.descripcion}</p>
                                                )}
                                                <div className="mt-1.5 flex items-center gap-3">
                                                    <span className="text-base font-bold text-primary">
                                                        S/ {service.precio.toFixed(2)}
                                                    </span>
                                                    <span className="text-xs text-slate-400 flex items-center gap-1">
                                                        <Clock size={12} /> {service.duracionMinutos} min
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Bottom */}
                                        <div className="flex items-center justify-between pt-3 border-t border-slate-200/60">
                                            <div className="flex items-center gap-2">
                                                <ModalidadBadge modalidad={service.modalidad} />
                                                <span
                                                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${service.activo
                                                            ? "bg-emerald-100 text-emerald-700"
                                                            : "bg-slate-100 text-slate-600"
                                                        }`}
                                                >
                                                    {service.activo ? "Activo" : "Inactivo"}
                                                </span>
                                            </div>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => handleOpenEdit(service)}
                                                    className="p-2 bg-white text-slate-500 rounded-lg active:scale-95 shadow-sm border border-slate-200 transition-all"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(service.id)}
                                                    className="p-2 bg-white text-red-600 rounded-lg active:scale-95 shadow-sm border border-slate-200 transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="shrink-0 px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 z-10">
                    <span className="text-sm font-medium text-slate-500">
                        Mostrando <span className="text-slate-900">{filteredServices.length}</span> servicios
                    </span>
                </div>
            </div>

            {/* Modal */}
            <ServiceFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => queryClient.invalidateQueries({ queryKey: ["empresa-servicios"] })}
                service={editingService}
            />
        </div>
    );
};
