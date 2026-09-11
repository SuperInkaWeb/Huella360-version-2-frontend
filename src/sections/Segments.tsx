import {
  PawPrint,
  Stethoscope,
  Store,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";

interface Segment {
  icon: LucideIcon;
  title: string;
  description: string;
  cta: string;
  href: string;
  featured?: boolean;
}

const SEGMENTS: Segment[] = [
  {
    icon: PawPrint,
    title: "Dueños de Mascotas",
    description:
      "Centraliza todas las historias clínicas de tu mascota en un solo lugar. Reserva citas al instante y recibe recordatorios.",
    cta: "Saber más",
    href: "#duenos",
  },
  {
    icon: Stethoscope,
    title: "Veterinarios",
    description:
      "Sistema de gestión clínica integral (PMS). Administra pacientes, expedientes clínicos y recetas desde un único panel.",
    cta: "Ver funcionalidades",
    href: "#veterinarios",
    featured: true,
  },
  {
    icon: Store,
    title: "Negocios y Proveedores",
    description:
      "Amplía tu alcance. Publica tus productos en nuestro marketplace integrado y gestiona tu inventario en tiempo real.",
    cta: "Empieza a vender",
    href: "#negocios",
  },
];

export const Segments = () => {
  return (
    <section
      aria-labelledby="segments-heading"
      className="w-full py-20 bg-[#f6f8f8]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2
            id="segments-heading"
            className="text-3xl font-bold text-[#2D3E82] mb-4"
          >
            Diseñado para cada perfil
          </h2>
          <p className="text-slate-600">
            Ya seas dueño de mascota, veterinario o proveedor, Huella360 cuenta con
            las herramientas específicas que necesitas para tener éxito.
          </p>
        </div>

        {/* Grid de Cards */}
        <ul className="grid md:grid-cols-3 gap-8 list-none p-0 m-0">
          {SEGMENTS.map((segment) => {
            const Icon = segment.icon;
            return (
              <li key={segment.title}>
                <article className="group flex flex-col h-full bg-white p-8 rounded-xl shadow-soft hover:shadow-xl transition-all border border-transparent hover:border-[#1ea59c]/20 relative overflow-hidden">
                  
                  {/* Badge de Destacado */}
                  {segment.featured && (
                    <span
                      aria-label="Más popular"
                      className="absolute top-0 right-0 bg-[#2D3E82] text-white text-xs font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider z-10"
                    >
                      Popular
                    </span>
                  )}

                  {/* Icono */}
                  <div
                    aria-hidden="true"
                    className="w-14 h-14 bg-[#1ea59c]/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-[#1ea59c] group-hover:text-white transition-colors text-[#1ea59c]"
                  >
                    <Icon size={28} />
                  </div>

                  {/* Contenido */}
                  <div className="flex flex-col gap-3 flex-grow">
                    <h3 className="text-xl font-bold text-[#2D3E82]">
                      {segment.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      {segment.description}
                    </p>
                  </div>

                  {/* Call to Action */}
                  <a
                    href={segment.href}
                    aria-label={`${segment.cta} — ${segment.title}`}
                    className="mt-6 pt-4 border-t border-slate-100 text-[#1ea59c] font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all w-max"
                  >
                    {segment.cta}
                    <ArrowRight size={16} aria-hidden="true" />
                  </a>
                  
                </article>
              </li>
            );
          })}
        </ul>

      </div>
    </section>
  );
};