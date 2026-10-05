import { Building2, ExternalLink, Menu, User as UserIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../../auth/context/useAuth";
import { getPortalName, getRoleLabel } from "../../../../../shared/utils/roleLabels";
import { useEmpresaProfile } from "../../hooks/useEmpresaProfile";

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const { role, nombre } = useAuth();
  const { data: companyData, isLoading } = useEmpresaProfile();
  // El perfil público solo existe para empresas verificadas (regla A3); antes de eso daría "no encontrado".
  const puedeVerPerfilPublico = companyData?.id && companyData.estadoValidacion === "VERIFICADO";

  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-6 bg-white/80 backdrop-blur-md border-b border-slate-100 shrink-0 z-10">
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 -ml-2 text-text-secondary hover:bg-slate-100 rounded-lg"
      >
        <Menu size={24} />
      </button>

      {/* H360-UX-002: identifica el panel del negocio frente a la vista del cliente
          (reemplaza el buscador de pacientes/citas, que no estaba conectado a nada) */}
      <div className="flex-1 flex items-center gap-3 min-w-0 ml-2 md:ml-0">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold truncate">
          <Building2 size={14} className="shrink-0" />
          {getPortalName("EMPRESA")}
        </span>
        {puedeVerPerfilPublico && (
          <Link
            to={`/empresa/${companyData.id}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Abre tu perfil público tal como lo ven los clientes"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-primary transition-colors"
          >
            <ExternalLink size={14} />
            Ver como cliente
          </Link>
        )}
      </div>

      <div className="flex items-center gap-2 md:gap-4 ml-4">
        <div className="flex items-center gap-3 pl-2 md:pl-4 md:border-l border-slate-200">
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-text-primary truncate max-w-[150px]">
              {isLoading ? "Cargando..." : (companyData?.nombreComercial || nombre || "Mi Empresa")}
            </p>
            <p className="text-xs text-text-secondary">{getRoleLabel(role || "EMPRESA")}</p>
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
