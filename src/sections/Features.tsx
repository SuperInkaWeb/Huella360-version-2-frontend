import { motion } from "motion/react";
import {
  FileText,
  Video,
  Bell,
  Store,
  BarChart3,
  Gift,
} from "lucide-react";

const FEATURES = [
  {
    icon: FileText,
    title: "Historial Clínico IA",
    description:
      "Análisis predictivo de la salud de tu mascota basado en datos históricos y biométricos.",
  },
  {
    icon: Video,
    title: "Teleconsultas por Video",
    description:
      "Conéctate con especialistas desde casa para consultas rápidas y seguimiento de tratamientos.",
  },
  {
    icon: Bell,
    title: "Recordatorios Inteligentes",
    description:
      "Nunca olvides una vacuna o desparasitación con alertas automatizadas vía app o WhatsApp.",
  },
  {
    icon: Store,
    title: "Marketplace Integrado",
    description:
      "Compra medicamentos, alimentos premium y accesorios recomendados directamente por tu veterinario.",
  },
  {
    icon: BarChart3,
    title: "Dashboard en Tiempo Real",
    description:
      "Visualiza estadísticas vitales, gastos y métricas de salud en una interfaz intuitiva.",
  },
  {
    icon: Gift,
    title: "Gamificación y Recompensas",
    description:
      "Gana puntos por mantener al día la salud de tu mascota y canjéalos por beneficios exclusivos.",
  },
];

export const Features = () => {
  return (
    <section id="features" className="py-24 md:py-32 bg-background w-full">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          className="text-center max-w-2xl mx-auto mb-20"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
            Todo lo que necesitas
          </h2>
          <p className="text-lg text-text-secondary">
            Un ecosistema diseñado para simplificar el cuidado veterinario,
            conectando a todos los actores clave con tecnología de punta.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                className="bg-white rounded-2xl p-8 card-hover border border-border shadow-sm"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 feature-icon-wrapper">
                  <Icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-3">
                  {feature.title}
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
