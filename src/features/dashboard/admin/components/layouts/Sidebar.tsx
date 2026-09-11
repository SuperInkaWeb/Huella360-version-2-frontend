import { useState } from "react";
import { NavLink } from "react-router-dom";
import { SidebarUser } from "../SidebarUser";
import * as LucideIcons from "lucide-react";
import { Menu, X } from "lucide-react";

const MENU_ITEMS = [
 {
 label: "Dashboard",
 icon: "LayoutDashboard",
 href: "/portal/admin",
 end: true,
 },
 { label: "Empresas", icon: "Building2", href: "/portal/admin/empresas" },
 { label: "Usuarios", icon: "Users", href: "/portal/admin/usuarios" },
 { label: "Suscripciones", icon: "CreditCard", href: "/portal/admin/suscripciones" },
 { label: "Categorías", icon: "Layers", href: "/portal/admin/categorias" },
 { label: "Veterinarios", icon: "Stethoscope", href: "/portal/admin/veterinarios", badge: "12" },
];

const MANAGEMENT_ITEMS = [
 { label: "Suscripciones", icon: "CreditCard", href: "/portal/admin/suscripciones" },
 { label: "Gamificación", icon: "Award", href: "/portal/admin/gamificacion" },
];

export const Sidebar = () => {
 const [isOpen, setIsOpen] = useState(false);

 const toggleSidebar = () => setIsOpen(!isOpen);

 return (
 <>
 {/* 1. Botón Hamburguesa (Móvil) */}
 <button
 onClick={toggleSidebar}
 className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white border border-gray-200 shadow-md text-gray-600 "
 >
 {isOpen ? <X size={24} /> : <Menu size={24} />}
 </button>

 {/* 2. Overlay */}
 {isOpen && (
 <div
 className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
 onClick={toggleSidebar}
 />
 )}

 {/* 3. Aside */}
 <aside
 className={`
 fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 flex flex-col shrink-0 transition-transform duration-300 ease-in-out
 lg:translate-x-0 lg:static h-full
 ${isOpen ? "translate-x-0" : "-translate-x-full"}
 `}
 >
 {/* Logo */}
 <div className="h-16 flex items-center px-6 border-b border-gray-200 ">
 <div className="flex items-center gap-3">
 <img
 src="/LOGO HUELLA360_logo primario.png"
 alt="Logo Huella360"
 className="h-8 w-auto object-contain"
 />
 <span className="font-bold text-lg tracking-tight text-gray-900 ">
 Huella360
 </span>
 </div>
 </div>

 {/* Navigation */}
 <div className="flex-1 overflow-y-auto py-6 px-3 space-y-8">
 {/* SECCIÓN OVERVIEW */}
 <div>
 <div className="px-3 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
 Overview
 </div>
 <div className="space-y-1">
 {MENU_ITEMS.map((item) => {
 const DynamicIcon = LucideIcons[
 item.icon as keyof typeof LucideIcons
 ] as React.ElementType;

 return (
 <NavLink
 key={item.label}
 to={item.href}
 end={item.end}
 onClick={() => setIsOpen(false)}
 className={({ isActive }) => `
 flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-200 group
 ${isActive
 ? "bg-primary/10 text-primary "
 : "text-gray-600 hover:bg-gray-50 :bg-surface-darker hover:text-gray-900 :text-gray-200"}
 `}
 >
 {({ isActive }) => (
 <>
 {DynamicIcon && (
 <DynamicIcon
 size={20}
 className={`${isActive ? "text-primary" : "text-gray-400 group-hover:text-primary"}`}
 />
 )}
 <span className="text-sm">{item.label}</span>
 {item.badge && (
 <span className="ml-auto bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
 {item.badge}
 </span>
 )}
 </>
 )}
 </NavLink>
 );
 })}
 </div>
 </div>

 {/* SECCIÓN MANAGEMENT */}
 <div>
 <div className="px-3 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
 Management
 </div>
 <div className="space-y-1">
 {MANAGEMENT_ITEMS.map((item) => {
 const DynamicIcon = LucideIcons[
 item.icon as keyof typeof LucideIcons
 ] as React.ElementType;

 return (
 <NavLink
 key={item.label}
 to={item.href}
 onClick={() => setIsOpen(false)}
 className={({ isActive }) => `
 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group
 ${isActive
 ? "bg-primary/10 text-primary "
 : "text-gray-600 hover:bg-gray-50 :bg-surface-darker hover:text-gray-900 :text-gray-200"}
 `}
 >
 {({ isActive }) => (
 <>
 {DynamicIcon && (
 <DynamicIcon
 size={20}
 className={isActive ? "text-primary" : "text-gray-400 group-hover:text-primary"}
 />
 )}
 <span>{item.label}</span>
 </>
 )}
 </NavLink>
 );
 })}
 </div>
 </div>
 </div>

 {/* Profile Section */}
 <SidebarUser />
 </aside>
 </>
 );
};