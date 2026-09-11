import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="pt-28 pb-20 md:pt-36 md:pb-28">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-text-primary tracking-tight leading-[1.15] mb-6">
              El cuidado de tu mascota, merece{" "}
              <span className="text-primary">360°</span> de atención.
            </h1>

            <p className="text-lg text-text-secondary mb-8 max-w-lg leading-relaxed">
              Historial clínico inteligente, teleconsultas con IA y un marketplace
              integral — todo en una sola plataforma.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate("/register")}
                className="inline-flex items-center justify-center gap-2 bg-primary text-white px-8 py-4 rounded-full font-semibold hover:bg-primary-dark hover:shadow-lg transition-all duration-300"
              >
                Comenzar gratis
                <ArrowRight size={18} />
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById("features");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex items-center justify-center gap-2 bg-white border-2 border-border text-text-primary px-8 py-4 rounded-full font-semibold hover:border-primary hover:text-primary transition-all duration-300"
              >
                Conoce más
              </button>
            </div>
          </motion.div>

          <motion.div
            className="relative hidden lg:block"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="aspect-4/3 rounded-2xl overflow-hidden shadow-xl">
              <img
                alt="Veterinario atendiendo una mascota"
                className="w-full h-full object-cover"
                src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80"
                loading="eager"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
