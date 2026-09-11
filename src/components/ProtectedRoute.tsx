import { Navigate, Outlet } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../features/auth/context/useAuth";

const PORTALS: Record<string, string> = {
  CLIENTE: "/portal/cliente",
  VETERINARIO: "/portal/veterinario",
  EMPRESA: "/portal/empresa",
  REPARTIDOR: "/portal/repartidor",
  ADMIN: "/portal/admin",
};

const ROLE_RETRY_KEY = "roleRetryCount";
const MAX_ROLE_RETRIES = 3;

interface ProtectedRouteProps {
  allowedRoles: string[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, role, logout } = useAuth();
  const [retryCount] = useState(() => {
    return parseInt(sessionStorage.getItem(ROLE_RETRY_KEY) || "0");
  });

  if (!isAuthenticated) {
    sessionStorage.removeItem(ROLE_RETRY_KEY);
    return <Navigate to="/login" replace />;
  }

  if (role && !allowedRoles.includes(role)) {
    sessionStorage.removeItem(ROLE_RETRY_KEY);
    return <Navigate to={PORTALS[role] ?? "/"} replace />;
  }

  if (!role) {
    if (retryCount >= MAX_ROLE_RETRIES) {
      sessionStorage.removeItem(ROLE_RETRY_KEY);
      logout();
      return <Navigate to="/login" replace />;
    }
    sessionStorage.setItem(ROLE_RETRY_KEY, String(retryCount + 1));
    return <Navigate to="/register/rol" replace />;
  }

  sessionStorage.removeItem(ROLE_RETRY_KEY);
  return <Outlet />;
};
