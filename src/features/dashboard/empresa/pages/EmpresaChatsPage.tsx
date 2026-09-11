import { useState, useEffect } from "react";
import { chatService } from "../../shared/chat/chatService";
import { ChatInbox } from "../../shared/chat/ChatInbox";
import type { ChatRoom } from "../../shared/chat/types/chat.types";

export const EmpresaChatsPage = () => {
    const [rooms, setRooms] = useState<ChatRoom[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        chatService
            .getMisChats()
            .then(setRooms)
            .catch((err) => console.error("Error loading empresa chats:", err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="h-full flex flex-col p-4 md:p-6">
            <div className="mb-4">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Chats</h1>
                <p className="text-sm text-slate-500">Conversaciones con tus clientes.</p>
            </div>
            <div className="flex-1 min-h-0">
                <ChatInbox
                    rooms={rooms}
                    loading={loading}
                    getDisplayName={(room) => room.clienteNombre}
                    emptyMessage="Todavía no tienes conversaciones con clientes."
                    fallbackIcon="user"
                />
            </div>
        </div>
    );
};
