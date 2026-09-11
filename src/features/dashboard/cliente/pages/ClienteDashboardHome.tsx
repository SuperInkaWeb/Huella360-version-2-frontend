import { useEffect, useState } from "react";
import { PawPrint, Calendar, Bell, ChevronRight, Plus, Star, Zap, AlertTriangle, Loader2 } from "lucide-react";
import { useAuth } from "../../../auth/context/useAuth";
import { petService } from "../services/petService";
import { appointmentService, type CitaResponse } from "../../shared/appointments/appointmentService";
import { recordatorioService } from "../services/recordatorioService";
import { subscriptionService } from "../../shared/subscriptions/services/subscriptionService";
import type { Pet } from "../types/pet.types";
import type { Recordatorio } from "../types/recordatorio.types";
import type { Suscripcion } from "../../shared/subscriptions/types/subscription.types";
import { Link } from "react-router-dom";

export const ClienteDashboardHome = () => {
  const { nombre } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [citas, setCitas] = useState<CitaResponse[]>([]);
  const [recordatorios, setRecordatorios] = useState<Recordatorio[]>([]);
  const [suscripcion, setSuscripcion] = useState<Suscripcion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [petsData, citasData, recordatoriosData, subData] = await Promise.all([
          petService.getMyPets(),
          appointmentService.getMyCitas(),
          recordatorioService.getMyRecordatorios(),
          subscriptionService.getMySubscription().catch(() => null),
        ]);
        setPets(petsData);
        setCitas(citasData);
        setRecordatorios(recordatoriosData);
        setSuscripcion(subData);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const upcomingCitas = citas
    .filter((c) => c.estado === "CONFIRMADA" || c.estado === "SOLICITADA")
    .sort((a, b) => new Date(a.fechaProgramada).getTime() - new Date(b.fechaProgramada).getTime())
    .slice(0, 5);

  const pendingRecordatorios = recordatorios
    .filter((r) => r.activo && !r.enviado)
    .sort((a, b) => new Date(a.fechaProgramada).getTime() - new Date(b.fechaProgramada).getTime())
    .slice(0, 5);

  const today = new Date().toISOString().split("T")[0];
  const recordatoriosHoy = pendingRecordatorios.filter((r) => r.fechaProgramada.split("T")[0] === today);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          ¡Hola de nuevo, {nombre || "Cliente"}!
        </h1>
        <p className="text-text-secondary mt-1">Resumen de tus mascotas y actividad.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <PawPrint size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">{pets.length}</p>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Mascotas</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">{upcomingCitas.length}</p>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Próximas Citas</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <Bell size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">{recordatoriosHoy.length}</p>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Recordatorios Hoy</p>
          </div>
        </div>
      </div>

      {suscripcion && (
        <Link
          to="/portal/cliente/suscripcion"
          className="block bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Zap size={20} />
              </div>
              <div>
                <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Plan Actual</p>
                <p className="text-sm font-bold text-text-primary">{suscripcion.plan.nombre}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${suscripcion.estado === "ACTIVA" ? "bg-emerald-500" : "bg-slate-300"}`} />
              <span className="text-xs font-medium text-text-secondary">{suscripcion.estado === "ACTIVA" ? "Activo" : suscripcion.estado}</span>
              <ChevronRight size={16} className="text-slate-300" />
            </div>
          </div>
          {suscripcion.plan.limiteMascotas > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-text-secondary">Mascotas</span>
                <span className={`font-semibold ${pets.length >= suscripcion.plan.limiteMascotas ? "text-amber-600" : "text-text-primary"}`}>
                  {pets.length} / {suscripcion.plan.limiteMascotas}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${pets.length >= suscripcion.plan.limiteMascotas ? "bg-amber-400" : "bg-primary"}`}
                  style={{ width: `${Math.min((pets.length / suscripcion.plan.limiteMascotas) * 100, 100)}%` }}
                />
              </div>
              {pets.length > suscripcion.plan.limiteMascotas && (
                <div className="flex items-center gap-1 mt-1.5 text-amber-600">
                  <AlertTriangle size={12} />
                  <span className="text-[11px]">Has superado el límite de tu plan</span>
                </div>
              )}
            </div>
          )}
        </Link>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-text-primary flex items-center gap-2">
              <Calendar size={16} className="text-primary" />
              Próximas Citas
            </h2>
            <Link to="/portal/cliente/citas" className="text-xs font-medium text-primary hover:underline flex items-center gap-0.5">
              Ver todas <ChevronRight size={14} />
            </Link>
          </div>
          {upcomingCitas.length === 0 ? (
            <div className="p-8 text-center text-sm text-text-secondary">
              <Calendar size={32} className="mx-auto mb-2 text-slate-300" />
              No tienes citas programadas.
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {upcomingCitas.map((cita) => (
                <div key={cita.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center text-primary shrink-0">
                    <Calendar size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{cita.mascotaNombre}</p>
                    <p className="text-xs text-text-secondary truncate">{cita.servicioNombre}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-semibold text-text-primary">
                      {new Date(cita.fechaProgramada).toLocaleDateString("es-PE", { day: "numeric", month: "short" })}
                    </p>
                    <p className="text-[10px] text-text-secondary">{cita.horaInicio.slice(0, 5)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-text-primary flex items-center gap-2">
              <Bell size={16} className="text-amber-500" />
              Recordatorios Pendientes
            </h2>
            <Link to="/portal/cliente/recordatorios" className="text-xs font-medium text-primary hover:underline flex items-center gap-0.5">
              Ver todos <ChevronRight size={14} />
            </Link>
          </div>
          {pendingRecordatorios.length === 0 ? (
            <div className="p-8 text-center text-sm text-text-secondary">
              <Bell size={32} className="mx-auto mb-2 text-slate-300" />
              No hay recordatorios pendientes.
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {pendingRecordatorios.map((r) => (
                <div key={r.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                    <Bell size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{r.titulo}</p>
                    <p className="text-xs text-text-secondary truncate">{r.mascotaNombre}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-semibold text-text-primary">
                      {new Date(r.fechaProgramada).toLocaleDateString("es-PE", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-text-primary">Acciones rápidas</h3>
          <p className="text-xs text-text-secondary mt-0.5">Gestiona tus mascotas y servicios.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Link
            to="/portal/cliente/mascotas"
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white rounded-full text-sm font-medium hover:shadow-md transition-all"
          >
            <Plus size={16} />
            Nueva Mascota
          </Link>
          <Link
            to="/portal/cliente/servicios"
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-full text-sm font-medium hover:bg-slate-50 transition-all"
          >
            <Star size={16} />
            Agendar Cita
          </Link>
        </div>
      </div>
    </div>
  );
};
