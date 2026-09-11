import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";

export const CTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-secondary w-full">
      <motion.div
        className="max-w-4xl mx-auto px-6 text-center"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6">
          Tu mascota merece el cuidado del futuro
        </h2>
        <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto font-medium">
          Únete gratis. Es rápido, seguro y tu mascota te lo agradecerá.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate("/register")}
            className="bg-primary text-white px-8 py-4 rounded-full font-bold hover:bg-primary-dark hover:scale-105 transition-all duration-300 shadow-lg text-lg"
          >
            Empezar ahora
          </button>
          <button
            onClick={() => navigate("/contacto")}
            className="bg-transparent border-2 border-white/30 text-white px-8 py-4 rounded-full font-bold hover:bg-white/10 transition-all duration-300 text-lg"
          >
            Hablar con ventas
          </button>
        </div>
      </motion.div>
    </section>
  );
};
