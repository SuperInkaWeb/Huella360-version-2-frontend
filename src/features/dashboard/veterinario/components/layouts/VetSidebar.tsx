import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../../../../auth/context/useAuth";
import {
 LayoutDashboard,
 Stethoscope,
 Mail,
 Settings,
 LogOut,
 ChevronLeft,
 X,
 Clock,
 PawPrint,
 MessageSquare,
} from "lucide-react";
import { useState } from "react";

const MENU_ITEMS = [
 { label: "Dashboard", icon: LayoutDashboard, href: "/portal/veterinario", end: true },
 { label: "Agenda", icon: Clock, href: "/portal/veterinario/citas" },
 { label: "Pacientes", icon: PawPrint, href: "/portal/veterinario/pacientes" },
 { label: "Teleconsultas", icon: MessageSquare, href: "/portal/veterinario/teleconsultas" },
 { label: "Mis Servicios", icon: Stethoscope, href: "/portal/veterinario/servicios" },
 { label: "Invitaciones", icon: Mail, href: "/portal/veterinario/invitaciones" },
];

interface VetSidebarProps {
 isMobileOpen: boolean;
 setMobileOpen: (open: boolean) => void;
}

export const VetSidebar = ({ isMobileOpen, setMobileOpen }: VetSidebarProps) => {
 const [isCollapsed, setIsCollapsed] = useState(false);
 const { logout } = useAuth();

 return (
 <>
 {/* Mobile Overlay */}
 {isMobileOpen && (
 <div
 className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
 onClick={() => setMobileOpen(false)}
 />
 )}

 {/* Sidebar */}
 <aside
 className={`
 fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-gray-200 transition-all duration-300
 lg:static lg:translate-x-0 h-full
 ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
 ${isCollapsed ? "w-20" : "w-64"}
 `}
 >
 {/* Header / Branding */}
 <div className="h-16 flex items-center justify-between px-6 shrink-0 border-b border-gray-100 ">
 {!isCollapsed && (
 <Link to="/" className="flex items-center gap-3">
 <img
 src="/LOGO HUELLA360_logo primario.png"
 alt="Logo Huella360"
 className="h-8 w-auto object-contain shrink-0"
 />
 <div className="flex flex-col">
 <span className="text-lg font-extrabold tracking-tight text-gray-900 ">
 Huella360
 </span>
 <span className="text-[10px] font-medium text-slate-400 -mt-0.5">Veterinario</span>
 </div>
 </Link>
 )}
 {isCollapsed && (
 <div className="flex items-center justify-center mx-auto">
 <img
 src="/favicon-03.png"
 alt="Huella360"
 className="h-7 w-auto object-contain"
 />
 </div>
 )}
 {/* Mobile close */}
 <button
 onClick={() => setMobileOpen(false)}
 className="lg:hidden p-2 text-gray-400 hover:text-gray-600 :text-gray-200 rounded-lg"
 >
 <X size={20} />
 </button>
 {/* Collapse toggle (desktop) */}
 <button
 onClick={() => setIsCollapsed(!isCollapsed)}
 className="hidden lg:flex p-1.5 rounded-lg hover:bg-gray-100 :bg-surface-darker text-gray-400 hover:text-gray-600 transition-colors"
 >
 <ChevronLeft size={18} className={`transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`} />
 </button>
 </div>

 {/* Navigation */}
 <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto custom-scrollbar">
 {MENU_ITEMS.map((item) => (
 <NavLink
 key={item.label}
 to={item.href}
 end={item.end}
 onClick={() => setMobileOpen(false)}
 className={({ isActive }) => `
 flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-200 group
 ${isActive
 ? "bg-teal-500/10 text-teal-600 "
 : "text-gray-600 hover:bg-gray-50 :bg-surface-darker hover:text-gray-900 :text-gray-200"}
 `}
 >
 {({ isActive }: { isActive: boolean }) => (
 <>
 <item.icon size={20} className={isActive ? "text-teal-500" : "text-gray-400 group-hover:text-teal-500 transition-colors"} />
 {!isCollapsed && <span className="text-sm">{item.label}</span>}
 </>
 )}
 </NavLink>
 ))}
 </nav>

 {/* Bottom Nav */}
 <div className="p-4 border-t border-gray-100 space-y-1">
 <Link
 to="/portal/veterinario/configuracion"
 className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-gray-600 hover:bg-gray-50 :bg-surface-darker hover:text-gray-900 transition-all ${isCollapsed ? "justify-center" : ""}`}
 >
 <Settings size={20} className="text-gray-400" />
 {!isCollapsed && <span className="text-sm">Configuración</span>}
 </Link>
 <button
 onClick={logout}
 className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-red-500 hover:bg-red-50 :bg-red-950/20 transition-all ${isCollapsed ? "justify-center" : ""}`}
 >
 <LogOut size={20} />
 {!isCollapsed && <span className="text-sm">Cerrar Sesión</span>}
 </button>
 </div>
 </aside>
 </>
 );
};
