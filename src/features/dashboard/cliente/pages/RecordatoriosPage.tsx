import { useState, useEffect } from "react";
import { Bell, Plus, Trash2, Loader2, Calendar, AlertTriangle } from "lucide-react";
import { Button } from "../../../../components/ui/Button";
import { useAuth } from "../../../auth/context/useAuth";
import { petService } from "../services/petService";
import { recordatorioService } from "../services/recordatorioService";
import { subscriptionService } from "../../shared/subscriptions/services/subscriptionService";
import type { Pet } from "../types/pet.types";
import type { Recordatorio } from "../types/recordatorio.types";
import type { Suscripcion } from "../../shared/subscriptions/types/subscription.types";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";

export const RecordatoriosPage = () => {
 const { nombre } = useAuth();
 const [recordatorios, setRecordatorios] = useState<Recordatorio[]>([]);
 const [pets, setPets] = useState<Pet[]>([]);
 const [suscripcion, setSuscripcion] = useState<Suscripcion | null>(null);
 const [loading, setLoading] = useState(true);
 const [showForm, setShowForm] = useState(false);
 const [form, setForm] = useState({
  mascotaId: "",
  tipo: "VACUNA",
  titulo: "",
  descripcion: "",
  fechaProgramada: "",
 });

 useEffect(() => {
  loadData();
 }, []);

 const loadData = async () => {
   setLoading(true);
   try {
    const [recs, myPets, subData] = await Promise.all([
     recordatorioService.getMyRecordatorios(),
     petService.getMyPets(),
     subscriptionService.getMySubscription().catch(() => null),
    ]);
    setRecordatorios(recs);
    setPets(myPets);
    setSuscripcion(subData);
   } catch (error) {
    console.error("Error:", error);
   } finally {
    setLoading(false);
   }
  };

 const sortedPets = [...pets].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
 const overLimitPetIds = new Set(
   suscripcion && suscripcion.plan.limiteMascotas > 0
     ? sortedPets.slice(suscripcion.plan.limiteMascotas).map((p) => p.id)
     : []
 );

 const handleCreate = async () => {
   if (!form.mascotaId || !form.titulo || !form.fechaProgramada) return;
   if (overLimitPetIds.has(Number(form.mascotaId))) {
     Swal.fire({
       title: "Límite alcanzado",
       text: "Esta mascota excede el límite de tu plan. Mejora tu suscripción para gestionar sus recordatorios.",
       icon: "warning",
       confirmButtonText: "Ver planes",
       showCancelButton: true,
       cancelButtonText: "Cancelar",
       customClass: { popup: "rounded-[2rem]" },
     }).then((r) => {
       if (r.isConfirmed) window.location.href = "/portal/cliente/suscripcion";
     });
     return;
   }
  try {
   await recordatorioService.createRecordatorio({
    mascotaId: Number(form.mascotaId),
    tipo: form.tipo,
    titulo: form.titulo,
    descripcion: form.descripcion || undefined,
    fechaProgramada: new Date(form.fechaProgramada).toISOString(),
   });
   setForm({ mascotaId: "", tipo: "VACUNA", titulo: "", descripcion: "", fechaProgramada: "" });
   setShowForm(false);
   loadData();
   Swal.fire("Creado", "Recordatorio creado exitosamente", "success");
  } catch (error) {
   Swal.fire("Error", "No se pudo crear el recordatorio", "error");
  }
 };

 const handleDelete = async (id: number) => {
  const result = await Swal.fire({
   title: "¿Eliminar recordatorio?",
   icon: "warning",
   showCancelButton: true,
   confirmButtonColor: "#ef4444",
   confirmButtonText: "Sí, eliminar",
  });
  if (result.isConfirmed) {
   await recordatorioService.deleteRecordatorio(id);
   loadData();
  }
 };

 return (
  <div className="space-y-6 animate-in fade-in duration-500">
   <div className="flex items-center justify-between">
    <div>
     <h1 className="text-2xl font-extrabold text-gray-900">Mis Recordatorios</h1>
     <p className="text-sm text-slate-500 mt-1">Gestiona las alertas de vacunas, controles y más para {nombre}.</p>
    </div>
    <Button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2">
     <Plus size={16} /> Nuevo Recordatorio
    </Button>
   </div>

   {overLimitPetIds.size > 0 && (
     <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
       <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
       <div>
         <p className="text-xs font-semibold text-amber-800">Límite de plan alcanzado</p>
         <p className="text-xs text-amber-700 mt-0.5">
           {overLimitPetIds.size} mascota{overLimitPetIds.size !== 1 ? "s" : ""} excede{overLimitPetIds.size === 1 ? "" : "n"} el límite de tu plan.
           Puedes gestionar recordatorios solo para las mascotas dentro de tu plan.{" "}
           <Link to="/portal/cliente/suscripcion" className="underline font-medium">Mejorar plan</Link>
         </p>
       </div>
     </div>
   )}

   {showForm && (
     <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
      <h3 className="font-semibold text-slate-800">Crear Recordatorio</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
       <select value={form.mascotaId} onChange={(e) => setForm({ ...form, mascotaId: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-xl text-sm">
        <option value="">Seleccionar mascota</option>
        {pets
          .filter((p) => !overLimitPetIds.has(p.id))
          .map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
       </select>
      <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-xl text-sm">
       <option value="VACUNA">Vacuna</option>
       <option value="DESPARASITACION">Desparasitación</option>
       <option value="CONTROL">Control</option>
       <option value="MEDICAMENTO">Medicamento</option>
       <option value="OTRO">Otro</option>
      </select>
      <input type="text" placeholder="Título" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-xl text-sm" />
      <input type="datetime-local" value={form.fechaProgramada} onChange={(e) => setForm({ ...form, fechaProgramada: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-xl text-sm" />
      <textarea placeholder="Descripción (opcional)" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} className="md:col-span-2 px-3 py-2 border border-slate-200 rounded-xl text-sm" rows={2} />
     </div>
     <div className="flex gap-2">
      <Button onClick={handleCreate}>Crear Recordatorio</Button>
      <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
     </div>
    </div>
   )}

   {loading ? (
    <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={40} /></div>
   ) : recordatorios.length === 0 ? (
    <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
     <Bell size={48} className="mx-auto text-slate-300 mb-4" />
     <h3 className="text-lg font-bold text-slate-700">No tienes recordatorios</h3>
     <p className="text-slate-400 mt-1">Crea uno para no olvidar vacunas, controles o medicamentos.</p>
    </div>
   ) : (
    <div className="space-y-3">
     {recordatorios.map((r) => (
      <div key={r.id} className="flex items-center justify-between bg-white border border-slate-100 rounded-2xl p-5">
       <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
         <Calendar className="text-primary" size={20} />
        </div>
        <div>
         <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{r.tipo}</span>
          <span className="text-xs text-slate-400">{r.mascotaNombre}</span>
          {r.enviado && <span className="text-xs text-green-600 font-semibold">Enviado</span>}
         </div>
         <p className="font-semibold text-slate-800 text-sm mt-1">{r.titulo}</p>
         {r.descripcion && <p className="text-slate-500 text-xs">{r.descripcion}</p>}
         <p className="text-slate-400 text-xs mt-1">
          {new Date(r.fechaProgramada).toLocaleDateString("es-PE", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
         </p>
        </div>
       </div>
       <button onClick={() => handleDelete(r.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
        <Trash2 size={16} />
       </button>
      </div>
     ))}
    </div>
   )}
  </div>
 );
};
