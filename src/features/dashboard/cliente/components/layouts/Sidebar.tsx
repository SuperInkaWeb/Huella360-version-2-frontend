import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import {
  LayoutDashboard,
  PawPrint,
  ShoppingBag,
  Settings,
  LogOut,
  ChevronLeft,
  X,
  Heart,
  Calendar,
  CalendarCheck,
  Package,
  Award,
  MessageSquare,
  MessageCircle,
  Bell,
  Users,
  ChevronDown,
  Zap,
} from "lucide-react";
import { useAuth } from "../../../../auth/context/useAuth";

const NAV_SECTIONS = [
  {
    label: "General",
    defaultOpen: true,
    items: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/portal/cliente", end: true },
      { icon: PawPrint, label: "Mis Mascotas", href: "/portal/cliente/mascotas" },
      { icon: CalendarCheck, label: "Mis Citas", href: "/portal/cliente/citas" },
    ],
  },
  {
    label: "Servicios",
    defaultOpen: true,
    items: [
      { icon: Calendar, label: "Mis Servicios", href: "/portal/cliente/servicios" },
      { icon: MessageSquare, label: "Teleconsultas", href: "/portal/cliente/teleconsultas" },
      { icon: MessageCircle, label: "Mis Chats", href: "/portal/cliente/chats" },
      { icon: Bell, label: "Recordatorios", href: "/portal/cliente/recordatorios" },
    ],
  },
  {
    label: "Marketplace",
    defaultOpen: false,
    items: [
      { icon: ShoppingBag, label: "Marketplace", href: "/marketplace" },
      { icon: Package, label: "Mis Pedidos", href: "/portal/cliente/compras" },
    ],
  },
  {
    label: "Comunidad",
    defaultOpen: false,
    items: [
      { icon: Heart, label: "Adopciones", href: "/portal/cliente/adopciones" },
      { icon: Users, label: "Mis Referidos", href: "/portal/cliente/referidos" },
      { icon: Award, label: "Mis Puntos", href: "/portal/cliente/puntos" },
    ],
  },
];

interface SidebarProps {
  isMobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar = ({ isMobileOpen, setMobileOpen }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    NAV_SECTIONS.forEach((s) => { initial[s.label] = !s.defaultOpen; });
    return initial;
  });
  const { logout } = useAuth();

  const toggleSection = (label: string) => {
    setCollapsedSections((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <>
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
      )}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-slate-100 transition-all duration-300
          lg:static lg:translate-x-0 h-full
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
          ${isCollapsed ? "w-20" : "w-64"}
        `}
      >
        <div className="h-16 flex items-center justify-between px-5 shrink-0 border-b border-slate-100">
          {!isCollapsed && (
            <Link to="/" className="flex items-center gap-2.5">
              <img src="/LOGO HUELLA360_logo primario.png" alt="Logo Huella360" className="h-7 w-auto object-contain" />
              <span className="text-base font-bold text-slate-800">Huella360</span>
            </Link>
          )}
          {isCollapsed && (
            <div className="flex items-center justify-center mx-auto">
              <img src="/LOGO HUELLA360_logo primario.png" alt="Logo Huella360" className="h-7 w-auto object-contain" />
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ChevronLeft size={18} className={`transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`} />
          </button>
          <button onClick={() => setMobileOpen(false)} className="lg:hidden p-1.5 text-slate-400">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto custom-scrollbar">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              {!isCollapsed && (
                <button
                  onClick={() => toggleSection(section.label)}
                  className="flex items-center justify-between w-full px-3 mb-1 text-[11px] font-semibold uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {section.label}
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${collapsedSections[section.label] ? "-rotate-90" : ""}`}
                  />
                </button>
              )}
              {!collapsedSections[section.label] && (
                <div className="space-y-0.5">
                  {section.items.map((item) => (
                    <NavLink
                      key={item.label}
                      to={item.href}
                      end={item.end}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) => `
                        flex items-center gap-3 px-3 py-2 rounded-lg transition-all
                        ${isCollapsed ? "justify-center" : ""}
                        ${isActive
                          ? "bg-primary/5 text-primary font-semibold"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                        }
                      `}
                    >
                      <item.icon size={18} className="shrink-0" />
                      {!isCollapsed && <span className="text-sm">{item.label}</span>}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-100 space-y-0.5">
          <Link
            to="/portal/cliente/suscripcion"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-primary/5 hover:text-primary transition-all ${isCollapsed ? "justify-center" : ""}`}
          >
            <Zap size={18} className="shrink-0" />
            {!isCollapsed && <span className="text-sm">Mi Suscripción</span>}
          </Link>
          <Link
            to="/portal/cliente/configuracion"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-all ${isCollapsed ? "justify-center" : ""}`}
          >
            <Settings size={18} className="shrink-0" />
            {!isCollapsed && <span className="text-sm">Configuración</span>}
          </Link>
          <button
            onClick={logout}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all ${isCollapsed ? "justify-center" : ""}`}
          >
            <LogOut size={18} className="shrink-0" />
            {!isCollapsed && <span className="text-sm">Cerrar Sesión</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
