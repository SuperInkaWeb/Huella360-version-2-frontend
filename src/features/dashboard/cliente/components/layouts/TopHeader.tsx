import { useState, useEffect } from "react";
import { Search, Menu, User as UserIcon } from "lucide-react";
import { useAuth } from "../../../../auth/context/useAuth";
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

      <div className="flex-1 max-w-xl hidden sm:flex">
        <div className="relative w-full group">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-text-secondary group-focus-within:text-primary transition-colors">
            <Search size={18} />
          </span>
          <input
            className="w-full bg-slate-50 border border-border rounded-full py-2 pl-11 pr-4 text-sm focus:ring-2 focus:ring-primary focus:border-primary placeholder:text-text-secondary outline-none transition-all"
            placeholder="Buscar citas, mascotas o servicios..."
            type="text"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 ml-4">
        <div className="flex items-center gap-3 pl-4 border-l border-border">
          <div className="text-right hidden lg:block">
            <p className="text-sm font-bold text-text-primary truncate max-w-[150px]">
              {isLoading ? "Cargando..." : displayName}
            </p>
            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">
              {role || "Cliente"}
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
