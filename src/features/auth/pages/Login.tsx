import { Link, Navigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { Button } from "../../../components/ui/Button";
import { useAuth } from "../context/useAuth";
import { getRedirectByRole } from "../services/authRedirect";

export const Login = () => {
  const { login, isAuthenticated, role, perfilCompleto } = useAuth();
  const [searchParams] = useSearchParams();

  // Validar nextUrl para prevenir open redirect
  const rawNext = searchParams.get("next");
  const nextUrl = rawNext && rawNext.startsWith("/") && !rawNext.includes("://")
    ? rawNext
    : undefined;

  // Si ya está autenticado con perfil completo → al portal
  if (isAuthenticated && role && perfilCompleto) {
    return <Navigate to={nextUrl || getRedirectByRole(role)} replace />;
  }

  // Si está autenticado pero SIN perfil completo → depende de si ya eligió rol
  if (isAuthenticated && !perfilCompleto) {
    // Si no tiene rol (usuario nuevo), mandarlo a elegir rol
    if (!role) {
      return <Navigate to="/register/rol" replace />;
    }
    // Si ya tiene un rol, mandarlo a crear su perfil
    return <Navigate to={`/register/perfil/${role.toLowerCase()}`} replace />;
  }

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row">
      {/* ── LADO IZQUIERDO: Branding ── */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-60"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-transparent to-transparent" />

        <div className="relative z-10 flex flex-col justify-end p-16 h-full w-full">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6 text-white">
              <img
                src="/LOGO HUELLA360_logo primario.png"
                alt="Logo Huella360"
                className="h-12 w-auto object-contain"
              />
              <span className="text-4xl font-bold tracking-tight">Huella360</span>
            </div>
            <blockquote className="text-white text-2xl font-medium leading-relaxed max-w-lg italic">
              "El ecosistema más eficiente para profesionales modernos del
              cuidado animal. Optimiza tu clínica hoy mismo."
            </blockquote>
          </div>
        </div>
      </div>

      {/* ── LADO DERECHO: Formulario ── */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center p-8 sm:p-12 lg:p-24 bg-white relative">
        {/* Botón volver */}
        <div className="absolute top-8 right-8 md:top-12 md:right-12">
          <Link to="/">
            <Button variant="outline" className="min-w-21 h-10 px-4 text-sm">
              <ArrowLeft size={16} />
              Volver al inicio
            </Button>
          </Link>
        </div>

        {/* Logo móvil */}
        <div className="lg:hidden mb-12">
          <div className="flex items-center gap-2 text-slate-900">
            <img
              src="/LOGO HUELLA360_logo primario.png"
              alt="Logo Huella360"
              className="h-8 w-auto object-contain"
            />
            <span className="text-2xl font-bold">Huella360</span>
          </div>
        </div>

        <div className="w-full max-w-md space-y-8 text-center lg:text-left">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Bienvenido de nuevo
            </h1>
            <p className="mt-3 text-slate-500">
              Accede a tu plataforma de forma segura.
            </p>
          </div>

          <div className="mt-10 space-y-6">
            <Button
              onClick={login}
              variant="primary"
              className="w-full py-4 text-base font-bold rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            >
              Iniciar Sesión Seguro
            </Button>
          </div>

          {/* Separador */}
          <div className="relative mt-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
          </div>

          <p className="mt-10 text-center text-sm text-slate-500">
            ¿No tienes una cuenta?{" "}
            <Link to="/register" className="font-bold text-primary hover:underline">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};