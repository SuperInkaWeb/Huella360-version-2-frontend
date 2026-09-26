import { Clock, AlertTriangle } from "lucide-react";
import { useEmpresaProfile } from "../../hooks/useEmpresaProfile";

/**
 * Aviso del estado de validacion de la empresa. El directorio publico (/empresas) solo lista
 * empresas VERIFICADO por un administrador; sin este aviso, una empresa nueva no tenia forma
 * de saber por que no aparecia ahi aunque sus productos ya se vieran en el marketplace.
 */
export const ValidationStatusBanner = () => {
  const { data: empresa } = useEmpresaProfile();
  const estado = empresa?.estadoValidacion;

  if (estado === "PENDIENTE") {
    return (
      <div role="status" className="shrink-0 mx-4 md:mx-6 mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <Clock size={18} className="mt-0.5 shrink-0 text-amber-500" />
        <p>
          <strong className="font-semibold">Tu empresa está en revisión.</strong>{" "}
          Hasta que el equipo de Huella360 la verifique, no aparecerá en el directorio de empresas.
          Tus productos ya pueden verse en el marketplace.
        </p>
      </div>
    );
  }

  if (estado === "RECHAZADO") {
    return (
      <div role="alert" className="shrink-0 mx-4 md:mx-6 mt-4 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
        <AlertTriangle size={18} className="mt-0.5 shrink-0 text-rose-500" />
        <p>
          <strong className="font-semibold">Tu empresa está desactivada.</strong>{" "}
          No aparece en el directorio de empresas. Si crees que es un error, contacta al equipo de Huella360.
        </p>
      </div>
    );
  }

  return null;
};
