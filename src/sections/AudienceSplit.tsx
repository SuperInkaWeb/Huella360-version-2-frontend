import { motion } from "motion/react";
import { CheckCircle2, ArrowRight, FileText, Calendar, Bell, Shield, Stethoscope, BarChart3, Store, TrendingUp, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AUDIENCES = [
  {
    id: "duenos",
    tagline: "",
    title: "Tranquilidad total, en la palma de tu mano.",
    features: [
      "Carnet de vacunación 100% digital",
      "Alertas de medicación y control de peso",
      "Chat directo con tu clínica veterinaria",
      "Acceso a red de especialistas validados",
    ],
    cta: "Explorar funciones para dueños",
    link: "/register",
    bg: "bg-white",
    image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&q=80",
    imageAlt: "Persona con su mascota",
    mockup: "owner",
  },
  {
    id: "veterinarios",
    tagline: "Más popular",
    title: "Enfócate en curar, nosotros en administrar.",
    features: [
      "Historias clínicas estandarizadas y seguras",
      "Gestión inteligente de agenda y citas",
      "Facturación automatizada e inventario",
      "Asistente IA para diagnósticos presuntivos",
    ],
    cta: "Descubre el software clínico",
    link: "/register",
    bg: "bg-background",
    image: "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=600&q=80",
    imageAlt: "Veterinario en clínica",
    mockup: "vet",
  },
  {
    id: "negocios",
    tagline: "",
    title: "Expande tu alcance en el mercado ideal.",
    features: [
      "Tienda online integrada en minutos",
      "Visibilidad directa ante miles de dueños",
      "Campañas segmentadas por raza y necesidades",
      "Logística y pasarela de pagos centralizada",
    ],
    cta: "Únete al marketplace",
    link: "/register",
    bg: "bg-white",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80",
    imageAlt: "Tienda de mascotas",
    mockup: "business",
  },
];

const OwnerMockup = () => (
  <div className="absolute bottom-4 left-4 right-4 bg-white rounded-xl shadow-xl border border-slate-100 p-4">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
        <FileText size={18} className="text-primary" />
      </div>
      <div>
        <p className="text-xs font-bold text-text-primary">Historial de Max</p>
        <p className="text-[10px] text-text-secondary">Golden Retriever · 3 años</p>
      </div>
      <span className="ml-auto text-[9px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">IA</span>
    </div>
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-[11px] text-text-secondary">
        <Bell size={12} className="text-yellow-500" />
        <span>Próxima vacuna: 20 Jul</span>
      </div>
      <div className="flex items-center gap-2 text-[11px] text-text-secondary">
        <Calendar size={12} className="text-blue-500" />
        <span>Cita con Dr. Martínez: 10:00 AM</span>
      </div>
      <div className="flex items-center gap-2 text-[11px] text-green-600">
        <Shield size={12} />
        <span className="font-medium">Vacunas al día</span>
      </div>
    </div>
  </div>
);

const VetMockup = () => (
  <div className="absolute inset-4 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden">
    <div className="h-8 bg-slate-50 border-b border-slate-100 flex items-center px-3 gap-2">
      <div className="w-3 h-3 rounded-full bg-red-300" />
      <div className="w-3 h-3 rounded-full bg-yellow-300" />
      <div className="w-3 h-3 rounded-full bg-green-300" />
      <div className="ml-2 text-[9px] font-medium text-slate-400">Huella360 Vet</div>
    </div>
    <div className="p-3 grid grid-cols-3 gap-2 h-[calc(100%-2rem)]">
      <div className="col-span-2 space-y-2">
        <div className="bg-slate-50 rounded-lg p-2 border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <Stethoscope size={10} className="text-primary" />
            <span className="text-[9px] font-bold text-text-primary">Próximas citas</span>
          </div>
          <div className="space-y-1">
            {["9:00 - Max (Golden)", "10:30 - Luna (Gato)", "14:00 - Rocky (Bulldog)"].map((c) => (
              <div key={c} className="text-[8px] text-text-secondary bg-white rounded px-2 py-1 border border-slate-50">{c}</div>
            ))}
          </div>
        </div>
        <div className="bg-slate-50 rounded-lg p-2 border border-slate-100">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 size={10} className="text-primary" />
            <span className="text-[9px] font-bold text-text-primary">Resumen del mes</span>
          </div>
          <div className="flex gap-2">
            <div className="text-center"><p className="text-[11px] font-black text-primary">48</p><p className="text-[7px] text-text-secondary">Consultas</p></div>
            <div className="text-center"><p className="text-[11px] font-black text-primary">12</p><p className="text-[7px] text-text-secondary">Cirugías</p></div>
            <div className="text-center"><p className="text-[11px] font-black text-primary">S/8.5k</p><p className="text-[7px] text-text-secondary">Ingresos</p></div>
          </div>
        </div>
      </div>
      <div className="bg-slate-50 rounded-lg p-2 border border-slate-100">
        <div className="flex items-center gap-1 mb-2">
          <Users size={10} className="text-primary" />
          <span className="text-[9px] font-bold text-text-primary">Pacientes</span>
        </div>
        <div className="space-y-1">
          {["Max", "Luna", "Rocky", "Toby", "Nina"].map((n) => (
            <div key={n} className="flex items-center gap-1">
              <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center text-[6px] font-bold text-primary">{n[0]}</div>
              <span className="text-[8px] text-text-secondary">{n}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const BusinessMockup = () => (
  <div className="absolute inset-4 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden">
    <div className="h-8 bg-slate-50 border-b border-slate-100 flex items-center px-3 gap-2">
      <Store size={10} className="text-primary" />
      <span className="text-[9px] font-bold text-text-primary">Mi Tienda</span>
    </div>
    <div className="p-3 space-y-2">
      <div className="flex gap-2">
        <div className="flex-1 bg-primary/5 rounded-lg p-2 border border-primary/10">
          <p className="text-[8px] text-text-secondary mb-0.5">Visitas hoy</p>
          <p className="text-[13px] font-black text-primary">234</p>
          <div className="flex items-center gap-0.5 mt-0.5">
            <TrendingUp size={8} className="text-green-500" />
            <span className="text-[7px] text-green-600 font-medium">+12%</span>
          </div>
        </div>
        <div className="flex-1 bg-primary/5 rounded-lg p-2 border border-primary/10">
          <p className="text-[8px] text-text-secondary mb-0.5">Ventas</p>
          <p className="text-[13px] font-black text-primary">S/1,850</p>
          <div className="flex items-center gap-0.5 mt-0.5">
            <TrendingUp size={8} className="text-green-500" />
            <span className="text-[7px] text-green-600 font-medium">+8%</span>
          </div>
        </div>
      </div>
      <div className="bg-slate-50 rounded-lg p-2 border border-slate-100">
        <p className="text-[9px] font-bold text-text-primary mb-1">Productos destacados</p>
        <div className="space-y-1">
          {["Alimento Premium DogChow", "Juguete interactivo Kong", "Shampoo dermatológico"].map((p) => (
            <div key={p} className="flex items-center justify-between text-[8px]">
              <span className="text-text-secondary">{p}</span>
              <span className="font-bold text-primary">45 vendidos</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const MOCKUPS: Record<string, React.FC> = {
  owner: OwnerMockup,
  vet: VetMockup,
  business: BusinessMockup,
};

export const AudienceSplit = () => {
  const navigate = useNavigate();

  return (
    <>
      {AUDIENCES.map((audience, index) => {
        const isEven = index % 2 === 0;
        const MockupComponent = MOCKUPS[audience.mockup];

        return (
          <section
            key={audience.id}
            id={audience.id}
            className={`py-24 ${audience.bg} w-full overflow-hidden`}
          >
            <div className="max-w-7xl mx-auto px-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <motion.div
                  className={`relative ${isEven ? "order-2 lg:order-1" : ""}`}
                  initial={{ opacity: 0, x: isEven ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden relative">
                    <img
                      src={audience.image}
                      alt={audience.imageAlt}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    <MockupComponent />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: isEven ? 30 : -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  {audience.tagline && (
                    <span className="text-sm font-bold text-primary tracking-widest uppercase mb-4 block">
                      {audience.tagline}
                    </span>
                  )}
                  <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-6 leading-tight">
                    {audience.title}
                  </h2>
                  <ul className="space-y-4 mb-8">
                    {audience.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <CheckCircle2 className="text-primary mt-0.5 shrink-0" size={20} />
                        <span className="text-text-secondary leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => navigate(audience.link)}
                    className="inline-flex items-center gap-2 font-semibold text-primary hover:text-primary-dark transition-colors"
                  >
                    {audience.cta}
                    <ArrowRight size={18} />
                  </button>
                </motion.div>
              </div>
            </div>
          </section>
        );
      })}
    </>
  );
};
