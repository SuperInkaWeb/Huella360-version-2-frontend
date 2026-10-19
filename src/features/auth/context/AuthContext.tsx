import { createContext, useState, useContext, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { api } from "../../../shared/http/api";
import { isPublicEndpoint } from "../../../shared/http/publicEndpoints";
import { EVENTO_CORREO_NO_VERIFICADO, esCorreoNoVerificado } from "../../../shared/http/correoNoVerificado";
import { VerificarCorreoPantalla } from "../components/VerificarCorreoPantalla";

// ── Constantes de storage ────────────────────────────────────────────────────
const STORAGE_KEYS = {
    PERFIL_COMPLETO: "perfilCompleto",
    TOKEN: "token",
    USER_ROLE: "userRole",
    EMPRESA_ID: "empresaId",
    VETERINARIO_ID: "veterinarioId",
    CLIENTE_ID: "clienteId",
    USER_NOMBRE: "userNombre",
    USER_ID: "userId",
} as const;

const AUTH_STORAGE_KEYS = [
    STORAGE_KEYS.TOKEN,
    STORAGE_KEYS.USER_ROLE,
    STORAGE_KEYS.EMPRESA_ID,
    STORAGE_KEYS.VETERINARIO_ID,
    STORAGE_KEYS.CLIENTE_ID,
    STORAGE_KEYS.USER_NOMBRE,
    STORAGE_KEYS.PERFIL_COMPLETO,
    STORAGE_KEYS.USER_ID,
];

// ── Claims de Auth0 (namespace del Post Login Action) ────────────────────────
// El backend (Auth0JwtAuthenticationConverter) acepta tanto "vet-saas.com" (nombre
// legacy del proyecto) como "huella360.com". El namespace real usado en la Action
// del tenant es "huella360.com" — este archivo debe coincidir con eso, si no los
// claims nunca se leen (aunque el login sigue funcionando via el sync con el
// backend, que no depende de esto).
const AUTH0_CLAIMS = {
    EMAIL: "https://huella360.com/email",
    ROLE: "https://huella360.com/role",
    EMPRESA_ID: "https://huella360.com/empresaId",
    NOMBRE: "https://huella360.com/nombre",
} as const;

// ── Helpers de storage ───────────────────────────────────────────────────────
const clearAuthStorage = () => {
    AUTH_STORAGE_KEYS.forEach((k) => localStorage.removeItem(k));
};

// ── Context ──────────────────────────────────────────────────────────────────
export interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    role: string | null;
    userId: number | null;
    empresaId: number | null;
    veterinarioId: number | null;
    clienteId: number | null;
    nombre: string | null;
    perfilCompleto: boolean;
    login: () => void;
    logout: () => void;
    setPerfilCompleto: (value: boolean) => void;
    setRole: (role: string) => void;
    setEmpresaId: (id: number) => void;
    setVeterinarioId: (id: number) => void;
    setClienteId: (id: number) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

// ── Hook publico ─────────────────────────────────────────────────────────────
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth debe usarse dentro de un AuthProvider");
    }
    return context;
};

