import { useEffect, useState } from "react";
import { Search, LocateFixed, Loader2 } from "lucide-react";
import { MapPicker } from "../../empresa/components/MapPicker";
import { geocodeAddress } from "../../../../shared/utils/geocoding";

interface LocationPickerProps {
  /** Texto que se busca en el mapa, por ejemplo "Av. Grau 123, Piura". */
  direccion: string;
  value: { lat: number; lng: number } | null;
  onChange: (lat: number, lng: number) => void;
  /** Busca la dirección al mostrarse si aún no hay punto (registro: la dirección se escribió en el paso anterior). */
  autoBuscar?: boolean;
  /** Con true el mapa empieza bloqueado y se edita con el botón del propio mapa (pantallas de configuración). */
  lockable?: boolean;
}

/**
 * Selector de ubicación: ubica la dirección escrita, usa el GPS del navegador o deja marcar el punto
 * a mano. Lo comparten el registro de la empresa y el registro y la configuración del veterinario.
 */
export const LocationPicker = ({ direccion, value, onChange, autoBuscar = false, lockable = false }: LocationPickerProps) => {
  const sinDireccion = direccion.replace(/,/g, "").trim() === "";
  const [buscaAlMostrarse] = useState(autoBuscar && !value && !sinDireccion);
  const [isLocating, setIsLocating] = useState(buscaAlMostrarse);
  const [aviso, setAviso] = useState<string | null>(null);

  const marcar = (lat: number, lng: number) => {
    setAviso(null);
    onChange(lat, lng);
  };

  const geocodificar = () =>
    geocodeAddress(direccion)
      .then((result) => {
        if (result) {
          marcar(result.lat, result.lng);
        } else {
          setAviso("No encontramos esa dirección. Marca el punto en el mapa.");
        }
      })
      .catch(() => setAviso("No se pudo buscar la dirección. Marca el punto en el mapa."))
      .finally(() => setIsLocating(false));

  const buscarDireccion = () => {
    setIsLocating(true);
    setAviso(null);
    void geocodificar();
  };

  const usarUbicacionActual = () => {
    if (!("geolocation" in navigator)) {
      setAviso("Tu navegador no permite obtener la ubicación. Marca el punto en el mapa.");
      return;
    }
    setIsLocating(true);
    setAviso(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        marcar(position.coords.latitude, position.coords.longitude);
        setIsLocating(false);
      },
      () => {
        setAviso("No se pudo obtener tu ubicación. Revisa los permisos del navegador o marca el punto en el mapa.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    if (buscaAlMostrarse) void geocodificar();
    // Solo al mostrarse: después la búsqueda la pide el usuario con el botón.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={buscarDireccion}
          disabled={isLocating || sinDireccion}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:border-[#1ea59c] hover:text-[#1ea59c] transition-all disabled:opacity-50"
        >
          {isLocating ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          Buscar mi dirección
        </button>
        <button
          type="button"
          onClick={usarUbicacionActual}
          disabled={isLocating}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:border-[#1ea59c] hover:text-[#1ea59c] transition-all disabled:opacity-50"
        >
          <LocateFixed size={16} />
          Usar mi ubicación actual
        </button>
      </div>

      {aviso && <p className="text-xs text-amber-600">{aviso}</p>}

      <MapPicker lat={value?.lat ?? 0} lng={value?.lng ?? 0} onChange={marcar} lockable={lockable} />
    </div>
  );
};
