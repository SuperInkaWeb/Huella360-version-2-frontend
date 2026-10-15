import { useEffect, useState } from "react";
import { useAuth } from "../../auth/context/useAuth";
import { clienteService } from "../../dashboard/cliente/services/clienteService";
import { geocodeAddress } from "../../../shared/utils/geocoding";

export type FuenteOrigen = "perfil" | "gps" | "distrito";

/** Punto desde el que se mide la distancia a los negocios. */
export interface OrigenBusqueda {
  lat: number;
  lng: number;
  etiqueta: string;
  fuente: FuenteOrigen;
}

// El punto elegido a mano (GPS o distrito) se conserva al pasar del directorio al marketplace.
const CLAVE_SESION = "huella360.origenBusqueda";

const leerSesion = (): OrigenBusqueda | null => {
  try {
    const guardado = sessionStorage.getItem(CLAVE_SESION);
    return guardado ? (JSON.parse(guardado) as OrigenBusqueda) : null;
  } catch {
    return null;
  }
};

const guardarSesion = (origen: OrigenBusqueda) => {
  try {
    // La ubicación del perfil no se guarda: se vuelve a leer del perfil en cada pantalla.
    if (origen.fuente === "perfil") sessionStorage.removeItem(CLAVE_SESION);
    else sessionStorage.setItem(CLAVE_SESION, JSON.stringify(origen));
  } catch {
    // Sin almacenamiento disponible: el punto vale solo para esta pantalla.
  }
};

/**
 * Origen de la búsqueda por cercanía. Prioridad: el punto que la persona eligió en esta sesión
 * (GPS o distrito), luego la ubicación guardada en el perfil del cliente. Sin ninguno, queda en null
 * hasta que use el GPS o escriba su distrito.
 */
export const useOrigenBusqueda = () => {
  const { isAuthenticated, role } = useAuth();
  const [origen, setOrigen] = useState<OrigenBusqueda | null>(leerSesion);
  const [ubicacionGuardada, setUbicacionGuardada] = useState<OrigenBusqueda | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const esCliente = isAuthenticated && role === "CLIENTE";

  useEffect(() => {
    if (!esCliente) return;
    let activo = true;
    clienteService
      .getMyProfile()
      .then((perfil) => {
        if (!activo || perfil.ubicacionLat == null || perfil.ubicacionLng == null) return;
        const guardada: OrigenBusqueda = {
          lat: Number(perfil.ubicacionLat),
          lng: Number(perfil.ubicacionLng),
          etiqueta: [perfil.direccion, perfil.ciudad].filter((v) => v?.trim()).join(", ") || "Tu ubicación guardada",
          fuente: "perfil",
        };
        setUbicacionGuardada(guardada);
        setOrigen((actual) => actual ?? guardada);
      })
      .catch(() => {
        // Perfil sin completar o error de red: se busca con GPS o distrito.
      });
    return () => {
      activo = false;
    };
  }, [esCliente]);

  const elegir = (nuevo: OrigenBusqueda) => {
    setOrigen(nuevo);
    setError(null);
    guardarSesion(nuevo);
  };

  const usarGps = () => {
    if (!("geolocation" in navigator)) {
      setError("Tu navegador no permite obtener la ubicación. Escribe tu distrito.");
      return;
    }
    setCargando(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        elegir({ lat: pos.coords.latitude, lng: pos.coords.longitude, etiqueta: "Tu ubicación actual", fuente: "gps" });
        setCargando(false);
      },
      () => {
        setError("No se pudo obtener tu ubicación. Revisa los permisos del navegador o escribe tu distrito.");
        setCargando(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const buscarDistrito = async (texto: string) => {
    const distrito = texto.trim();
    if (!distrito) return;
    setCargando(true);
    setError(null);
    try {
      const res = await geocodeAddress(distrito);
      if (res) {
        elegir({ lat: res.lat, lng: res.lng, etiqueta: distrito, fuente: "distrito" });
      } else {
        setError(`No encontramos "${distrito}". Prueba con el distrito y la ciudad, por ejemplo "Miraflores, Lima".`);
      }
    } catch {
      setError("No se pudo buscar el distrito. Intenta de nuevo o usa tu ubicación actual.");
    } finally {
      setCargando(false);
    }
  };

  const usarUbicacionGuardada = () => {
    if (ubicacionGuardada) elegir(ubicacionGuardada);
  };

  return { origen, ubicacionGuardada, esCliente, cargando, error, usarGps, buscarDistrito, usarUbicacionGuardada };
};

export type OrigenBusquedaControl = ReturnType<typeof useOrigenBusqueda>;