// ── Provider ─────────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const {
        isAuthenticated,
        user,
        loginWithRedirect,
        logout: auth0Logout,
        getAccessTokenSilently,
        isLoading,
    } = useAuth0();

    const [role, setRoleState] = useState<string | null>(
        localStorage.getItem(STORAGE_KEYS.USER_ROLE)
    );
    const [empresaId, setEmpresaId] = useState<number | null>(() => {
        const stored = localStorage.getItem(STORAGE_KEYS.EMPRESA_ID);
        return stored ? Number(stored) : null;
    });
    const [veterinarioId, setVeterinarioId] = useState<number | null>(() => {
        const stored = localStorage.getItem(STORAGE_KEYS.VETERINARIO_ID);
        return stored ? Number(stored) : null;
    });
    const [clienteId, setClienteId] = useState<number | null>(() => {
        const stored = localStorage.getItem(STORAGE_KEYS.CLIENTE_ID);
        return stored ? Number(stored) : null;
    });
    const [nombre, setNombre] = useState<string | null>(
        localStorage.getItem(STORAGE_KEYS.USER_NOMBRE)
    );
    const [perfilCompleto, setPerfilCompletoState] = useState<boolean>(
        localStorage.getItem(STORAGE_KEYS.PERFIL_COMPLETO) === "true"
    );
    const [userId, setUserId] = useState<number | null>(() => {
        const stored = localStorage.getItem(STORAGE_KEYS.USER_ID);
        return stored ? Number(stored) : null;
    });

    // H360-SEC-002: el backend exige el correo verificado y esta cuenta aún no lo está.
    const [verificacionPendiente, setVerificacionPendiente] = useState(false);
    const [mensajeVerificacion, setMensajeVerificacion] = useState<string | null>(null);

    // syncComplete: si no hay rol en localStorage, el usuario no está logueado
    // y no hay nada que sincronizar → iniciar en true para no mostrar spinner.
    const [syncComplete, setSyncComplete] = useState(() => {
        return !localStorage.getItem(STORAGE_KEYS.USER_ROLE);
    });

    // ── 1. Leer claims de Auth0 INMEDIATAMENTE ─────────────────────────────
    useEffect(() => {
        if (!isAuthenticated || !user) return;

        const auth0EmpresaId = user[AUTH0_CLAIMS.EMPRESA_ID] || user.empresaId || null;
        const auth0Nombre = user[AUTH0_CLAIMS.NOMBRE] || user.nickname || user.name || null;

        if (auth0EmpresaId) {
            const id = String(auth0EmpresaId);
            localStorage.setItem(STORAGE_KEYS.EMPRESA_ID, id);
            setEmpresaId(Number(auth0EmpresaId));
        }
        if (auth0Nombre) {
            localStorage.setItem(STORAGE_KEYS.USER_NOMBRE, auth0Nombre);
            setNombre(auth0Nombre);
        }
    }, [isAuthenticated, user]);

    // ── 2. Sync con backend ────────────────────────────────────────────────
    useEffect(() => {
        if (!isAuthenticated || !user) {
            // Si Auth0 terminó de cargar y no está autenticado, no hay nada que sincronizar
            if (!isLoading) {
                setSyncComplete(true);
            }
            return;
        }

        const syncWithBackend = async () => {
            try {
                const token = await getAccessTokenSilently();
                const config = { headers: { Authorization: `Bearer ${token}` } };

                const userRes = await api.get("/users/me", config);
                const backendRole = userRes.data.data.rol;
                const backendUserId = userRes.data.data.id;
                const VALID_ROLES = ["CLIENTE", "VETERINARIO", "EMPRESA", "REPARTIDOR", "ADMIN"];

                if (backendUserId) {
                    localStorage.setItem(STORAGE_KEYS.USER_ID, String(backendUserId));
                    setUserId(backendUserId);
                }

                if (backendRole && VALID_ROLES.includes(backendRole)) {
                    localStorage.setItem(STORAGE_KEYS.USER_ROLE, backendRole);
                    setRoleState(backendRole);
                } else if (backendRole) {
                    localStorage.removeItem(STORAGE_KEYS.USER_ROLE);
                    setRoleState(null);
                    localStorage.setItem(STORAGE_KEYS.PERFIL_COMPLETO, "false");
                    setPerfilCompletoState(false);
                }

                // Sin el correo verificado el backend rechaza el resto de rutas: no se sigue cargando el perfil.
                if (userRes.data.data.verificacionPendiente) {
                    setVerificacionPendiente(true);
                    return;
                }

                const hasEntityId =
                    (backendRole === "CLIENTE" && localStorage.getItem(STORAGE_KEYS.CLIENTE_ID)) ||
                    (backendRole === "EMPRESA" && localStorage.getItem(STORAGE_KEYS.EMPRESA_ID)) ||
                    (backendRole === "VETERINARIO" && localStorage.getItem(STORAGE_KEYS.VETERINARIO_ID));
                const perfilIncompleto = localStorage.getItem(STORAGE_KEYS.PERFIL_COMPLETO) !== "true";

                if (!hasEntityId || perfilIncompleto) {
                    try {
                        if (backendRole === "CLIENTE") {
                            const res = await api.get("/clients/me", config);
                            const id = res.data.data?.id;
                            if (id) {
                                localStorage.setItem(STORAGE_KEYS.CLIENTE_ID, String(id));
                                setClienteId(id);
                            }
                        } else if (backendRole === "EMPRESA") {
                            const res = await api.get("/companies/me", config);
                            const id = res.data.data?.id;
                            if (id) {
                                localStorage.setItem(STORAGE_KEYS.EMPRESA_ID, String(id));
                                setEmpresaId(id);
                            }
                        } else if (backendRole === "VETERINARIO") {
                            const res = await api.get("/veterinarians/me", config);
                            const id = res.data.data?.idVeterinario;
                            if (id) {
                                localStorage.setItem(STORAGE_KEYS.VETERINARIO_ID, String(id));
                                setVeterinarioId(id);
                            }
                        } else if (backendRole === "REPARTIDOR") {
                            await api.get("/repartidores/me", config);
                        }

                        if (backendRole) {
                            localStorage.setItem(STORAGE_KEYS.PERFIL_COMPLETO, "true");
                            setPerfilCompletoState(true);
                        }
                    } catch (error: any) {
                        if (error.response?.status === 404 || error.response?.status === 400) {
                            localStorage.setItem(STORAGE_KEYS.PERFIL_COMPLETO, "false");
                            setPerfilCompletoState(false);
                        }
                    }
                }
            } catch (error: any) {
                // Identidad de Auth0 que aún no verificó el correo de una cuenta existente.
                if (error.response?.status === 403 && esCorreoNoVerificado(error.response?.data)) {
                    setMensajeVerificacion(error.response.data.message || null);
                    setVerificacionPendiente(true);
                    return;
                }
                if (error.response?.status === 403 || error.response?.status === 401 || !error.response) {
                    clearAuthStorage();
                    auth0Logout({ logoutParams: { returnTo: window.location.origin } });
                    return;
                }
                console.error("Error sincronizando con el backend:", error);
            } finally {
                setSyncComplete(true);
            }
        };

        syncWithBackend();
    }, [isAuthenticated, user]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Interceptor: inyectar token de Auth0 en requests protegidos ─────
    useEffect(() => {
        const requestInterceptor = api.interceptors.request.use(
            async (config) => {
                const url = config.url || "";
                const method = config.method?.toLowerCase() || "";

                if (!isPublicEndpoint(url, method) && isAuthenticated) {
                    try {
                        const token = await getAccessTokenSilently();
                        config.headers.Authorization = `Bearer ${token}`;
                    } catch (error) {
                        console.error("Error al obtener token de Auth0:", error);
                        clearAuthStorage();
                        auth0Logout({ logoutParams: { returnTo: window.location.origin } });
                        return Promise.reject(error);
                    }
                }

                return config;
            }
        );

        return () => {
            api.interceptors.request.eject(requestInterceptor);
        };
    }, [getAccessTokenSilently, isAuthenticated]);

    // ── Correo sin verificar detectado en cualquier petición (api.ts) ───
    useEffect(() => {
        const alDetectar = (e: Event) => {
            const mensaje = (e as CustomEvent<{ mensaje?: string }>).detail?.mensaje;
            if (mensaje) setMensajeVerificacion(mensaje);
            setVerificacionPendiente(true);
        };
        window.addEventListener(EVENTO_CORREO_NO_VERIFICADO, alDetectar);
        return () => window.removeEventListener(EVENTO_CORREO_NO_VERIFICADO, alDetectar);
    }, []);

    const reenviarVerificacion = useCallback(async () => {
        try {
            const res = await api.post("/auth/resend-verification");
            return (res.data?.message as string) || "Te enviamos un nuevo enlace. Revisa tu correo.";
        } catch (error: any) {
            throw new Error(error.response?.data?.message || "No pudimos reenviar el enlace. Inténtalo más tarde.");
        }
    }, []);

    // Auth0 solo marca el correo como verificado en un token nuevo: se pide sin caché.
    const comprobarVerificacion = useCallback(async () => {
        try {
            const token = await getAccessTokenSilently({ cacheMode: "off" });
            const res = await api.get("/users/me", { headers: { Authorization: `Bearer ${token}` } });
            if (res.data.data.verificacionPendiente) return false;
        } catch (error: any) {
            if (error.response?.status === 403 && esCorreoNoVerificado(error.response?.data)) return false;
            throw error;
        }
        // Recarga para hacer la sincronización completa (rol, perfil) con la cuenta ya verificada.
        window.location.reload();
        return true;
    }, [getAccessTokenSilently]);

    // ── Auth actions ────────────────────────────────────────────────────
    const login = useCallback(() => {
        loginWithRedirect();
    }, [loginWithRedirect]);

    const logout = useCallback(() => {
        setSyncComplete(false);
        clearAuthStorage();
        auth0Logout({ logoutParams: { returnTo: window.location.origin } });
    }, [auth0Logout]);

    const setPerfilCompleto = useCallback((value: boolean) => {
        localStorage.setItem(STORAGE_KEYS.PERFIL_COMPLETO, String(value));
        setPerfilCompletoState(value);
    }, []);

    const setRole = useCallback((newRole: string) => {
        localStorage.setItem(STORAGE_KEYS.USER_ROLE, newRole);
        setRoleState(newRole);
    }, []);

    const setEmpresaIdSafe = useCallback((id: number) => {
        localStorage.setItem(STORAGE_KEYS.EMPRESA_ID, String(id));
        setEmpresaId(id);
    }, []);

    const setVeterinarioIdSafe = useCallback((id: number) => {
        localStorage.setItem(STORAGE_KEYS.VETERINARIO_ID, String(id));
        setVeterinarioId(id);
    }, []);

    const setClienteIdSafe = useCallback((id: number) => {
        localStorage.setItem(STORAGE_KEYS.CLIENTE_ID, String(id));
        setClienteId(id);
    }, []);

    // ── Loading states ──────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-500 animate-pulse font-medium">Validando sesión...</p>
            </div>
        );
    }

    if (!syncComplete) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-500 animate-pulse font-medium">Sincronizando...</p>
            </div>
        );
    }

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                isLoading,
                role,
                userId,
                empresaId,
                veterinarioId,
                clienteId,
                nombre,
                perfilCompleto,
                login,
                logout,
                setPerfilCompleto,
                setRole,
                setEmpresaId: setEmpresaIdSafe,
                setVeterinarioId: setVeterinarioIdSafe,
                setClienteId: setClienteIdSafe,
            }}
        >
            {isAuthenticated && verificacionPendiente ? (
                <VerificarCorreoPantalla
                    correo={user?.email}
                    mensaje={mensajeVerificacion}
                    onReenviar={reenviarVerificacion}
                    onYaVerifique={comprobarVerificacion}
                    onCerrarSesion={logout}
                />
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};
