import { Sidebar } from "../components/layouts/Sidebar";
import { Header } from "../components/layouts/Header";
import { useState } from "react";
import { Outlet } from "react-router-dom";

export default function DashboardEmpresa() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-light text-slate-900 antialiased font-sans">
      
      {/* Pasamos el estado y la función para cerrar al Sidebar */}
      <Sidebar 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative transition-colors duration-300">
        {/* Pasamos la función para abrir al Header */}
        <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
        
        {/* El contenido principal será dinámico según la ruta anidada */}
        <Outlet />
      </main>
    </div>
  );
}
