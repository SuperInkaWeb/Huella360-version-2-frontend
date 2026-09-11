import { useState, useEffect, useRef, useCallback } from "react";
import { Send, MessageCircle, Loader2 } from "lucide-react";
import { useAuth } from "../../../auth/context/useAuth";
import { chatService } from "./chatService";
import { useChatSocket } from "./useChatSocket";
import type { ChatMensaje } from "./types/chat.types";

interface ChatWindowProps {
    roomId: number;
}

export const ChatWindow = ({ roomId }: ChatWindowProps) => {
    const { userId } = useAuth();
    const [mensajes, setMensajes] = useState<ChatMensaje[]>([]);
    const [nuevoMensaje, setNuevoMensaje] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const mensajesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setLoading(true);
        chatService
            .getMensajes(roomId)
            .then(setMensajes)
            .catch((err) => console.error("Error loading chat messages:", err))
            .finally(() => setLoading(false));
        chatService.marcarComoLeido(roomId).catch(() => { });
    }, [roomId]);

    useEffect(() => {
        mensajesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [mensajes]);

    const handleNewMessage = useCallback((mensaje: ChatMensaje) => {
        setMensajes((prev) => (prev.some((m) => m.id === mensaje.id) ? prev : [...prev, mensaje]));
    }, []);

    useChatSocket(roomId, handleNewMessage);

    const handleSend = async () => {
        if (!nuevoMensaje.trim() || sending) return;
        setSending(true);
        try {
            const mensaje = await chatService.enviarMensaje(roomId, nuevoMensaje.trim());
            setMensajes((prev) => (prev.some((m) => m.id === mensaje.id) ? prev : [...prev, mensaje]));
            setNuevoMensaje("");
        } catch (error) {
            console.error("Error sending chat message:", error);
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="animate-spin text-primary" size={24} />
                    </div>
                ) : mensajes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <MessageCircle size={40} className="mb-3 opacity-50" />
                        <p className="text-sm">Inicia la conversación</p>
                    </div>
                ) : (
                    mensajes.map((mensaje) => {
                        const isMine = mensaje.remitenteId === userId;
                        return (
                            <div key={mensaje.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                                <div
                                    className={`max-w-[75%] px-4 py-2 rounded-2xl ${isMine
                                        ? "bg-primary text-white rounded-br-none"
                                        : "bg-slate-100 text-slate-800 rounded-bl-none"
                                        }`}
                                >
                                    <p className="text-sm whitespace-pre-wrap break-words">{mensaje.contenido}</p>
                                    <p className={`text-xs mt-1 ${isMine ? "text-white/70" : "text-slate-400"}`}>
                                        {new Date(mensaje.createdAt).toLocaleTimeString("es-PE", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={mensajesEndRef} />
            </div>

            <div className="p-3 border-t border-slate-100 shrink-0">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={nuevoMensaje}
                        onChange={(e) => setNuevoMensaje(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Escribe un mensaje..."
                        disabled={sending}
                        className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!nuevoMensaje.trim() || sending}
                        className="shrink-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};
