import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { MapPin, LocateFixed, Search, Loader2, Stethoscope, Store, ChevronRight, Home } from "lucide-react";
import { marketplaceService } from "../services/marketplaceService";
import type { CercanosParams, LugarCercano } from "../types/marketplace";
import type { OrigenBusquedaControl } from "../hooks/useOrigenBusqueda";
import { formatearDistancia } from "../../../shared/utils/distancia";

const RADIOS_KM = [2, 5, 10, 25];

type FiltroTipo = "TODOS" | "CLINICAS" | "TIENDAS" | "VETERINARIOS";

const FILTROS: { valor: FiltroTipo; etiqueta: string }[] = [
  { valor: "TODOS", etiqueta: "Todos" },
  { valor: "CLINICAS", etiqueta: "Clínicas" },
  { valor: "TIENDAS", etiqueta: "Pet shops" },
  { valor: "VETERINARIOS", etiqueta: "Veterinarios" },
];

const paramsDeFiltro = (filtro: FiltroTipo): Partial<CercanosParams> => {
  switch (filtro) {
    case "CLINICAS":
      return { tipoServicio: "VETERINARIA" };
    case "TIENDAS":
      return { tipoServicio: "PETSHOP" };
    case "VETERINARIOS":
      return { tipo: "VETERINARIO" };
    default:
      return {};
  }
};

const ETIQUETA_CATEGORIA: Record<string, string> = {
  VETERINARIA: "Clínica veterinaria",
  PETSHOP: "Pet shop",
  GROOMING: "Grooming",
  HIBRIDO: "Clínica y pet shop",
};

const etiquetaCategoria = (lugar: LugarCercano) =>
  lugar.tipo === "VETERINARIO"
    ? `Veterinario${lugar.categoria ? ` · ${lugar.categoria}` : ""}`
    : ETIQUETA_CATEGORIA[lugar.categoria ?? ""] ?? lugar.categoria ?? "Negocio";

interface CercaDeTiProps {
  origen: OrigenBusquedaControl;
  /** Versión del marketplace: menos resultados y sin descripción larga. */
  compacto?: boolean;
}

/**
 * Sección "Cerca de ti": negocios y veterinarios verificados ordenados por distancia al punto elegido
 * (ubicación guardada del cliente, GPS o distrito escrito a mano).
 */
