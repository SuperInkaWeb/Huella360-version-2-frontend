import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { User, LayoutDashboard, ChevronDown } from "lucide-react";
import { useAuth } from "../../../auth/context/useAuth";
import { getRedirectByRole } from "../../../auth/services/authRedirect";
import { LogoutButton } from "../../../../components/LogoutButton";

export const SidebarUser = () => {
 const [isOpen, setIsOpen] = useState(false);
 const { role, nombre } = useAuth();
 const dropdownRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
 const handleClickOutside = (event: MouseEvent) => {
 if (
 dropdownRef.current &&
 !dropdownRef.current.contains(event.target as Node)
 ) {
 setIsOpen(false);
 }
 };
 document.addEventListener("mousedown", handleClickOutside);
 return () => document.removeEventListener("mousedown", handleClickOutside);
 }, []);

 const dashboardPath = role ? getRedirectByRole(role) : "/";

 return (
 <div
 className="relative p-4 border-t border-gray-200 "
 ref={dropdownRef}
 >
 {/* Botón de Perfil estilo Dashboard */}
 <button
 onClick={() => setIsOpen(!isOpen)}
 className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-gray-100 :bg-surface-darker transition-colors text-left group"
 >
 <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 transition-colors group-hover:bg-primary group-hover:text-white">
 <User size={20} />
 </div>

 <div className="flex-1 min-w-0">
 <p className="text-sm font-semibold text-gray-900 truncate">
 {nombre || "Admin User"}
 </p>
 <p className="text-xs text-gray-500 truncate uppercase tracking-tighter">
 {role || "Administrator"}
 </p>
 </div>

 <ChevronDown
 size={16}
 className={`text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
 />
 </button>

 {/* Menú Desplegable (Abre hacia arriba) */}
 {isOpen && (
 <div className="absolute bottom-[85%] left-4 right-4 mb-2 bg-white border border-gray-200 rounded-xl shadow-2xl py-2 z-100 animate-in slide-in-from-bottom-2 duration-200">
 <div className="px-4 py-2 border-b border-gray-100 mb-1">
 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
 Opciones
 </p>
 </div>

 <Link
 to={dashboardPath}
 onClick={() => setIsOpen(false)}
 className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 :bg-surface-darker transition-colors"
 >
 <LayoutDashboard size={18} className="text-gray-400" />
 Panel de Control
 </Link>

 <div className="border-t border-gray-100 mt-1 pt-1">
 <LogoutButton
 showConfirmation={true}
 variant="ghost"
 className="w-full flex items-center justify-start gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 :bg-red-950/20 hover:text-red-600 border-none h-auto font-medium"
 />
 </div>
 </div>
 )}
 </div>
 );
};
