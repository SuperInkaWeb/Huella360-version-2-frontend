import { useState, useEffect } from "react";
import { Menu, Search, User as UserIcon } from "lucide-react";
import { useAuth } from "../../../../auth/context/useAuth";
import { api } from "../../../../../shared/http/api";

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const { role, nombre } = useAuth();
  const [companyData, setCompanyData] = useState<{ nombreComercial: string; logoUrl?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await api.get("/companies/me");
        setCompanyData(response.data.data);
      } catch (error) {
        console.error("Error fetching company data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCompany();
  }, []);

  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-6 bg-white/80 backdrop-blur-md border-b border-slate-100 shrink-0 z-10">
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 -ml-2 text-text-secondary hover:bg-slate-100 rounded-lg"
      >
        <Menu size={24} />
      </button>

      <div className="flex-1 max-w-lg hidden sm:flex ml-2 md:ml-0">
        <div className="relative w-full group">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-text-secondary group-focus-within:text-primary transition-colors">
            <Search size={18} />
          </span>
          <input
            className="w-full bg-slate-50 border border-slate-200 rounded-full py-2 pl-11 pr-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-slate-400 outline-none transition-all"
            placeholder="Buscar pacientes, citas..."
            type="text"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4 ml-auto">
        <button className="sm:hidden p-2 text-text-secondary">
          <Search size={20} />
        </button>

        <div className="flex items-center gap-3 pl-2 md:pl-4 md:border-l border-slate-200">
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-text-primary truncate max-w-[150px]">
              {isLoading ? "Cargando..." : (companyData?.nombreComercial || nombre || "Mi Empresa")}
            </p>
            <p className="text-xs text-text-secondary capitalize">{role?.toLowerCase() || "Admin"}</p>
          </div>
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20 transition-all hover:bg-primary hover:text-white overflow-hidden shrink-0 ring-2 ring-white">
            {companyData?.logoUrl ? (
              <img src={companyData.logoUrl} alt="Logo" className="h-full w-full object-contain p-1" />
            ) : (
              <UserIcon size={20} />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
