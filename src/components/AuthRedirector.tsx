import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/context/useAuth";

const SKIP_REDIRECT_PATTERNS = ["/login", "/register", "/auth/"];

const AUTH_ERROR_KEYS = ["error", "error_description"];

export const AuthRedirector = () => {
  const { isAuthenticated, role, perfilCompleto, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const hasError = AUTH_ERROR_KEYS.some((k) => params.has(k));

    if (hasError) {
      AUTH_ERROR_KEYS.forEach((k) => params.delete(k));
      localStorage.removeItem("userRole");
      localStorage.removeItem("empresaId");
      localStorage.removeItem("veterinarioId");
      localStorage.removeItem("clienteId");
      localStorage.removeItem("userNombre");
      localStorage.removeItem("perfilCompleto");
      localStorage.removeItem("userId");
      navigate("/login", { replace: true });
      return;
    }
  }, [location.search, navigate]);

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;

    const shouldSkip = SKIP_REDIRECT_PATTERNS.some((r) => location.pathname.startsWith(r));
    if (shouldSkip) return;

    if (!role && !perfilCompleto) {
      navigate("/register/rol", { replace: true });
      return;
    }

    if (role && !perfilCompleto) {
      navigate(`/register/perfil/${role.toLowerCase()}`, { replace: true });
      return;
    }
  }, [isAuthenticated, role, perfilCompleto, isLoading, navigate]);

  return null;
};
