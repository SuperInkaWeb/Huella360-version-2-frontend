import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopHeader } from "./TopHeader";

export const DashboardCliente = () => {
 const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

 return (
 <div className="flex h-screen bg-background-light overflow-hidden text-gray-900 antialiased">
 <Sidebar isMobileOpen={isMobileSidebarOpen} setMobileOpen={setIsMobileSidebarOpen} />

 <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
 <TopHeader onMenuClick={() => setIsMobileSidebarOpen(true)} />

 <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8">
 <div className="max-w-7xl mx-auto space-y-8">
 <Outlet />
 </div>
 </div>
 </main>
 </div>
 );
};