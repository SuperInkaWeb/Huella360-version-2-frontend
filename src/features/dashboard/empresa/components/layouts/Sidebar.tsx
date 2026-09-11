import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../../../auth/context/useAuth";
import {
  LayoutDashboard,
  Stethoscope,
  Package,
  CreditCard,
  Users,
  Settings,
  LogOut,
  X,
  Heart,
  Inbox,
  Zap,
  Search,
  PawPrint,
  Calendar,
  Award,
  ChevronDown,
  MessageCircle,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_SECTIONS = [
  {
    label: "General",
    defaultOpen: true,
    items: [
      { icon: <LayoutDashboard size={18} />, label: "Dashboard", to: "/portal/empresa", end: true },
      { icon: <Calendar size={18} />, label: "Citas", to: "/portal/empresa/citas" },
      { icon: <PawPrint size={18} />, label: "Pacientes", to: "/portal/empresa/pacientes" },
      { icon: <MessageCircle size={18} />, label: "Chats", to: "/portal/empresa/chats" },
    ],
  },
  {
    label: "Gestión",
    defaultOpen: true,
    items: [
      { icon: <Stethoscope size={18} />, label: "Servicios", to: "/portal/empresa/servicios" },
      { icon: <Package size={18} />, label: "Productos", to: "/portal/empresa/productos" },
      { icon: <Users size={18} />, label: "Clientes (CRM)", to: "/portal/empresa/clientes" },
      { icon: <Users size={18} />, label: "Equipo", to: "/portal/empresa/equipo" },
    ],
  },
  {
    label: "Crecimiento",
    defaultOpen: false,
    items: [
      { icon: <Heart size={18} />, label: "Adopciones", to: "/portal/empresa/adopciones" },
      { icon: <Inbox size={18} />, label: "Leads", to: "/portal/empresa/leads" },
      { icon: <Search size={18} />, label: "Talento", to: "/portal/empresa/talento" },
      { icon: <Award size={18} />, label: "Recompensas", to: "/portal/empresa/recompensas" },
    ],
  },
  {
    label: "Soporte",
    defaultOpen: false,
    items: [
      { icon: <Zap size={18} />, label: "Suscripción", to: "/portal/empresa/suscripcion" },
      { icon: <CreditCard size={18} />, label: "Facturación", to: "/portal/empresa/facturacion" },
      { icon: <Settings size={18} />, label: "Configuración", to: "/portal/empresa/configuracion" },
    ],
  },
];

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    NAV_SECTIONS.forEach((s) => { initial[s.label] = !s.defaultOpen; });
    return initial;
  });

  const toggleSection = (label: string) => {
    setCollapsedSections((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/30 z-40 transition-opacity duration-300 md:hidden ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />
      <aside
        className={`
          fixed md:relative z-50 h-full w-64 flex-col bg-white
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          flex shadow-sm border-r border-slate-100
        `}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-5 h-16 shrink-0 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <img
                src="/LOGO HUELLA360_logo primario.png"
                alt="Logo Huella360"
                className="h-7 w-auto object-contain shrink-0"
              />
              <span className="text-base font-bold text-slate-800">Huella360</span>
            </div>
            <button onClick={onClose} className="md:hidden p-1 text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
            {NAV_SECTIONS.map((section) => (
              <div key={section.label}>
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
                {!collapsedSections[section.label] && (
                  <div className="space-y-0.5">
                    {section.items.map((item) => (
                      <NavItem key={item.label} icon={item.icon} label={item.label} to={item.to} end={item.end} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="border-t border-slate-100 p-3">
            <button
              className="flex w-full items-center gap-3 px-3 py-2 rounded-lg transition-colors text-slate-500 hover:bg-red-50 hover:text-red-600"
              onClick={handleLogout}
            >
              <LogOut size={18} />
              <span className="text-sm font-medium">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

const NavItem = ({ icon, label, to, end = false }: { icon: React.ReactNode; label: string; to: string; end?: boolean }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${isActive
        ? "bg-primary/5 text-primary font-semibold"
        : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
      }`
    }
  >
    {icon}
    <span className="text-sm">{label}</span>
  </NavLink>
);
