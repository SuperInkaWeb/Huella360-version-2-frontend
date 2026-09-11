import { useState } from "react";
import { MessageCircle, Loader2, Store, User } from "lucide-react";
import { ChatWindow } from "./ChatWindow";
import type { ChatRoom } from "./types/chat.types";

interface ChatInboxProps {
    rooms: ChatRoom[];
    loading: boolean;
    getDisplayName: (room: ChatRoom) => string;
    getAvatarUrl?: (room: ChatRoom) => string | undefined;
    emptyMessage: string;
    fallbackIcon?: "store" | "user";
}

export const ChatInbox = ({ rooms, loading, getDisplayName, getAvatarUrl, emptyMessage, fallbackIcon = "store" }: ChatInboxProps) => {
    const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);

    const FallbackIcon = fallbackIcon === "user" ? User : Store;

    return (
        <div className="flex h-full min-h-0 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* List */}
            <div className={`w-full sm:w-80 border-r border-slate-100 flex flex-col ${selectedRoomId ? "hidden sm:flex" : "flex"}`}>
                <div className="p-4 border-b border-slate-100 shrink-0">
                    <h2 className="font-bold text-slate-900 flex items-center gap-2">
                        <MessageCircle size={18} className="text-primary" />
                        Chats
                    </h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="animate-spin text-primary" size={20} />
                        </div>
                    ) : rooms.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 px-4 text-center text-slate-400">
                            <MessageCircle size={32} className="mb-2 opacity-50" />
                            <p className="text-sm">{emptyMessage}</p>
                        </div>
                    ) : (
                        rooms.map((room) => {
                            const avatarUrl = getAvatarUrl?.(room);
                            return (
                                <button
                                    key={room.id}
                                    onClick={() => setSelectedRoomId(room.id)}
                                    className={`w-full flex items-center gap-3 p-4 text-left border-b border-slate-50 transition-colors ${selectedRoomId === room.id ? "bg-primary/5" : "hover:bg-slate-50"
                                        }`}
                                >
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                                        {avatarUrl ? (
                                            <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <FallbackIcon size={18} className="text-slate-400" />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-slate-800 truncate">{getDisplayName(room)}</p>
                                        <p className="text-xs text-slate-400">
                                            {new Date(room.updatedAt).toLocaleDateString("es-PE")}
                                        </p>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Thread */}
            <div className={`flex-1 min-w-0 flex-col ${selectedRoomId ? "flex" : "hidden sm:flex"}`}>
                {selectedRoomId ? (
                    <>
                        <div className="sm:hidden p-3 border-b border-slate-100 shrink-0">
                            <button
                                onClick={() => setSelectedRoomId(null)}
                                className="text-sm font-medium text-primary"
                            >
                                ← Volver a la lista
                            </button>
                        </div>
                        <ChatWindow roomId={selectedRoomId} />
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                        <MessageCircle size={40} className="mb-3 opacity-40" />
                        <p className="text-sm">Selecciona una conversación</p>
                    </div>
                )}
            </div>
        </div>
    );
};
