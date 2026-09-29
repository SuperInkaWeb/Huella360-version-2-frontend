// Mismo tope que valida el backend (PointsConfigService.MAX_PUNTOS_POR_ACCION).
export const MAX_PUNTOS_POR_ACCION = 10000;

// Evita puntos negativos: restarían puntos a los clientes en cada acción.
export const normalizarPuntos = (valor: string) =>
  Math.min(MAX_PUNTOS_POR_ACCION, Math.max(0, parseInt(valor) || 0));