export const CercaDeTi = ({ origen: control, compacto = false }: CercaDeTiProps) => {
  const { origen, ubicacionGuardada, esCliente, cargando, error, usarGps, buscarDistrito, usarUbicacionGuardada } = control;
  const [radioKm, setRadioKm] = useState(5);
  const [filtro, setFiltro] = useState<FiltroTipo>("TODOS");
  const [distrito, setDistrito] = useState("");
  // Resultado de la última consulta respondida; mientras no coincida con la consulta actual, se está buscando.
  const [resultado, setResultado] = useState<{ clave: string; lugares: LugarCercano[]; error: boolean } | null>(null);
  const clave = origen ? [origen.lat, origen.lng, radioKm, filtro, compacto].join("|") : null;
  const buscando = clave !== null && resultado?.clave !== clave;
  const lugares = resultado?.lugares ?? [];
  const errorLugares = resultado?.error ?? false;

  useEffect(() => {
    if (!origen || clave === null) return;
    let activo = true;
    marketplaceService
      .getCercanos({ lat: origen.lat, lng: origen.lng, radioKm, limite: compacto ? 6 : 24, ...paramsDeFiltro(filtro) })
      .then((res) => activo && setResultado({ clave, lugares: res, error: false }))
      .catch(() => activo && setResultado({ clave, lugares: [], error: true }));
    return () => {
      activo = false;
    };
  }, [origen, clave, radioKm, filtro, compacto]);

  const onBuscarDistrito = (e: FormEvent) => {
    e.preventDefault();
    void buscarDistrito(distrito);
  };

  return (
    <section aria-labelledby="cerca-de-ti-titulo" className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
        <div>
          <h2 id="cerca-de-ti-titulo" className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <MapPin size={20} className="text-[#1ea59c]" />
            Cerca de ti
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {origen ? (
              <>
                Buscando desde <span className="font-semibold text-slate-700">{origen.etiqueta}</span>
              </>
            ) : (
              "Elige desde dónde buscar: usa tu ubicación actual o escribe tu distrito."
            )}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 lg:max-w-[560px] w-full lg:w-auto">
          {ubicacionGuardada && origen?.fuente !== "perfil" && (
            <button
              type="button"
              onClick={usarUbicacionGuardada}
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:border-[#1ea59c] hover:text-[#1ea59c] transition-all whitespace-nowrap"
            >
              <Home size={14} />
              Mi ubicación guardada
            </button>
          )}
          <button
            type="button"
            onClick={usarGps}
            disabled={cargando}
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:border-[#1ea59c] hover:text-[#1ea59c] transition-all disabled:opacity-50 whitespace-nowrap"
          >
            <LocateFixed size={14} />
            Usar mi ubicación actual
          </button>
          <form onSubmit={onBuscarDistrito} className="flex gap-2 flex-1">
            <input
              type="text"
              value={distrito}
              onChange={(e) => setDistrito(e.target.value)}
              placeholder="Escribe tu distrito"
              aria-label="Distrito"
              className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#1ea59c]"
            />
            <button
              type="submit"
              disabled={cargando || !distrito.trim()}
              aria-label="Buscar distrito"
              className="px-3 py-2 rounded-xl bg-[#1ea59c] text-white disabled:opacity-50"
            >
              {cargando ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            </button>
          </form>
        </div>
      </div>

      {error && <p className="text-xs text-amber-600 mb-3">{error}</p>}

      {!origen && esCliente && !ubicacionGuardada && (
        <p className="text-xs text-slate-500 mb-3">
          ¿Siempre buscas desde el mismo lugar?{" "}
          <Link to="/portal/cliente/configuracion" className="text-[#1ea59c] font-semibold hover:underline">
            Guarda tu ubicación en Configuración
          </Link>
          .
        </p>
      )}

      {origen && (
        <>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs text-slate-500">Radio:</span>
            {RADIOS_KM.map((km) => (
              <button
                key={km}
                type="button"
                onClick={() => setRadioKm(km)}
                aria-pressed={radioKm === km}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                  radioKm === km ? "bg-[#1ea59c] text-white border-[#1ea59c]" : "border-slate-200 text-slate-600 hover:border-[#1ea59c]"
                }`}
              >
                {km} km
              </button>
            ))}
            <span className="hidden sm:inline w-px h-5 bg-slate-200 mx-1" />
            {FILTROS.map((f) => (
              <button
                key={f.valor}
                type="button"
                onClick={() => setFiltro(f.valor)}
                aria-pressed={filtro === f.valor}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                  filtro === f.valor ? "bg-slate-900 text-white border-slate-900" : "border-slate-200 text-slate-600 hover:border-slate-400"
                }`}
              >
                {f.etiqueta}
              </button>
            ))}
          </div>

          {buscando ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-400">
              <Loader2 size={18} className="animate-spin" />
              Buscando lugares cercanos...
            </div>
          ) : errorLugares ? (
            <p className="py-8 text-center text-sm text-slate-500">No se pudieron cargar los lugares cercanos. Intenta de nuevo.</p>
          ) : lugares.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              No encontramos resultados a menos de {radioKm} km.
              {radioKm < RADIOS_KM[RADIOS_KM.length - 1] && " Prueba con un radio mayor."}
            </p>
          ) : (
            <ul className={`grid grid-cols-1 sm:grid-cols-2 ${compacto ? "lg:grid-cols-3" : "lg:grid-cols-3 xl:grid-cols-4"} gap-3`}>
              {lugares.map((lugar) => (
                <li key={`${lugar.tipo}-${lugar.id}`}>
                  <TarjetaLugar lugar={lugar} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
};

const TarjetaLugar = ({ lugar }: { lugar: LugarCercano }) => {
  const Icono = lugar.tipo === "VETERINARIO" ? Stethoscope : Store;
  const contenido = (
    <>
      <div className="w-14 h-14 shrink-0 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center">
        {lugar.imagenUrl ? (
          <img src={lugar.imagenUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <Icono size={22} className="text-slate-400" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-sm text-slate-900 truncate">{lugar.nombre}</p>
        <p className="text-xs text-[#1ea59c] font-medium truncate">{etiquetaCategoria(lugar)}</p>
        {(lugar.direccion || lugar.ciudad) && (
          <p className="text-xs text-slate-500 truncate">{[lugar.direccion, lugar.ciudad].filter(Boolean).join(", ")}</p>
        )}
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className="text-xs font-bold text-slate-700 bg-slate-100 rounded-full px-2 py-0.5 whitespace-nowrap">
          {formatearDistancia(lugar.distanciaKm)}
        </span>
        {lugar.tipo === "EMPRESA" && <ChevronRight size={16} className="text-slate-300" />}
      </div>
    </>
  );

  const clases = "flex items-center gap-3 p-3 rounded-xl border border-slate-200 h-full";
  // Los veterinarios independientes aún no tienen perfil público propio.
  return lugar.tipo === "EMPRESA" ? (
    <Link to={`/empresa/${lugar.id}`} className={`${clases} hover:border-[#1ea59c] hover:shadow-sm transition-all`}>
      {contenido}
    </Link>
  ) : (
    <div className={clases}>{contenido}</div>
  );
};
