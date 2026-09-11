import {
  Shield,
  ShieldCheck,
  ShieldX,
  Mail,
  Check,
  X,
  Briefcase,
  Calendar,
  Package,
  AlertCircle,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useVetProfile } from "../hooks/useVetProfile";
import { vetService } from "../services/vetService";
import { api } from "../../../../shared/http/api";
import type { ApiResponse } from "../../../../shared/types/api";
import type { VerificationStatus } from "../types/vet.types";
import Swal from "sweetalert2";

const VERIFICATION_CONFIG: Record<VerificationStatus, { label: string; icon: typeof Shield; color: string }> = {
  PENDIENTE: { label: "Pendiente de verificación", icon: Shield, color: "text-amber-600 bg-amber-50" },
  VEREFICADO: { label: "Verificado", icon: ShieldCheck, color: "text-emerald-600 bg-emerald-50" },
  RECHAZADO: { label: "Rechazado", icon: ShieldX, color: "text-red-600 bg-red-50" },
};

const CITA_ESTADO_COLORS: Record<string, string> = {
  SOLICITADA: "bg-blue-100 text-blue-700",
  CONFIRMADA: "bg-emerald-100 text-emerald-700",
  COMPLETADA: "bg-slate-100 text-slate-700",
  RECHAZADA: "bg-red-100 text-red-700",
  CANCELADA: "bg-red-100 text-red-700",
  NOSHOW: "bg-orange-100 text-orange-700",
};

interface Cita {
  idCita: number;
  clienteNombre: string;
  mascotaNombre: string;
  servicioNombre: string;
  fechaProgramada: string;
  horaInicio: string;
  estado: string;
}

