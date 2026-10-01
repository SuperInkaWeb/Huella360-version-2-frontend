import { useState, useEffect } from "react";
import { Menu, Stethoscope, User as UserIcon } from "lucide-react";
import { useAuth } from "../../../../auth/context/useAuth";
import { getPortalName, getRoleLabel } from "../../../../../shared/utils/roleLabels";
import { vetService } from "../../services/vetService";
import type { VetProfile } from "../../types/vet.types";

interface VetHeaderProps {
    onMenuClick: () => void;
}

export const VetHeader = ({ onMenuClick }: VetHeaderProps) => {
    const { role, nombre } = useAuth();
    const [profile, setProfile] = useState<VetProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await vetService.getMyProfile();
                setProfile(data);
            } catch (error) {
                console.error("Error fetching vet profile:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const displayName = profile ? `${profile.nombres} ${profile.apellidos}` : (nombre || "Veterinario");

    return (
        <header className="h-14 shrink-0 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6">
            {/* Left: Mobile menu button */}
            <button
                onClick={onMenuClick}
                className="lg:hidden p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
                <Menu size={22} />
            </button>

            {/* H360-UX-001: identifica el portal profesional frente al del dueño de mascota */}
            <div className="flex-1 flex items-center min-w-0">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold truncate">
                    <Stethoscope size={14} className="shrink-0" />
                    {getPortalName("VETERINARIO")}
                </span>
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-4 ml-4">
                <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-gray-900 truncate max-w-[150px]">
                            {isLoading ? "Cargando..." : displayName}
                        </p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                            {getRoleLabel(role || "VETERINARIO")}
                        </p>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary ring-2 ring-white shrink-0 overflow-hidden transition-all hover:bg-primary hover:text-white">
                        {profile?.fotoPerfilUrl ? (
                            <img src={profile.fotoPerfilUrl} alt={displayName} className="h-full w-full object-cover" />
                        ) : (
                            <UserIcon size={18} />
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};
