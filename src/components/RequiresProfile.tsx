import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../features/auth/context/useAuth";

/**
 * Segunda barrera de acceso a los dashboards.
 * Debe usarse DENTRO de un <ProtectedRoute> (ya verifica el token).
 *
 * Si el usuario no está autenticado → redirige a /login
 * Si tiene token + rol correcto BUT perfilCompleto=false
 * → lo fuerza al formulario de perfil de su rol.
 * Excepción: ADMIN no necesita formulario de perfil.
 */
export const RequiresProfile = () => {
  const { isAuthenticated, perfilCompleto, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role === "ADMIN") {
    return <Outlet />;
  }

  if (!perfilCompleto && role) {
    return <Navigate to={`/register/perfil/${role.toLowerCase()}`} replace />;
  }

  return <Outlet />;
};