export const VetHomePage = () => {
  const { data: profile, isLoading: isLoadingProfile } = useVetProfile();
  const queryClient = useQueryClient();

  const { data: invitations = [] } = useQuery({
    queryKey: ["vet-invitations"],
    queryFn: () => vetService.getMyInvitations(),
    staleTime: 2 * 60 * 1000,
  });

  const { data: services = [] } = useQuery({
    queryKey: ["vet-services"],
    queryFn: async () => {
      const data = await vetService.getMyServices(0, 50);
      return data.content;
    },
    staleTime: 2 * 60 * 1000,
    enabled: !!profile?.idVeterinario,
  });

  const { data: citas = [] } = useQuery({
    queryKey: ["vet-citas", profile?.idVeterinario],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Cita[]>>(`/appointments/veterinario/${profile!.idVeterinario}`);
      return data.data || [];
    },
    enabled: !!profile?.idVeterinario,
    staleTime: 1 * 60 * 1000,
  });

  const today = new Date().toISOString().split("T")[0];
  const citasHoy = citas.filter(c => c.fechaProgramada === today);
  const citasPendientes = citas.filter(c => c.estado === "SOLICITADA");
  const serviciosActivos = services.filter(s => s.activo);

  const acceptMutation = useMutation({
    mutationFn: (staffId: number) => vetService.acceptInvitation(staffId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vet-invitations"] }),
  });

  const rejectMutation = useMutation({
    mutationFn: (staffId: number) => vetService.rejectInvitation(staffId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vet-invitations"] }),
  });

  const handleAccept = async (staffId: number) => {
    try {
      await acceptMutation.mutateAsync(staffId);
      Swal.fire("¡Aceptada!", "Ahora eres parte del equipo.", "success");
    } catch (error: any) {
      Swal.fire("Error", error.response?.data?.message || "No se pudo aceptar.", "error");
    }
  };

  const handleReject = async (staffId: number) => {
    const result = await Swal.fire({
      title: "¿Rechazar invitación?",
      text: "No podrás unirte al equipo a menos que te vuelvan a invitar.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Sí, rechazar",
      cancelButtonText: "Cancelar",
    });
    if (result.isConfirmed) {
      try {
        await rejectMutation.mutateAsync(staffId);
        Swal.fire("Rechazada", "La invitación ha sido rechazada.", "info");
      } catch {
        Swal.fire("Error", "No se pudo rechazar la invitación.", "error");
      }
    }
  };

  const verif = profile ? VERIFICATION_CONFIG[profile.estadoValidacion] : null;
  const VerifIcon = verif?.icon;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-teal-500 via-teal-600 to-emerald-600 relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjAgMjBMMjAgMCIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48cGF0aCBkPSJNMCAyMEw0MCAyMCIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3N2Zz4=')] opacity-50" />
        </div>
        <div className="px-5 md:px-8 pb-6 -mt-12 relative">
          {isLoadingProfile ? (
            <div className="animate-pulse flex items-end gap-5">
              <div className="w-24 h-24 rounded-2xl bg-slate-200 ring-4 ring-white" />
              <div className="space-y-3 pb-1 flex-1">
                <div className="h-5 bg-slate-200 rounded w-48" />
                <div className="h-4 bg-slate-200 rounded w-32" />
              </div>
            </div>
          ) : profile ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-5">
                <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-white shadow-lg shrink-0 bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
                  {profile.fotoPerfilUrl ? (
                    <img src={profile.fotoPerfilUrl} alt={profile.nombres} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-white">
                      {profile.nombres.charAt(0)}{profile.apellidos.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl md:text-2xl font-bold text-slate-900 truncate">
                    Dr. {profile.nombres} {profile.apellidos}
                  </h1>
                  <p className="text-sm text-slate-500 mt-0.5">{profile.email}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {verif && VerifIcon && (
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${verif.color}`}>
                        <VerifIcon size={14} /> {verif.label}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard icon={Calendar} label="Citas Hoy" value={String(citasHoy.length)} color="text-teal-500" />
                <StatCard icon={AlertCircle} label="Pendientes" value={String(citasPendientes.length)} color="text-amber-500" />
                <StatCard icon={Package} label="Servicios" value={String(serviciosActivos.length)} color="text-indigo-500" />
                <StatCard icon={Mail} label="Invitaciones" value={`${invitations.length}`} color="text-amber-500" />
              </div>
            </>
          ) : (
            <p className="text-slate-500 pt-14">No se pudo cargar el perfil.</p>
          )}
        </div>
      </div>

      {/* Today's Appointments */}
      {citasHoy.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
            <Calendar size={20} className="text-teal-500" />
            Citas de Hoy
          </h2>
          <div className="space-y-3">
            {citasHoy.map((cita) => (
              <div key={cita.idCita} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-center shrink-0 w-14">
                  <p className="text-sm font-bold text-teal-600">{cita.horaInicio?.slice(0, 5)}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{cita.mascotaNombre || "Sin mascota"}</p>
                  <p className="text-xs text-slate-500">{cita.servicioNombre} — {cita.clienteNombre}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${CITA_ESTADO_COLORS[cita.estado] || "bg-slate-100 text-slate-500"}`}>
                  {cita.estado}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invitations Section */}
      {invitations.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
            <Mail size={20} className="text-teal-500" />
            Invitaciones Pendientes
          </h2>
          <div className="space-y-3">
            {invitations.map((inv) => (
              <div key={inv.idStaff} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {inv.empresaNombre ? inv.empresaNombre.charAt(0) : "E"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{inv.empresaNombre || "Empresa"}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Briefcase size={12} /> Rol: {inv.rolInterno}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleAccept(inv.idStaff)} className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium transition-colors">
                    <Check size={16} /> Aceptar
                  </button>
                  <button onClick={() => handleReject(inv.idStaff)} className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-medium transition-colors">
                    <X size={16} /> Rechazar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color = "text-teal-500" }: { icon: any; label: string; value: string; color?: string }) => (
  <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-teal-500/20 transition-all">
    <div className={`p-2 rounded-lg bg-white shadow-sm ${color}`}>
      <Icon size={18} />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="text-sm font-bold text-slate-900 truncate">{value}</p>
    </div>
  </div>
);
