import { motion } from "motion/react";
import { Star } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Laura Gómez",
    role: "Dueña de un Golden Retriever",
    text: '"Gracias a Huella360, detectamos un problema de peso en Max antes de que fuera grave. Las alertas y el historial en mi celular me dan mucha paz."',
    avatar: "LG",
  },
  {
    name: "Dr. Carlos Mendoza",
    role: "Director VetClinic San Borja",
    text: '"El software clínico nos ha ahorrado horas de papeleo semanal. Poder enviar el carnet digital directamente al dueño es un game changer."',
    avatar: "CM",
  },
  {
    name: "Ana Silva",
    role: "Gerente PetStore Lima",
    text: '"Desde que subimos nuestros productos al marketplace de Huella360, las ventas de alimentos premium subieron un 40%. La plataforma es súper intuitiva."',
    avatar: "AS",
  },
];

export const Testimonials = () => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="text-4xl font-bold text-text-primary">
            Lo que dice nuestra comunidad
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              className="bg-background rounded-2xl p-8 border border-border"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex gap-1 mb-4 text-yellow-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={18} className="fill-yellow-400" />
                ))}
              </div>
              <p className="text-text-secondary italic mb-6 leading-relaxed">
                {t.text}
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                  {t.avatar}
                </div>
                <div>
                  <p className="font-bold text-text-primary">{t.name}</p>
                  <p className="text-sm text-text-secondary">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
