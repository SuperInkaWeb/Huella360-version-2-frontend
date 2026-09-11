import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
 ArrowLeft, PawPrint, FileText, Download, Bell, Sparkles, Lock,
 Calendar, Weight, Stethoscope, AlertTriangle, Info, CheckCircle, Loader2, Plus, Trash2
} from "lucide-react";
import { Button } from "../../../../components/ui/Button";
import { petService } from "../services/petService";
import { recordatorioService } from "../services/recordatorioService";
import { iaAlertsService } from "../../../ia-alerts/services/iaAlertsService";
import { healthCardService } from "../../../health-card/services/healthCardService";
import { subscriptionService } from "../../shared/subscriptions/services/subscriptionService";
import { api } from "../../../../shared/http/api";
import type { Pet } from "../types/pet.types";
import type { Recordatorio } from "../types/recordatorio.types";
import type { HealthAlert } from "../../../ia-alerts/types/ia-alerts.types";
import type { HistoriaClinica } from "../../veterinario/types/medicalRecord.types";
import type { Suscripcion } from "../../shared/subscriptions/types/subscription.types";
import Swal from "sweetalert2";

type Tab = "info" | "historial" | "alertas" | "recordatorios";

export const MascotaDetailPage = () => {
 const { id } = useParams<{ id: string }>();
 const navigate = useNavigate();
 const [pet, setPet] = useState<Pet | null>(null);
 const [activeTab, setActiveTab] = useState<Tab>("info");
 const [loading, setLoading] = useState(true);

 // Medical history
 const [historial, setHistorial] = useState<HistoriaClinica[]>([]);
 const [loadingHistorial, setLoadingHistorial] = useState(false);

 // AI alerts
 const [alertas, setAlertas] = useState<HealthAlert[]>([]);
 const [loadingAlertas, setLoadingAlertas] = useState(false);
 const [alertasGenerated, setAlertasGenerated] = useState(false);

 // Reminders
 const [recordatorios, setRecordatorios] = useState<Recordatorio[]>([]);
 const [loadingRecordatorios, setLoadingRecordatorios] = useState(false);
 const [showRecordatorioForm, setShowRecordatorioForm] = useState(false);
 const [nuevoRecordatorio, setNuevoRecordatorio] = useState({
  tipo: "VACUNA",
  titulo: "",
  descripcion: "",
  fechaProgramada: "",
 });

  // Subscription & limit check
  const [suscripcion, setSuscripcion] = useState<Suscripcion | null>(null);
  const [allPets, setAllPets] = useState<Pet[]>([]);

  // Health card
  const [downloadingCard, setDownloadingCard] = useState(false);

  useEffect(() => {
   if (id) {
    loadPet(Number(id));
   }
  }, [id]);

 useEffect(() => {
  if (activeTab === "historial" && id) loadHistorial(Number(id));
  if (activeTab === "recordatorios" && id) loadRecordatorios();
 }, [activeTab, id]);

  const loadPet = async (petId: number) => {
   setLoading(true);
   try {
    const [data, subData, petsData] = await Promise.all([
     petService.getPetById(petId),
     subscriptionService.getMySubscription().catch(() => null),
     petService.getMyPets(),
    ]);
    setPet(data);
    setSuscripcion(subData);
    setAllPets(petsData);
   } catch (error) {
    console.error("Error loading pet:", error);
    Swal.fire("Error", "No se pudo cargar la información de la mascota", "error");
   } finally {
    setLoading(false);
   }
  };

 const loadHistorial = async (petId: number) => {
  setLoadingHistorial(true);
  try {
   const { data } = await api.get(`/medical-records/pet/${petId}`);
   setHistorial(data.data);
  } catch (error) {
   console.error("Error loading medical history:", error);
  } finally {
   setLoadingHistorial(false);
  }
 };

 const loadRecordatorios = async () => {
  setLoadingRecordatorios(true);
  try {
   const all = await recordatorioService.getMyRecordatorios();
   setRecordatorios(all.filter((r) => r.mascotaId === Number(id)));
  } catch (error) {
   console.error("Error loading reminders:", error);
  } finally {
   setLoadingRecordatorios(false);
  }
 };

 const handleGenerateAlerts = async () => {
  if (!id) return;
  setLoadingAlertas(true);
  try {
   const response = await iaAlertsService.generateHealthAlerts(Number(id));
   setAlertas(response.alertas);
   setAlertasGenerated(true);
  } catch (error) {
   console.error("Error:", error);
  } finally {
   setLoadingAlertas(false);
  }
 };

  const sortedPets = [...allPets].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const petIndex = sortedPets.findIndex((p) => p.id === Number(id));
  const isPetOverLimit = !!(
    suscripcion &&
    suscripcion.plan.limiteMascotas > 0 &&
    petIndex >= suscripcion.plan.limiteMascotas
  );

  const handleDownloadCard = async () => {
  if (!id) return;
  setDownloadingCard(true);
  try {
   await healthCardService.downloadHealthCard(Number(id));
  } catch (error) {
   console.error("Error:", error);
  } finally {
   setDownloadingCard(false);
  }
 };

 const handleCreateRecordatorio = async () => {
  if (!id || !nuevoRecordatorio.titulo || !nuevoRecordatorio.fechaProgramada) return;
  try {
   await recordatorioService.createRecordatorio({
    mascotaId: Number(id),
    ...nuevoRecordatorio,
    fechaProgramada: new Date(nuevoRecordatorio.fechaProgramada).toISOString(),
   });
   setNuevoRecordatorio({ tipo: "VACUNA", titulo: "", descripcion: "", fechaProgramada: "" });
   setShowRecordatorioForm(false);
   loadRecordatorios();
   Swal.fire("Creado", "Recordatorio creado exitosamente", "success");
  } catch (error) {
   console.error("Error:", error);
  }
 };

 const handleDeleteRecordatorio = async (recordatorioId: number) => {
  const result = await Swal.fire({
   title: "¿Eliminar recordatorio?",
   icon: "warning",
   showCancelButton: true,
   confirmButtonColor: "#ef4444",
   confirmButtonText: "Sí, eliminar",
   cancelButtonText: "Cancelar",
  });
  if (result.isConfirmed) {
   try {
    await recordatorioService.deleteRecordatorio(recordatorioId);
    loadRecordatorios();
   } catch (error) {
    console.error("Error:", error);
   }
  }
 };

 if (loading) {
  return (
   <div className="flex items-center justify-center h-96">
    <Loader2 className="animate-spin text-primary" size={40} />
   </div>
  );
 }

 if (!pet) {
  return (
   <div className="text-center py-20">
    <PawPrint size={48} className="mx-auto text-slate-300 mb-4" />
    <p className="text-slate-500">Mascota no encontrada</p>
    <Button onClick={() => navigate("/portal/cliente/mascotas")} className="mt-4">
     Volver a mis mascotas
    </Button>
   </div>
  );
 }

 const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "info", label: "Información", icon: <PawPrint size={16} /> },
  { key: "historial", label: "Historial Clínico", icon: <FileText size={16} /> },
  { key: "alertas", label: "Alertas IA", icon: <Sparkles size={16} /> },
  { key: "recordatorios", label: "Recordatorios", icon: <Bell size={16} /> },
 ];

 return (
  <div className="space-y-6 animate-in fade-in duration-500">
   {/* Header */}
   <div className="flex items-center gap-4">
    <button onClick={() => navigate("/portal/cliente/mascotas")} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
     <ArrowLeft size={20} className="text-slate-600" />
    </button>
    <div className="flex-1">
     <h1 className="text-2xl font-extrabold text-gray-900">{pet.nombre}</h1>
     <p className="text-sm text-slate-500">{pet.especie} {pet.raza ? `- ${pet.raza}` : ""}</p>
    </div>
    <Button variant="outline" onClick={handleDownloadCard} disabled={downloadingCard} className="flex items-center gap-2">
     {downloadingCard ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
     Carnet de Salud
    </Button>
   </div>

   {/* Tabs */}
   <div className="flex gap-1 border-b border-slate-200">
    {tabs.map((tab) => (
     <button
      key={tab.key}
      onClick={() => setActiveTab(tab.key)}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
       activeTab === tab.key
        ? "border-primary text-primary"
        : "border-transparent text-slate-500 hover:text-slate-700"
      }`}
     >
      {tab.icon}
      {tab.label}
     </button>
    ))}
   </div>

   {/* Tab Content */}
   <div className="bg-white rounded-2xl border border-slate-100 p-6">
    {/* INFO TAB */}
    {activeTab === "info" && (
     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <InfoField icon={<PawPrint size={18} />} label="Nombre" value={pet.nombre} />
      <InfoField icon={<Stethoscope size={18} />} label="Especie" value={pet.especie} />
      <InfoField icon={<PawPrint size={18} />} label="Raza" value={pet.raza || "No especificada"} />
      <InfoField icon={<Calendar size={18} />} label="Sexo" value={pet.sexo || "No especificado"} />
      <InfoField icon={<Weight size={18} />} label="Peso" value={pet.pesoKg ? `${pet.pesoKg} kg` : "No registrado"} />
      <InfoField icon={<Calendar size={18} />} label="Fecha de Nacimiento" value={pet.fechaNacimiento || "No especificada"} />
      <InfoField icon={<CheckCircle size={18} />} label="Esterilizado" value={pet.esterilizado ? "Sí" : "No"} />
      <InfoField icon={<FileText size={18} />} label="Observaciones" value={pet.observacionesMedicas || "Ninguna"} />
     </div>
    )}

    {/* HISTORIAL TAB */}
    {activeTab === "historial" && (
     <div>
      {loadingHistorial ? (
       <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" size={32} /></div>
      ) : historial.length === 0 ? (
       <div className="text-center py-10 text-slate-400">
        <FileText size={40} className="mx-auto mb-3 opacity-50" />
        <p>No hay registros clínicos aún</p>
       </div>
      ) : (
       <div className="space-y-4">
        {historial.map((h) => (
         <div key={h.id} className="border border-slate-100 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
           <span className="text-xs font-semibold text-slate-400">
            {new Date(h.fechaRegistro).toLocaleDateString("es-PE")}
           </span>
           {h.nombreVeterinario && (
            <span className="text-xs text-primary font-medium">Dr. {h.nombreVeterinario}</span>
           )}
          </div>
          <p className="font-semibold text-slate-800 text-sm">{h.diagnostico}</p>
          <p className="text-slate-600 text-sm mt-1">{h.tratamiento}</p>
          {h.notas && <p className="text-slate-400 text-xs mt-2">{h.notas}</p>}
          {h.pesoKg && <span className="text-xs text-slate-400 mt-1 inline-block">Peso: {h.pesoKg} kg</span>}
         </div>
        ))}
       </div>
      )}
     </div>
    )}

    {/* ALERTAS IA TAB */}
    {activeTab === "alertas" && (
     <div>
      {isPetOverLimit ? (
        <div className="text-center py-10">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock size={28} className="text-slate-300" />
          </div>
          <p className="font-semibold text-slate-600 mb-1">No disponible para esta mascota</p>
          <p className="text-sm text-slate-400 mb-4">
            Esta mascota excede el límite de tu plan.{' '}
            <Link to="/portal/cliente/suscripcion" className="text-primary underline">Mejorar plan</Link>
          </p>
        </div>
      ) : !alertasGenerated ? (
       <div className="text-center py-10">
        <Sparkles size={40} className="mx-auto mb-4 text-purple-400" />
        <p className="text-slate-600 mb-4">La IA analizará el historial médico y generará alertas preventivas</p>
        <Button onClick={handleGenerateAlerts} disabled={loadingAlertas} className="flex items-center gap-2 mx-auto">
         {loadingAlertas ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
         Generar Alertas IA
        </Button>
       </div>
      ) : alertas.length === 0 ? (
       <p className="text-center py-10 text-slate-400">No se encontraron alertas</p>
      ) : (
       <div className="space-y-3">
        {alertas.map((a, i) => (
         <div key={i} className={`p-4 rounded-xl border ${
          a.severidad === "ALTA" ? "border-red-200 bg-red-50" :
          a.severidad === "MEDIA" ? "border-yellow-200 bg-yellow-50" :
          "border-green-200 bg-green-50"
         }`}>
          <div className="flex items-start gap-3">
           {a.severidad === "ALTA" ? <AlertTriangle className="text-red-500 shrink-0" size={20} /> :
            a.severidad === "MEDIA" ? <Info className="text-yellow-500 shrink-0" size={20} /> :
            <CheckCircle className="text-green-500 shrink-0" size={20} />}
           <div>
            <h4 className="font-semibold text-slate-800">{a.titulo}</h4>
            <p className="text-sm text-slate-600 mt-1">{a.descripcion}</p>
            <p className="text-sm text-primary mt-2 font-medium">Recomendación: {a.recomendacion}</p>
           </div>
          </div>
         </div>
        ))}
        <Button variant="outline" onClick={handleGenerateAlerts} disabled={loadingAlertas} className="w-full mt-4">
         Regenerar Alertas
        </Button>
       </div>
      )}
     </div>
    )}

    {/* RECORDATORIOS TAB */}
    {activeTab === "recordatorios" && (
     <div>
       <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-800">Recordatorios de {pet.nombre}</h3>
        {isPetOverLimit ? (
          <span className="inline-flex items-center gap-1 text-xs text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg">
            <Lock size={12} /> No disponible
          </span>
        ) : (
          <Button onClick={() => setShowRecordatorioForm(!showRecordatorioForm)} className="flex items-center gap-1 text-sm px-3 py-1.5">
            <Plus size={14} /> Nuevo
          </Button>
        )}
       </div>

       {isPetOverLimit && (
         <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 flex items-start gap-2">
           <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
           <div>
             <p className="text-xs font-semibold text-amber-800">Fuera de tu plan</p>
             <p className="text-xs text-amber-700 mt-0.5">
               Esta mascota excede el límite de {suscripcion?.plan.nombre}.{" "}
               <Link to="/portal/cliente/suscripcion" className="underline font-medium">Mejorar plan</Link>
             </p>
           </div>
         </div>
       )}

      {showRecordatorioForm && (
       <div className="border border-slate-200 rounded-xl p-4 mb-4 space-y-3 bg-slate-50">
        <select
         value={nuevoRecordatorio.tipo}
         onChange={(e) => setNuevoRecordatorio({ ...nuevoRecordatorio, tipo: e.target.value })}
         className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
        >
         <option value="VACUNA">Vacuna</option>
         <option value="DESPARASITACION">Desparasitación</option>
         <option value="CONTROL">Control</option>
         <option value="MEDICAMENTO">Medicamento</option>
         <option value="OTRO">Otro</option>
        </select>
        <input
         type="text"
         placeholder="Título"
         value={nuevoRecordatorio.titulo}
         onChange={(e) => setNuevoRecordatorio({ ...nuevoRecordatorio, titulo: e.target.value })}
         className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
        />
        <textarea
         placeholder="Descripción (opcional)"
         value={nuevoRecordatorio.descripcion}
         onChange={(e) => setNuevoRecordatorio({ ...nuevoRecordatorio, descripcion: e.target.value })}
         className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
         rows={2}
        />
        <input
         type="datetime-local"
         value={nuevoRecordatorio.fechaProgramada}
         onChange={(e) => setNuevoRecordatorio({ ...nuevoRecordatorio, fechaProgramada: e.target.value })}
         className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
        />
        <div className="flex gap-2">
          <Button onClick={handleCreateRecordatorio} className="text-sm px-3 py-1.5">Crear</Button>
          <Button variant="outline" onClick={() => setShowRecordatorioForm(false)} className="text-sm px-3 py-1.5">Cancelar</Button>
        </div>
       </div>
      )}

      {loadingRecordatorios ? (
       <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" size={32} /></div>
      ) : recordatorios.length === 0 ? (
       <div className="text-center py-10 text-slate-400">
        <Bell size={40} className="mx-auto mb-3 opacity-50" />
        <p>No hay recordatorios programados</p>
       </div>
      ) : (
       <div className="space-y-3">
        {recordatorios.map((r) => (
         <div key={r.id} className="flex items-center justify-between border border-slate-100 rounded-xl p-4">
          <div>
           <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{r.tipo}</span>
            {r.enviado && <span className="text-xs text-green-600 font-medium">Enviado</span>}
           </div>
           <p className="font-semibold text-slate-800 text-sm mt-1">{r.titulo}</p>
           {r.descripcion && <p className="text-slate-500 text-xs">{r.descripcion}</p>}
           <p className="text-slate-400 text-xs mt-1">
            {new Date(r.fechaProgramada).toLocaleDateString("es-PE", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
           </p>
          </div>
          <button onClick={() => handleDeleteRecordatorio(r.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
           <Trash2 size={16} />
          </button>
         </div>
        ))}
       </div>
      )}
     </div>
    )}
   </div>
  </div>
 );
};

const InfoField = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
 <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
  <div className="text-slate-400 mt-0.5">{icon}</div>
  <div>
   <p className="text-xs font-semibold text-slate-400 uppercase">{label}</p>
   <p className="text-sm font-medium text-slate-800">{value}</p>
  </div>
 </div>
);
