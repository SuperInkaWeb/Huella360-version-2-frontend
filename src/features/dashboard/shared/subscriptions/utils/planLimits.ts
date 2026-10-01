// H360-EMP-001/002: en los planes, -1 (o null) = ilimitado, 0 = no incluido, N = hasta N.
// Antes la página Mi Suscripción trataba el 0 como ilimitado ("Mascotas Ilimitadas", "0/∞")
// en planes B2B que no incluyen mascotas.

/** Texto de la característica del plan, o null si el recurso no está incluido (no se muestra). */
export const textoLimitePlan = (
  limite: number | null | undefined,
  recurso: string,
  ilimitado: string,
): string | null => {
  if (limite == null || limite < 0) return ilimitado;
  if (limite === 0) return null;
  return `Hasta ${limite} ${recurso}`;
};

/** Uso actual frente al límite del plan: "3/4", "10/∞" o "No incluido". */
export const textoUsoPlan = (actual: number, maximo: number | null | undefined): string => {
  if (maximo == null || maximo < 0) return `${actual}/∞`;
  if (maximo === 0) return "No incluido";
  return `${actual}/${maximo}`;
};

/** true cuando el plan tiene un límite finito y ya se alcanzó. */
export const limiteAlcanzado = (actual: number, maximo: number | null | undefined): boolean =>
  maximo != null && maximo > 0 && actual >= maximo;
