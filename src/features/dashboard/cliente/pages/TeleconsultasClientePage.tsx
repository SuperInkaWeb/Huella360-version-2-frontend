import { useState, useEffect } from "react";
import { MessageSquare, Video, Loader2, Clock, CheckCircle, Play, X as XIcon } from "lucide-react";
import { teleconsultaService } from "../../../teleconsulta/services/teleconsultaService";
import { ChatTeleconsulta } from "../../../teleconsulta/components/ChatTeleconsulta";
import type { Consulta } from "../../../teleconsulta/types/teleconsulta.types";

const ESTADO_ICONS: Record<string, React.ReactNode> = {
 PENDIENTE: <Clock size={14} className="text-yellow-500" />,
 ACEPTADA: <CheckCircle size={14} className="text-blue-500" />,
 EN_CURSO: <Play size={14} className="text-green-500" />,
 FINALIZADA: <CheckCircle size={14} className="text-slate-400" />,
 CANCELADA: <XIcon size={14} className="text-red-400" />,
};

export const TeleconsultasClientePage = () => {
 const [consultas, setConsultas] = useState<Consulta[]>([]);
 const [loading, setLoading] = useState(true);
 const [activeConsultaId, setActiveConsultaId] = useState<number | null>(null);
 const [activeConsulta, setActiveConsulta] = useState<Consulta | null>(null);

 useEffect(() => {
  loadConsultas();
 }, []);

 const loadConsultas = async () => {
  setLoading(true);
  try {
   const data = await teleconsultaService.getMyConsultas();
   setConsultas(data);
  } catch (error) {
   console.error("Error:", error);
  } finally {
   setLoading(false);
  }
 };

 const handleSelectConsulta = (consulta: Consulta) => {
  setActiveConsultaId(consulta.id);
  setActiveConsulta(consulta);
 };

 if (activeConsultaId && activeConsulta) {
  return (
   <div className="h-[calc(100vh-8rem)]">
    <ChatTeleconsulta
     consultaId={activeConsultaId}
     jitsiRoomId={activeConsulta.jitsiRoomId}
     consultaEstado={activeConsulta.estado}
     onClose={() => {
      setActiveConsultaId(null);
      setActiveConsulta(null);
      loadConsultas();
     }}
    />
   </div>
  );
 }

 return (
  <div className="space-y-6 animate-in fade-in duration-500">
   <div>
    <h1 className="text-2xl font-extrabold text-gray-900">Mis Teleconsultas</h1>
    <p className="text-sm text-slate-500 mt-1">Consulta con veterinarios de forma virtual.</p>
   </div>

   {loading ? (
    <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={40} /></div>
   ) : consultas.length === 0 ? (
    <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
     <MessageSquare size={48} className="mx-auto text-slate-300 mb-4" />
     <h3 className="text-lg font-bold text-slate-700">No tienes teleconsultas</h3>
     <p className="text-slate-400 mt-1">Inicia una consulta desde el perfil de un veterinario.</p>
    </div>
   ) : (
    <div className="space-y-3">
     {consultas.map((c) => (
      <button
       key={c.id}
       onClick={() => handleSelectConsulta(c)}
       className="w-full flex items-center justify-between bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-md hover:border-primary/20 transition-all text-left"
      >
       <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
         <MessageSquare className="text-primary" size={20} />
        </div>
        <div>
         <p className="font-semibold text-slate-800">Consulta con {c.veterinarioNombre}</p>
         {c.mascotaNombre && <p className="text-xs text-slate-400">Mascota: {c.mascotaNombre}</p>}
         <p className="text-xs text-slate-400 mt-1">{new Date(c.createdAt).toLocaleDateString("es-PE")}</p>
        </div>
       </div>
       <div className="flex items-center gap-3">
        <span className="flex items-center gap-1 text-xs font-medium">
         {ESTADO_ICONS[c.estado]} {c.estado.replace("_", " ")}
        </span>
        {c.jitsiRoomId && <Video size={16} className="text-slate-400" />}
       </div>
      </button>
     ))}
    </div>
   )}
  </div>
 );
};
