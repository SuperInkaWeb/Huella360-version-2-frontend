import { useEffect } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "../../../components/ui/Button";
import { useAuth } from "../context/useAuth";

export const Register = () => {
  const { loginWithRedirect } = useAuth0();
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) sessionStorage.setItem("pendingReferralCode", ref);
  }, [searchParams]);

  // Si ya está autenticado, redirigir al selector de rol
  if (isAuthenticated) {
    return <Navigate to="/register/rol" replace />;
  }

  const handleRegisterClick = () => {
    loginWithRedirect({
      authorizationParams: {
        screen_hint: "signup",
      },
    });
  };

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row">
      {/* ── LADO IZQUIERDO: Branding ── */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-60"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80')",
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
              "Únete a la red veterinaria más avanzada. Una cuenta, un ecosistema completo para ti y tus mascotas."
            </blockquote>
          </div>
        </div>
      </div>

      {/* ── LADO DERECHO ── */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center p-8 sm:p-12 lg:p-24 bg-white relative">
        <div className="absolute top-8 right-8 md:top-12 md:right-12">
          <Link to="/">
            <Button variant="outline" className="min-w-21 h-10 px-4 text-sm">
              <ArrowLeft size={16} /> Volver
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

        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Crea tu cuenta gratis
            </h1>
            <p className="mt-3 text-slate-500">
              Regístrate de forma segura con Auth0. Luego podrás elegir tu tipo de cuenta.
            </p>
          </div>

          <div className="mt-10 space-y-6">
            <Button
              id="btn-register"
              onClick={handleRegisterClick}
              variant="primary"
              className="w-full py-4 text-base font-bold rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            >
              Registrarme de Forma Segura
            </Button>
          </div>

          <p className="mt-10 text-center text-sm text-slate-500">
            ¿Ya tienes una cuenta?{" "}
            <Link to="/login" className="font-bold text-primary hover:underline">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};