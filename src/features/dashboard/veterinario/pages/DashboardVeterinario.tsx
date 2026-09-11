import { useState } from "react";
import { Outlet } from "react-router-dom";
import { VetSidebar } from "../components/layouts/VetSidebar";
import { VetHeader } from "../components/layouts/VetHeader";

export default function DashboardVeterinario() {
 const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

 return (
 <div className="flex h-screen w-full overflow-hidden bg-background-light text-slate-900 antialiased font-sans">
 <VetSidebar
 isMobileOpen={isMobileMenuOpen}
 setMobileOpen={setIsMobileMenuOpen}
 />

 <main className="flex-1 flex flex-col h-full overflow-hidden relative transition-colors duration-300">
 <VetHeader onMenuClick={() => setIsMobileMenuOpen(true)} />
 <Outlet />
 </main>
 </div>
 );
}
