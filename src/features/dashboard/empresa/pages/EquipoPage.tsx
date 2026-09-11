import { useState, useEffect, useMemo } from "react";
import {
    Plus,
    Search,
    Users,
    Trash2,
    ArrowRight,
    Briefcase,
    Stethoscope,
} from "lucide-react";
import { Button } from "../../../../components/ui/Button";
import { staffService } from "../services/staffService";
import type { StaffMember } from "../types/staff.types";
import { InviteStaffModal } from "../components/InviteStaffModal";
import Swal from "sweetalert2";

/* ── Helpers ────────────────────────────────────────────────── */

const getInitials = (nombres: string, apellidos: string): string =>
    `${nombres.charAt(0)}${apellidos.charAt(0)}`.toUpperCase();

const AvatarFallback = ({ nombres, apellidos }: { nombres: string; apellidos: string }) => (
    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary to-primary-dark text-white font-bold text-sm">
        {getInitials(nombres, apellidos)}
    </div>
);

/* ── Page Component ──────────────────────────────────────── */

export const EquipoPage = () => {
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    /* ── Data Fetching ─────────────────────────────────────── */

    const fetchStaff = async () => {
        setIsLoading(true);
        try {
            const data = await staffService.getMyStaff();
            setStaff(data);
        } catch (error) {
            console.error("Error fetching staff:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    /* ── Actions ───────────────────────────────────────────── */

    const handleRemove = async (member: StaffMember) => {
        const result = await Swal.fire({
            title: "¿Remover del equipo?",
            text: `${member.nombres} ${member.apellidos} será removido del staff de tu empresa.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#64748b",
            confirmButtonText: "Sí, remover",
            cancelButtonText: "Cancelar",
        });

        if (result.isConfirmed) {
            try {
                await staffService.removeStaff(member.idVeterinario);
                setStaff((prev) => prev.filter((s) => s.idStaff !== member.idStaff));
                Swal.fire("Removido", "El veterinario ha sido removido del equipo.", "success");
            } catch {
                Swal.fire("Error", "No se pudo remover al veterinario.", "error");
            }
        }
    };

    /* ── Filtering ─────────────────────────────────────────── */

    const filteredStaff = useMemo(
        () =>
            staff.filter((m) => {
                const term = searchTerm.toLowerCase();
                const fullName = `${m.nombres} ${m.apellidos}`.toLowerCase();
                return (
                    fullName.includes(term) ||
                    m.especialidad?.toLowerCase().includes(term) ||
                    m.rolInterno.toLowerCase().includes(term)
                );
            }),
        [staff, searchTerm],
    );

    /* ── Render ────────────────────────────────────────────── */

    return (
        <div className="h-full flex flex-col p-4 md:p-6 gap-4 md:gap-6 overflow-hidden">
            {/* Header */}
            <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                        Equipo Veterinario
                    </h1>
                    <p className="text-sm mt-1 text-slate-500">
                        Gestiona los veterinarios asociados a tu empresa.
                    </p>
                </div>
                <Button
                    onClick={() => setIsModalOpen(true)}
                    className="group relative px-6 py-2.5 bg-primary hover:bg-primary/90 rounded-xl text-white font-medium transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                    <Plus size={20} className="transition-transform group-hover:rotate-90 duration-300" />
                    <span>Invitar Veterinario</span>
                </Button>
            </div>

            {/* Search */}
            <div className="shrink-0">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, especialidad o rol..."
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
                    <div className="hidden md:block min-w-[600px]">
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
                                <tr>
                                    <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-slate-500">Veterinario</th>
                                    <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-slate-500">Especialidad</th>
                                    <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-slate-500">Rol Interno</th>
                                    <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-slate-500">Estado</th>
                                    <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-slate-500 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {isLoading
                                    ? Array.from({ length: 4 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={5} className="px-6 py-4 h-16 bg-slate-50/30" />
                                        </tr>
                                    ))
                                    : filteredStaff.length === 0
                                        ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-16 text-center">
                                                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                                                        <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                                            <Users size={32} className="text-slate-400" />
                                                        </div>
                                                        <h3 className="text-lg font-semibold text-slate-900 mb-1">Sin miembros</h3>
                                                        <p className="text-sm text-slate-500 text-center mb-4">
                                                            {searchTerm
                                                                ? "No encontramos coincidencias para tu búsqueda."
                                                                : "Invita veterinarios para que se unan a tu equipo."}
                                                        </p>
                                                        {!searchTerm && (
                                                            <Button onClick={() => setIsModalOpen(true)} variant="outline" className="gap-2 rounded-lg">
                                                                Invitar veterinario <ArrowRight size={16} />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                        : filteredStaff.map((member) => (
                                            <tr key={member.idStaff} className="hover:bg-slate-50/80 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-10 w-10 rounded-full overflow-hidden shrink-0 ring-2 ring-slate-100">
                                                            {member.fotoPerfil ? (
                                                                <img src={member.fotoPerfil} alt={member.nombres} className="h-full w-full object-cover" />
                                                            ) : (
                                                                <AvatarFallback nombres={member.nombres} apellidos={member.apellidos} />
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-semibold text-slate-900 truncate">
                                                                {member.nombres} {member.apellidos}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {member.especialidad ? (
                                                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                                            <Stethoscope size={14} className="text-slate-400 shrink-0" />
                                                            <span className="truncate">{member.especialidad}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-slate-400 italic">Sin especificar</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                                                        <Briefcase size={12} />
                                                        {member.rolInterno}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${member.activo
                                                                ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                                                                : "bg-amber-50 text-amber-700 ring-amber-600/20"
                                                            }`}
                                                    >
                                                        {member.activo ? "Activo" : "Pendiente"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            title="Remover del equipo"
                                                            onClick={() => handleRemove(member)}
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
                                        <div className="w-12 h-12 bg-slate-200 rounded-full" />
                                        <div className="flex-1 space-y-3 py-1">
                                            <div className="h-4 bg-slate-200 rounded w-3/4" />
                                            <div className="h-3 bg-slate-200 rounded w-1/2" />
                                        </div>
                                    </div>
                                </div>
                            ))
                            : filteredStaff.length === 0
                                ? (
                                    <div className="py-12 px-6 rounded-2xl text-center">
                                        <Users size={40} className="mx-auto mb-3 text-slate-300" />
                                        <p className="text-slate-500 font-medium">No se encontraron miembros.</p>
                                    </div>
                                )
                                : filteredStaff.map((member) => (
                                    <div key={member.idStaff} className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 space-y-3">
                                        {/* Top */}
                                        <div className="flex gap-3 items-center">
                                            <div className="w-12 h-12 shrink-0 rounded-full overflow-hidden ring-2 ring-slate-200">
                                                {member.fotoPerfil ? (
                                                    <img src={member.fotoPerfil} alt={member.nombres} className="h-full w-full object-cover" />
                                                ) : (
                                                    <AvatarFallback nombres={member.nombres} apellidos={member.apellidos} />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-bold text-slate-900 truncate">
                                                    {member.nombres} {member.apellidos}
                                                </h3>
                                                {member.especialidad && (
                                                    <p className="text-xs text-slate-500 truncate mt-0.5 flex items-center gap-1">
                                                        <Stethoscope size={12} /> {member.especialidad}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Bottom */}
                                        <div className="flex items-center justify-between pt-3 border-t border-slate-200/60">
                                            <div className="flex items-center gap-2">
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700">
                                                    <Briefcase size={10} /> {member.rolInterno}
                                                </span>
                                                <span
                                                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${member.activo
                                                            ? "bg-emerald-100 text-emerald-700"
                                                            : "bg-amber-100 text-amber-700"
                                                        }`}
                                                >
                                                    {member.activo ? "Activo" : "Pendiente"}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => handleRemove(member)}
                                                className="p-2 bg-white text-red-600 rounded-lg active:scale-95 shadow-sm border border-slate-200 transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="shrink-0 px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 z-10">
                    <span className="text-sm font-medium text-slate-500">
                        Mostrando <span className="text-slate-900">{filteredStaff.length}</span> miembros del equipo
                    </span>
                </div>
            </div>

            {/* Modal */}
            <InviteStaffModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchStaff}
            />
        </div>
    );
};
