import {
  PawPrint,
  Stethoscope,
  Store,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const PROFILE_DETAILS = [
  {
    id: "duenos",
    icon: PawPrint,
    title: "Para Dueños de Mascotas",
    subtitle: "El bienestar de tu mejor amigo, en la palma de tu mano.",
    description: "Olvídate de los carnets de vacunación perdidos. Con Huella360, tienes el control total de la salud de tu mascota de forma digital, gratuita y segura.",
    color: "text-[#1ea59c]",
    bgLight: "bg-[#1ea59c]/10",

    imageUrl: "/duenio-perfil.jpg",
    imageAlt: "Dueño de mascota sonriendo con su perro usando la app Huella360",

    features: [
      "Historial médico 100% digital y accesible 24/7.",
      "Recordatorios automáticos de vacunas y desparasitaciones.",
      "Reserva de citas online con tus veterinarios favoritos.",
      "Directorio de servicios: peluquerías, paseadores y emergencias."
    ],
    ctaText: "Crear perfil de mi mascota",
    link: "/register"
  },
  {
    id: "veterinarios",
    icon: Stethoscope,
    title: "Para Veterinarios y Clínicas",
    subtitle: "Digitaliza y optimiza tu práctica profesional.",
    description: "Un software de gestión clínica (PMS) diseñado para ahorrarte tiempo. Concéntrate en salvar vidas mientras nosotros nos encargamos de la administración.",
    color: "text-[#2D3E82]",
    bgLight: "bg-[#2D3E82]/10",

    imageUrl: "/veterinaria-perfil.jpg",
    imageAlt: "Veterinaria examinando un gato en una clínica moderna con software Huella360",

    features: [
      "Expedientes clínicos completos con carga de imágenes y exámenes.",
      "Agenda inteligente y sistema de confirmación por WhatsApp.",
      "Gestión de inventario y alertas de stock bajo.",
      "Facturación electrónica y reportes financieros automáticos."
    ],
    ctaText: "Agendar una demo gratuita",
    link: "/contacto"
  },
  {
    id: "negocios",
    icon: Store,
    title: "Para Negocios y Proveedores",
    subtitle: "Conecta tus productos con miles de Pet Lovers.",
    description: "Expande tus canales de venta. Nuestro marketplace integrado te permite llegar directamente a un público segmentado que busca exactamente lo que ofreces.",
    color: "text-[#1ea59c]",
    bgLight: "bg-[#1ea59c]/10",

    imageUrl: "/empresa-perfil.jpg",
    imageAlt: "Estanterías de una tienda de mascotas con productos listos para la venta online",

    features: [
      "Tienda virtual propia dentro del ecosistema Huella360.",
      "Gestión de catálogo, precios y promociones en tiempo real.",
      "Integración con pasarelas de pago seguras.",
      "Análisis de métricas: productos más vistos y tendencias de compra."
    ],
    ctaText: "Publicar mis productos",
    link: "/register"
  }
];

export const ProfilesInfo = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full bg-[#f6f8f8] pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">

        {PROFILE_DETAILS.map((profile, index) => {
          const Icon = profile.icon;
          const isEven = index % 2 === 0;

          return (
            <section
              key={profile.id}
              id={profile.id}
              className={`flex flex-col gap-12 lg:gap-20 items-center ${isEven ? "lg:flex-row" : "lg:flex-row-reverse"
                } scroll-mt-24`}
            >

              {/* Contenedor de la Imagen (Minimalista) */}
              <div className="w-full lg:w-1/2">
                <article className="aspect-square max-h-[450px] w-full bg-white rounded-2xl shadow-soft border border-slate-100 overflow-hidden group">
                  <img
                    src={profile.imageUrl}
                    alt={profile.imageAlt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </article>
              </div>

              {/* Contenido Informativo */}
              <div className="w-full lg:w-1/2 flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-sm w-max mb-6">
                  <Icon size={14} className={profile.color} />
                  <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                    {profile.id}
                  </span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-bold text-[#2D3E82] mb-4">
                  {profile.title}
                </h2>

                <p className="text-lg font-medium text-[#1ea59c] mb-4">
                  {profile.subtitle}
                </p>

                <p className="text-slate-600 mb-8 leading-relaxed text-lg">
                  {profile.description}
                </p>

                <ul className="space-y-4 mb-10">
                  {profile.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="w-6 h-6 text-[#1ea59c] shrink-0 mt-0.5" />
                      <span className="text-slate-700">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => navigate(profile.link)}
                  className="bg-[#1ea59c] hover:bg-[#198f87] text-white px-8 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 w-max group shadow-soft hover:shadow-lg">
                  {profile.ctaText}
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

            </section>
          );
        })}

      </div>
    </div>
  );
};