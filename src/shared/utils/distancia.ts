export interface Punto {
  lat: number;
  lng: number;
}

const RADIO_TIERRA_KM = 6371;
const aRadianes = (grados: number) => (grados * Math.PI) / 180;

/** Distancia en línea recta (Haversine) en km, la misma fórmula que usa el backend. */
export const distanciaKm = (a: Punto, b: Punto): number => {
  const dLat = aRadianes(b.lat - a.lat);
  const dLng = aRadianes(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(aRadianes(a.lat)) * Math.cos(aRadianes(b.lat)) * Math.sin(dLng / 2) ** 2;
  return RADIO_TIERRA_KM * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};

/** "a 850 m", "a 1,2 km", "a 15 km". */
export const formatearDistancia = (km: number): string => {
  if (km < 1) return `a ${Math.max(10, Math.round((km * 1000) / 10) * 10)} m`;
  if (km < 10) return `a ${km.toFixed(1).replace(".", ",")} km`;
  return `a ${Math.round(km)} km`;
};
