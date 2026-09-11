import { useState, useEffect } from "react";
import { Inbox, Loader2, Mail, Phone, User, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "../../../../components/ui/Button";
import { leadService } from "../services/leadService";
import type { Lead } from "../types/lead.types";
import Swal from "sweetalert2";

const ESTADO_COLORS: Record<string, string> = {
 NUEVO: "bg-blue-100 text-blue-700",
 EN_CONTACTO: "bg-yellow-100 text-yellow-700",
 CONVERTIDO: "bg-green-100 text-green-700",
 PERDIDO: "bg-slate-100 text-slate-500",
};

export const LeadsPage = () => {
 const [leads, setLeads] = useState<Lead[]>([]);
 const [loading, setLoading] = useState(true);
 const [expandedId, setExpandedId] = useState<number | null>(null);

 useEffect(() => {
  loadLeads();
 }, []);

 const loadLeads = async () => {
  setLoading(true);
  try {
   const data = await leadService.getMyLeads();
   setLeads(data);
  } catch (error) {
   console.error("Error:", error);
  } finally {
   setLoading(false);
  }
 };

 const nextStatus: Record<string, string> = {
  NUEVO: "EN_CONTACTO",
  EN_CONTACTO: "CONVERTIDO",
 };

 const handleUpdateStatus = async (leadId: number, newStatus: string) => {
  try {
   await leadService.updateLeadStatus(leadId, newStatus);
   setLeads((prev) =>
    prev.map((l) => (l.id === leadId ? { ...l, estado: newStatus as Lead["estado"] } : l))
   );
   Swal.fire("Actualizado", `Lead marcado como ${newStatus.replace(/_/g, " ").toLowerCase()}`, "success");
  } catch (error) {
   Swal.fire("Error", "No se pudo actualizar el lead", "error");
  }
 };

 return (
  <div className="space-y-6 animate-in fade-in duration-500">
   <div>
    <h1 className="text-2xl font-extrabold text-gray-900">Mis Leads</h1>
    <p className="text-sm text-slate-500 mt-1">Prospectos de clientes interesados en tus servicios.</p>
   </div>

   {loading ? (
    <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={40} /></div>
   ) : leads.length === 0 ? (
    <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
     <Inbox size={48} className="mx-auto text-slate-300 mb-4" />
     <h3 className="text-lg font-bold text-slate-700">No hay leads aún</h3>
     <p className="text-slate-400 mt-1">Los clientes interesados aparecerán aquí.</p>
    </div>
   ) : (
    <div className="space-y-3">
     {leads.map((lead) => (
      <div key={lead.id} className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
       <button
        onClick={() => setExpandedId(expandedId === lead.id ? null : lead.id)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition-colors"
       >
        <div className="flex items-center gap-4">
         <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
          <User className="text-primary" size={20} />
         </div>
         <div>
          <p className="font-semibold text-slate-800">{lead.clienteNombre}</p>
          <p className="text-xs text-slate-400">{lead.servicioSolicitado || "Sin servicio especificado"}</p>
         </div>
        </div>
        <div className="flex items-center gap-3">
         <span className={`text-xs font-bold px-3 py-1 rounded-full ${ESTADO_COLORS[lead.estado] || "bg-slate-100"}`}>
          {lead.estado}
         </span>
         {expandedId === lead.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
       </button>

       {expandedId === lead.id && (
        <div className="px-5 pb-5 border-t border-slate-100 pt-4 space-y-3">
         <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          {lead.clienteEmail && (
           <div className="flex items-center gap-2 text-slate-600">
            <Mail size={14} className="text-slate-400" /> {lead.clienteEmail}
           </div>
          )}
          {lead.clienteTelefono && (
           <div className="flex items-center gap-2 text-slate-600">
            <Phone size={14} className="text-slate-400" /> {lead.clienteTelefono}
           </div>
          )}
          <div className="flex items-center gap-2 text-slate-600">
           <Clock size={14} className="text-slate-400" />
           {new Date(lead.createdAt).toLocaleDateString("es-PE")}
          </div>
         </div>
         {lead.mensaje && (
          <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl">{lead.mensaje}</p>
         )}
         <div className="flex gap-2 pt-2">
          {nextStatus[lead.estado] && (
           <Button onClick={() => handleUpdateStatus(lead.id, nextStatus[lead.estado])} className="text-sm px-3 py-1.5">
            Marcar como {nextStatus[lead.estado].replace(/_/g, " ").toLowerCase()}
           </Button>
          )}
          {lead.estado !== "PERDIDO" && (
           <Button variant="outline" onClick={() => handleUpdateStatus(lead.id, "PERDIDO")} className="text-sm px-3 py-1.5 text-red-600 border-red-200">
            Marcar como perdido
           </Button>
          )}
         </div>
        </div>
       )}
      </div>
     ))}
    </div>
   )}
  </div>
 );
};
