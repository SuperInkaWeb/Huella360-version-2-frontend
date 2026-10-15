import { LogOut } from "lucide-react";
import { useAuth } from "../context/useAuth";

/**
 * Salida del registro. Quien inicia sesión con una cuenta sin perfil completo es devuelto al registro
 * desde cualquier página (AuthRedirector), incluso desde /login; sin este botón no puede cambiar de cuenta.
 * Va en la esquina superior derecha de un contenedor con position: relative.
 */
export const CerrarSesionRegistro = () => {
  const { nombre, logout } = useAuth();

  return (
    <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-3">
      {nombre && (
        <span className="hidden sm:inline text-xs text-slate-500">
          Conectado como <span className="font-semibold text-slate-700">{nombre}</span>
        </span>
      )}
      <button
        type="button"
        onClick={logout}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:border-red-200 hover:text-red-600 transition-colors"
      >
        <LogOut size={14} />
        Cerrar sesión
      </button>
    </div>
  );
};
