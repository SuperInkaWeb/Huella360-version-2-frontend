import { motion } from "motion/react";
import { Shield, Clock, ShoppingCart, Brain } from "lucide-react";

const PROPS = [
  {
    icon: Shield,
    title: "100% Digital",
    description: "Carnet de vacunación y historial clínico siempre accesibles",
  },
  {
    icon: Clock,
    title: "Disponible 24/7",
    description: "Teleconsultas cuando tu mascota lo necesite",
  },
  {
    icon: ShoppingCart,
    title: "Marketplace Integrado",
    description: "Productos y servicios recomendados por tu veterinario",
  },
  {
    icon: Brain,
    title: "Alertas con IA",
    description: "Análisis inteligente del estado de salud de tu mascota",
  },
];

export const Stats = () => {
  return (
    <section className="py-16 bg-secondary w-full">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {PROPS.map((prop) => {
            const Icon = prop.icon;
            return (
              <div key={prop.title} className="text-center">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                  <Icon size={22} className="text-primary" />
                </div>
                <p className="text-white font-bold text-base mb-1">{prop.title}</p>
                <p className="text-white/50 text-sm leading-relaxed">{prop.description}</p>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
