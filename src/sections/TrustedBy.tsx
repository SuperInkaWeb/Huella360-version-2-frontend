import { PawPrint, Stethoscope, Store, ShieldCheck, HeartPulse } from "lucide-react";

const FEATURES = [
  { icon: PawPrint, label: "Gestión de Mascotas" },
  { icon: Stethoscope, label: "Historial Clínico" },
  { icon: Store, label: "Marketplace" },
  { icon: ShieldCheck, label: "Teleconsultas" },
  { icon: HeartPulse, label: "Alertas de Salud" },
];

export const TrustedBy = () => {
  return (
    <section className="py-14 border-y border-border bg-white">
      <div className="px-6 text-center">
        <p className="text-xs font-semibold text-text-secondary tracking-widest uppercase mb-8">
          Todo lo que necesitas en una sola plataforma
        </p>
        <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-5">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.label}
                className="flex items-center gap-2 text-slate-400 hover:text-secondary transition-colors duration-300"
              >
                <Icon size={20} strokeWidth={2} />
                <span className="text-sm font-bold tracking-tight">{f.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
