import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../../auth/context/useAuth";
import { teleconsultaService } from "../services/teleconsultaService";
import type { Consulta, ChatMensaje } from "../types/teleconsulta.types";
import { Button } from "../../../components/ui/Button";
import { Send, Video, X, MessageSquare, Play, CheckCircle, Ban } from "lucide-react";

interface ChatTeleconsultaProps {
  consultaId: number;
  jitsiRoomId?: string | null;
  consultaEstado?: Consulta["estado"];
  onClose: () => void;
  onEstadoChange?: (estado: Consulta["estado"]) => void;
}

export const ChatTeleconsulta = ({
  consultaId,
  jitsiRoomId,
  consultaEstado: initialEstado,
  onClose,
  onEstadoChange,
}: ChatTeleconsultaProps) => {
  const { userId, role } = useAuth();
  const [mensajes, setMensajes] = useState<ChatMensaje[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [estado, setEstado] = useState<Consulta["estado"]>(initialEstado || "PENDIENTE");
  const mensajesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const loadMensajes = useCallback(async () => {
    try {
      const data = await teleconsultaService.getMensajes(consultaId);
      setMensajes(data);
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setLoading(false);
    }
  }, [consultaId]);

  useEffect(() => {
    loadMensajes();
  }, [loadMensajes]);

  // Polling for new messages every 3s (until WebSocket is implemented)
  useEffect(() => {
    if (estado === "FINALIZADA" || estado === "CANCELADA") return;

    pollRef.current = setInterval(() => {
      loadMensajes();
    }, 3000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [estado, loadMensajes]);

  useEffect(() => {
    mensajesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  const handleSendMessage = async () => {
    if (!nuevoMensaje.trim() || sending) return;

    setSending(true);
    try {
      const mensaje = await teleconsultaService.sendMessage(consultaId, nuevoMensaje.trim());
      setMensajes((prev) => [...prev, mensaje]);
      setNuevoMensaje("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleStartVideoCall = () => {
    const roomId = jitsiRoomId || `vet360-consulta-${consultaId}`;
    const jitsiUrl = `https://meet.jit.si/${roomId}`;
    window.open(jitsiUrl, "_blank", "width=900,height=700");
  };

  const handleAccept = async () => {
    try {
      const updated = await teleconsultaService.acceptConsulta(consultaId);
      setEstado(updated.estado);
      onEstadoChange?.(updated.estado);
    } catch (error) {
      console.error("Error accepting consultation:", error);
    }
  };

  const handleStart = async () => {
    try {
      const updated = await teleconsultaService.startConsulta(consultaId);
      setEstado(updated.estado);
      onEstadoChange?.(updated.estado);
    } catch (error) {
      console.error("Error starting consultation:", error);
    }
  };

  const handleFinish = async () => {
    try {
      const updated = await teleconsultaService.finishConsulta(consultaId);
      setEstado(updated.estado);
      onEstadoChange?.(updated.estado);
    } catch (error) {
      console.error("Error finishing consultation:", error);
    }
  };

  const handleCancel = async () => {
    try {
      const updated = await teleconsultaService.cancelConsulta(consultaId);
      setEstado(updated.estado);
      onEstadoChange?.(updated.estado);
    } catch (error) {
      console.error("Error cancelling consultation:", error);
    }
  };

  const isVet = role === "VETERINARIO";
  const isActive = estado !== "FINALIZADA" && estado !== "CANCELADA";

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <MessageSquare className="text-primary" size={20} />
          <div>
            <h3 className="font-semibold text-slate-800">Consulta Virtual</h3>
            <span className="text-xs text-slate-500">Estado: {estado.replace("_", " ")}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isActive && (
            <Button variant="outline" onClick={handleStartVideoCall} className="flex items-center gap-2">
              <Video size={16} />
              Videollamada
            </Button>
          )}
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* State Controls */}
      {isActive && (
        <div className="flex items-center gap-2 p-3 border-b bg-slate-50">
          {isVet && estado === "PENDIENTE" && (
            <Button onClick={handleAccept} className="flex items-center gap-1 text-sm px-3 py-1.5">
              <CheckCircle size={14} /> Aceptar
            </Button>
          )}
          {isVet && estado === "ACEPTADA" && (
            <Button onClick={handleStart} className="flex items-center gap-1 text-sm px-3 py-1.5">
              <Play size={14} /> Iniciar
            </Button>
          )}
           {estado === "EN_CURSO" && (
            <Button variant="outline" onClick={handleFinish} className="flex items-center gap-1 text-sm px-3 py-1.5">
              <CheckCircle size={14} /> Finalizar
            </Button>
           )}
           <Button variant="outline" onClick={handleCancel} className="flex items-center gap-1 text-sm px-3 py-1.5 text-red-600 border-red-200 hover:bg-red-50">
             <Ban size={14} /> Cancelar
           </Button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : mensajes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <MessageSquare size={48} className="mb-4 opacity-50" />
            <p>Inicia la conversación</p>
          </div>
        ) : (
          mensajes.map((mensaje) => (
            <div
              key={mensaje.id}
              className={`flex ${
                mensaje.tipo === "SISTEMA"
                  ? "justify-center"
                  : mensaje.remitenteId === userId
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              {mensaje.tipo === "SISTEMA" ? (
                <div className="bg-slate-100 text-slate-600 text-sm px-4 py-2 rounded-full">
                  {mensaje.contenido}
                </div>
              ) : (
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    mensaje.remitenteId === userId
                      ? "bg-primary text-white rounded-br-none"
                      : "bg-slate-100 text-slate-800 rounded-bl-none"
                  }`}
                >
                  <p className="text-sm">{mensaje.contenido}</p>
                  <p
                    className={`text-xs mt-1 ${
                      mensaje.remitenteId === userId ? "text-white/70" : "text-slate-400"
                    }`}
                  >
                    {new Date(mensaje.createdAt).toLocaleTimeString("es-PE", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={mensajesEndRef} />
      </div>

      {/* Input */}
      {isActive && (
        <div className="p-4 border-t">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={nuevoMensaje}
              onChange={(e) => setNuevoMensaje(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe un mensaje..."
              className="flex-1 px-4 py-2 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50"
              disabled={sending}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!nuevoMensaje.trim() || sending}
              className="rounded-full p-2 h-auto"
            >
              <Send size={18} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
