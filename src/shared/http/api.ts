import axios from "axios";
import Swal from "sweetalert2";
import { isPublicEndpoint } from "./publicEndpoints";

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

// ── Guard anti-re-entrancia ──────────────────────────────────────────────────
let isSessionExpiredGuardActive = false;

// ── Helper: texto del aviso ante un 401 ──────────────────────────────────────
// El backend responde error=ACCOUNT_DISABLED cuando el admin desactivó la cuenta;
// en ese caso no es una sesión expirada y volver a iniciar sesión no lo arregla.
export const getUnauthorizedNotice = (data?: { error?: string; message?: string }) =>
    data?.error === "ACCOUNT_DISABLED"
        ? {
              title: "Cuenta desactivada",
              text: data.message || "Tu cuenta fue desactivada. Si crees que es un error, contacta a soporte.",
          }
        : { title: "Sesión Expirada", text: "Tu sesión ha caducado. Inicia sesión nuevamente." };

// ── Helper: Logout completo + redirect ────────────────────────────────────────
const handleSessionExpired = async (data?: { error?: string; message?: string }) => {
    if (isSessionExpiredGuardActive) return;
    isSessionExpiredGuardActive = true;

    const authKeys = ["token", "userRole", "empresaId", "userNombre", "perfilCompleto"];
    authKeys.forEach((k) => localStorage.removeItem(k));

    const { title, text } = getUnauthorizedNotice(data);
    await Swal.fire({
        icon: "warning",
        title,
        text,
        confirmButtonColor: "#3b82f6",
        confirmButtonText: "Ir al Login",
        allowOutsideClick: false,
    });

    window.location.href = "/login";
};

// ── Interceptor de REQUEST ───────────────────────────────────────────────────
// Token injection is handled by AuthContext.tsx

// ── Interceptor de RESPONSE ──────────────────────────────────────────────────
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const status = error.response?.status;
        const url = error.config?.url || "";
        const method = error.config?.method?.toLowerCase() || "";

        if (status === 401 && !isPublicEndpoint(url, method)) {
            await handleSessionExpired(error.response?.data);
        }

        if (status === 403) {
            const message = error.response?.data?.message || "No tienes permiso para acceder a este recurso.";
            await Swal.fire({
                icon: "error",
                title: "Acceso Denegado",
                text: message,
                confirmButtonColor: "#3b82f6",
            });
        }

        if (status === 409 && !url.includes("/users/me/role")) {
            const message = error.response?.data?.message || "El recurso ya existe o hay un conflicto de datos.";
            await Swal.fire({
                icon: "warning",
                title: "Conflicto",
                text: message,
                confirmButtonColor: "#3b82f6",
            });
        }

        if (status === 413) {
            await Swal.fire({
                icon: "warning",
                title: "Archivo demasiado grande",
                text: "El archivo excede el tamaño máximo permitido (10MB). Comprime el archivo e intenta de nuevo.",
                confirmButtonColor: "#3b82f6",
            });
        }

        if (!status && error.code !== "ERR_CANCELED") {
            await Swal.fire({
                icon: "error",
                title: "Error de Conexión",
                text: "No se pudo conectar con el servidor. Verifica tu conexión a internet e intenta de nuevo.",
                confirmButtonColor: "#3b82f6",
            });
        }

        return Promise.reject(error);
    }
);
