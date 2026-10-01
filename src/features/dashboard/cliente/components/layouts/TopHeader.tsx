import { useState, useEffect } from "react";
import { PawPrint, Menu, User as UserIcon } from "lucide-react";
import { useAuth } from "../../../../auth/context/useAuth";
import { getPortalName, getRoleLabel } from "../../../../../shared/utils/roleLabels";
import { clienteService } from "../../services/clienteService";
import type { ClienteProfile } from "../../types/cliente.types";

interface TopHeaderProps {
  onMenuClick: () => void;
}

export const TopHeader = ({ onMenuClick }: TopHeaderProps) => {
  const { role, nombre } = useAuth();
  const [profile, setProfile] = useState<ClienteProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await clienteService.getMyProfile();
        setProfile(data);
      } catch {
        // Profile not yet created — fallback to Auth0 name
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const displayName = profile
    ? `${profile.nombres} ${profile.apellidos}`.trim()
    : (nombre || "Usuario");

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white/80 backdrop-blur-md border-b border-slate-100 shrink-0 z-20">
      <button
        onClick={onMenuClick}
        className="lg:hidden mr-4 p-2 text-text-secondary hover:bg-slate-100 rounded-lg transition-colors"
      >
        <Menu size={24} />
      </button>

      {/* H360-UX-001: identifica el portal en lugar del buscador, que no estaba conectado a nada */}
      <div className="flex-1 flex items-center gap-2 min-w-0">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold truncate">
          <PawPrint size={14} className="shrink-0" />
          {getPortalName("CLIENTE")}
        </span>
      </div>

      <div className="flex items-center gap-4 ml-4">
        <div className="flex items-center gap-3 pl-4 border-l border-border">
          <div className="text-right hidden lg:block">
            <p className="text-sm font-bold text-text-primary truncate max-w-[150px]">
              {isLoading ? "Cargando..." : displayName}
            </p>
            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">
              {getRoleLabel(role || "CLIENTE")}
            </p>
          </div>
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20 transition-all hover:bg-primary hover:text-white overflow-hidden shrink-0 ring-2 ring-white">
            {profile?.fotoPerfilUrl ? (
              <img
                src={profile.fotoPerfilUrl}
                alt={displayName}
                className="h-full w-full object-cover"
              />
            ) : (
              <UserIcon size={20} />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
