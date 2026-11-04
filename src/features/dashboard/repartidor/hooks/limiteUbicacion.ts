import { distanciaKm, type Punto } from "../../../../shared/utils/distancia";

/**
 * Cada ubicacion enviada se guarda en la base. Sin limite, el GPS del telefono envia varias
 * por minuto y mantiene encendida la base de Neon durante todo el turno (H360-INF-002).
 */
export const LIMITES_UBICACION = {
  /** Con un pedido en curso: el cliente sigue al repartidor en el mapa. */
  enReparto: { intervaloMs: 15_000, distanciaM: 20 },
  /** Solo disponible: la ubicacion sirve para asignar pedidos cercanos. */
  disponible: { intervaloMs: 60_000, distanciaM: 50 },
} as const;

export interface UbicacionEnviada extends Punto {
  enviadaEn: number;
}

/**
 * Decide si una nueva lectura del GPS se envia al backend: la primera siempre; las siguientes
 * solo si paso el intervalo minimo Y el repartidor se movio la distancia minima.
 */
export const debeEnviarUbicacion = (
  ultima: UbicacionEnviada | null,
  nueva: Punto,
  ahora: number,
  enReparto: boolean,
): boolean => {
  if (!ultima) return true;
  const limite = enReparto ? LIMITES_UBICACION.enReparto : LIMITES_UBICACION.disponible;
  if (ahora - ultima.enviadaEn < limite.intervaloMs) return false;
  return distanciaKm(ultima, nueva) * 1000 >= limite.distanciaM;
};
