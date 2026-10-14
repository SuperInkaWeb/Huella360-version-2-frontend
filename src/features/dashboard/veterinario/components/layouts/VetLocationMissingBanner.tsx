import { MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useVetProfile } from "../../hooks/useVetProfile";

/**
 * Aviso para los veterinarios que aun no marcaron su ubicacion en el mapa. En el registro es
 * opcional y los que se registraron antes nunca la tuvieron; sin ella no pueden salir en las
 * busquedas por cercania.
 */
export const VetLocationMissingBanner = () => {
  const { data: profile } = useVetProfile();

  if (!profile || (profile.latitud != null && profile.longitud != null)) return null;

  return (
    <div role="status" className="shrink-0 mx-4 md:mx-6 mt-4 flex items-start gap-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
      <MapPin size={18} className="mt-0.5 shrink-0 text-sky-500" />
      <p>
        <strong className="font-semibold">Aún no tienes ubicación en el mapa.</strong>{" "}
        Si atiendes por tu cuenta, los clientes cercanos no podrán encontrarte.{" "}
        <Link to="/portal/veterinario/configuracion" className="font-semibold underline underline-offset-2 hover:text-sky-900">
          Agregar ubicación
        </Link>
      </p>
    </div>
  );
};
