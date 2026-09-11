import { X, Store } from "lucide-react";
import { ChatWindow } from "./ChatWindow";

interface ChatModalProps {
    roomId: number;
    title: string;
    logoUrl?: string;
    onClose: () => void;
}

export const ChatModal = ({ roomId, title, logoUrl, onClose }: ChatModalProps) => {
    return (
        <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center sm:justify-end p-0 sm:p-6 bg-black/40 sm:bg-transparent">
            <div className="bg-white w-full sm:w-[380px] h-[85vh] sm:h-[560px] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-slate-100 shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                            {logoUrl ? (
                                <img src={logoUrl} alt={title} className="w-full h-full object-cover" />
                            ) : (
                                <Store size={18} className="text-slate-400" />
                            )}
                        </div>
                        <h3 className="font-bold text-slate-900 truncate">{title}</h3>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors shrink-0">
                        <X size={18} />
                    </button>
                </div>
                <div className="flex-1 min-h-0">
                    <ChatWindow roomId={roomId} />
                </div>
            </div>
        </div>
    );
};
