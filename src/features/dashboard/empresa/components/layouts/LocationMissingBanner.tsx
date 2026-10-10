import { MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useEmpresaProfile } from "../../hooks/useEmpresaProfile";

/**
 * Aviso para las empresas que aun no marcaron su ubicacion en el mapa. Las nuevas la dan en el
 * registro; las que se registraron antes solo pueden fijarla en Configuracion y, sin ella, no
 * pueden salir en las busquedas por cercania.
 */
export const LocationMissingBanner = () => {
  const { data: empresa } = useEmpresaProfile();

  if (!empresa || (empresa.latitud != null && empresa.longitud != null)) return null;

  return (
    <div role="status" className="shrink-0 mx-4 md:mx-6 mt-4 flex items-start gap-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
      <MapPin size={18} className="mt-0.5 shrink-0 text-sky-500" />
      <p>
        <strong className="font-semibold">Tu negocio aún no tiene ubicación en el mapa.</strong>{" "}
        Sin ella, los clientes cercanos no podrán encontrarte.{" "}
        <Link to="/portal/empresa/configuracion" className="font-semibold underline underline-offset-2 hover:text-sky-900">
          Agregar ubicación
        </Link>
      </p>
    </div>
  );
};
