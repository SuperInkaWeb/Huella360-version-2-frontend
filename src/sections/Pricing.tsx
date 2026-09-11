import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/context/useAuth";

interface Plan {
  nombre: string;
  description: string;
  price: string;
  period: string;
  features: string[];
  popular?: boolean;
}

const B2C_PLANS: Plan[] = [
  {
    nombre: "Básica",
    description: "Lo esencial para empezar.",
    price: "Gratis",
    period: "",
    features: [
      "1 mascota registrada",
      "Historial básico",
      "Recordatorios de vacunas",
    ],
  },
  {
    nombre: "Care",
    description: "Protección completa mensual.",
    price: "S/14.90",
    period: "/mes",
    features: [
      "Hasta 3 mascotas",
      "Historial clínico completo",
      "1 Teleconsulta gratis al mes",
      "Descuentos en marketplace",
    ],
    popular: true,
  },
  {
    nombre: "Premium",
    description: "Para familias multiespecie.",
    price: "S/29.90",
    period: "/mes",
    features: [
      "Mascotas ilimitadas",
      "Teleconsultas 24/7 ilimitadas",
      "Envíos gratis en tienda",
      "Asesoría nutricional IA",
    ],
  },
];

const B2B_PLANS: Plan[] = [
  {
    nombre: "Free B2B",
    description: "Presencia básica gratis.",
    price: "Gratis",
    period: "",
    features: [
      "Perfil público básico",
      "Hasta 4 servicios/productos",
      "Formulario de contacto",
      "Aparece en el directorio",
    ],
  },
  {
    nombre: "Starter",
    description: "Crece desde el primer día.",
    price: "S/49",
    period: "/mes",
    features: [
      "Perfil profesional destacado",
      "Agenda de citas online",
      "Hasta 30 productos/servicios",
      "Acceso a leads en tu zona",
    ],
    popular: true,
  },
  {
    nombre: "Pro",
    description: "Acelera tu crecimiento.",
    price: "S/129",
    period: "/mes",
    features: [
      "Productos/servicios ilimitados",
      "Tienda online marketplace",
      "Marketing automatizado",
      "Soporte prioritario",
    ],
  },
];

export const Pricing = () => {
  const [activeTab, setActiveTab] = useState<"b2c" | "b2b">("b2c");
  const { isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const plans = activeTab === "b2c" ? B2C_PLANS : B2B_PLANS;

  const handleCta = (_plan: Plan) => {
    if (!isAuthenticated) {
      navigate("/register");
      return;
    }
    // Usuario logueado: redirigir a su portal de suscripción según su rol
    if (role === "CLIENTE") {
      navigate("/portal/cliente/suscripcion");
    } else if (role === "EMPRESA") {
      navigate("/portal/empresa/suscripcion");
    } else if (role === "VETERINARIO") {
      navigate("/portal/veterinario/suscripcion");
    } else {
      navigate("/register");
    }
  };

  return (
    <section id="pricing" className="py-24 md:py-32 bg-background w-full">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          className="text-center max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
            Planes diseñados para ti
          </h2>
          <p className="text-lg text-text-secondary mb-8">
            Comienza gratis y mejora según las necesidades de tu mascota o negocio.
          </p>

          <div className="inline-flex bg-slate-200/50 p-1 rounded-full">
            <button
              onClick={() => setActiveTab("b2c")}
              className={`px-6 py-2.5 text-sm font-bold rounded-full transition-all duration-200 ${
                activeTab === "b2c"
                  ? "bg-white text-text-primary shadow-sm border border-slate-200"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Dueños de Mascotas
            </button>
            <button
              onClick={() => setActiveTab("b2b")}
              className={`px-6 py-2.5 text-sm font-bold rounded-full transition-all duration-200 ${
                activeTab === "b2b"
                  ? "bg-white text-text-primary shadow-sm border border-slate-200"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Negocios & Clínicas
            </button>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {plans.map((plan) => (
              <div
                key={plan.nombre}
                className={`rounded-3xl p-8 border shadow-sm flex flex-col ${
                  plan.popular
                    ? "bg-primary border-primary-dark shadow-xl md:-translate-y-4 relative"
                    : "bg-white border-border card-hover"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-secondary-bold text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    Popular
                  </div>
                )}

                <h3 className={`text-xl font-bold mb-2 ${plan.popular ? "text-white" : "text-text-primary"}`}>
                  {plan.nombre}
                </h3>
                <p className={`text-sm mb-6 ${plan.popular ? "text-white/80" : "text-text-secondary"}`}>
                  {plan.description}
                </p>

                <div className="mb-8">
                  <span className={`text-4xl font-black ${plan.popular ? "text-white" : "text-text-primary"}`}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className={plan.popular ? "text-white/70" : "text-text-secondary"}>
                      {plan.period}
                    </span>
                  )}
                </div>

                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className={`flex items-center gap-3 text-sm ${plan.popular ? "text-white" : "text-text-secondary"}`}>
                      <Check size={16} className={plan.popular ? "text-white" : "text-primary"} />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleCta(plan)}
                  className={`w-full py-3 px-4 rounded-xl font-bold transition-colors ${
                    plan.popular
                      ? "bg-white text-primary hover:bg-slate-50"
                      : "border-2 border-slate-200 text-text-primary hover:border-primary hover:text-primary"
                  }`}
                >
                  {plan.price === "Gratis" ? "Crear cuenta" : `Elegir ${plan.nombre}`}
                </button>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};
