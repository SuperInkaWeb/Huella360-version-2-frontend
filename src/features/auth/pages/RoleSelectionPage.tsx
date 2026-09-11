import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { User, Stethoscope, Building2, Truck, Check, Loader2 } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { useAuth } from "../context/useAuth";
import { useAuth0 } from "@auth0/auth0-react";
import { api } from "../../../shared/http/api";

type RoleId = "CLIENTE" | "VETERINARIO" | "EMPRESA" | "REPARTIDOR";

const roles: {
  id: RoleId;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
}[] = [
  {
    id: "CLIENTE",
    label: "Cliente",
    description: "Accede a servicios veterinarios, compra productos y gestiona el bienestar de tus mascotas.",
    icon: User,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-400",
  },
  {
    id: "VETERINARIO",
    label: "Veterinario",
    description: "Gestiona tus citas, pacientes y servicios profesionales desde un panel especializado.",
    icon: Stethoscope,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-400",
  },
  {
    id: "EMPRESA",
    label: "Empresa / Clínica",
    description: "Administra tu clínica, equipo veterinario, productos y suscripciones en un solo lugar.",
    icon: Building2,
    color: "text-violet-600",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-400",
  },
  {
    id: "REPARTIDOR",
    label: "Repartidor",
    description: "Gestiona tus entregas, rutas y estado de pedidos de forma eficiente.",
    icon: Truck,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-400",
  },
];

const PORTALS: Record<string, string> = {
  CLIENTE: "/portal/cliente",
  VETERINARIO: "/portal/veterinario",
  EMPRESA: "/portal/empresa",
  REPARTIDOR: "/portal/repartidor",
  ADMIN: "/portal/admin",
};

export const RoleSelectionPage = () => {
  const { isAuthenticated, role, perfilCompleto, setRole, setPerfilCompleto } = useAuth();
  const { getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<RoleId | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingRole, setIsCheckingRole] = useState(!role);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (role || !isAuthenticated) {
      if (role) setIsCheckingRole(false);
      return;
    }

    const fetchBackendRole = async () => {
      try {
        const token = await getAccessTokenSilently();
        const headers = { Authorization: `Bearer ${token}` };
        const res = await api.get("/users/me", { headers });
        const backendRole = res.data?.data?.rol;
        const VALID_ROLES = ["CLIENTE", "VETERINARIO", "EMPRESA", "REPARTIDOR", "ADMIN"];

        if (backendRole && VALID_ROLES.includes(backendRole)) {
          localStorage.setItem("userRole", backendRole);
          setRole(backendRole);

          if (localStorage.getItem("perfilCompleto") !== "true") {
            try {
              if (backendRole === "CLIENTE") await api.get("/clients/me", { headers });
              else if (backendRole === "EMPRESA") await api.get("/companies/me", { headers });
              else if (backendRole === "VETERINARIO") await api.get("/veterinarians/me", { headers });
              else if (backendRole === "REPARTIDOR") await api.get("/repartidores/me", { headers });
              setPerfilCompleto(true);
            } catch {
              setPerfilCompleto(false);
            }
          }
        }
      } catch {
        // If we can't reach backend, just show the role selection
      } finally {
        setIsCheckingRole(false);
      }
    };

    fetchBackendRole();
  }, [role, isAuthenticated, getAccessTokenSilently, setRole, setPerfilCompleto]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isCheckingRole) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <Loader2 size={32} className="animate-spin text-slate-400 mb-4" />
        <p className="text-slate-500 text-sm">Verificando tu cuenta...</p>
      </div>
    );
  }

  if (perfilCompleto && role) {
    return <Navigate to={PORTALS[role] ?? "/"} replace />;
  }

  if (role) {
    return <Navigate to={`/register/perfil/${role.toLowerCase()}`} replace />;
  }

  const handleConfirm = async () => {
    if (!selectedRole) return;
    setIsLoading(true);
    setError(null);

    try {
      const token = await getAccessTokenSilently();
      const config = { headers: { Authorization: `Bearer ${token}` } };

      await api.patch("/users/me/role", { rol: selectedRole }, config);

      const userRes = await api.get("/users/me", config);
      const backendRole = userRes.data.data.rol;

      const finalRole = backendRole || selectedRole;
      setRole(finalRole);

      navigate(`/register/perfil/${finalRole.toLowerCase()}`, { replace: true });

    } catch (err: any) {
      if (err?.response?.status === 409) {
        const backendRole = err.response?.data?.message?.match(/como (\w+)/)?.[1];
        if (backendRole && PORTALS[backendRole]) {
          setRole(backendRole);
          navigate(`/register/perfil/${backendRole.toLowerCase()}`, { replace: true });
          return;
        }
      }
      const msg = err?.response?.data?.message || "Error al guardar el rol. Inténtalo de nuevo.";
      setError(msg);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-6">
            <img
              src="/LOGO HUELLA360_logo primario.png"
              alt="Logo Huella360"
              className="h-10 w-auto object-contain"
            />
            <span className="text-2xl font-bold text-slate-900">Huella360</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            ¿Cómo usarás la plataforma?
          </h1>
          <p className="text-slate-500 text-base">
            Elige el tipo de cuenta. Esta selección define tu experiencia en la plataforma.
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {roles.map((r) => {
            const Icon = r.icon;
            const isSelected = selectedRole === r.id;
            return (
              <button
                key={r.id}
                id={`role-select-${r.id.toLowerCase()}`}
                onClick={() => setSelectedRole(r.id)}
                disabled={isLoading}
                className={`relative flex flex-col gap-3 p-5 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer group
                  ${isSelected
                    ? `${r.bgColor} ${r.borderColor} shadow-lg scale-[1.02]`
                    : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
                  }
                  disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                {isSelected && (
                  <span className={`absolute top-4 right-4 ${r.color} bg-white rounded-full p-0.5`}>
                    <Check size={15} strokeWidth={3} />
                  </span>
                )}

                <span className={`w-11 h-11 rounded-xl flex items-center justify-center
                  ${isSelected ? `${r.bgColor} ${r.color}` : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"}`}>
                  <Icon size={22} />
                </span>

                <div>
                  <p className={`font-bold text-base ${isSelected ? r.color : "text-slate-800"}`}>
                    {r.label}
                  </p>
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                    {r.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {error && (
          <p className="text-center text-sm text-red-500 mb-4">{error}</p>
        )}

        <Button
          id="btn-confirm-role"
          onClick={handleConfirm}
          disabled={!selectedRole || isLoading}
          variant="primary"
          className="w-full py-4 text-base font-bold rounded-2xl shadow-lg shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Guardando...
            </>
          ) : selectedRole ? (
            `Continuar como ${roles.find((r) => r.id === selectedRole)?.label}`
          ) : (
            "Selecciona un tipo de cuenta para continuar"
          )}
        </Button>

        <p className="text-center text-xs text-slate-400 mt-4">
          Podrás completar tu perfil en el siguiente paso.
        </p>
      </div>
    </div>
  );
};
