// Endpoints que siempre son públicos (no requieren token)
export const ALWAYS_PUBLIC_PATTERNS = [
  "/auth/",
  "/public/",
  "/payments/webhook",
  "/payments/checkout/guest",
  "/reclamos",
  "/orders/guest",
];

// Endpoints públicos solo en GET
export const PUBLIC_GET_PATTERNS = [
  "/services",
  "/adoptions",
  "/categories",
  "/subscriptions/plans",
];

// Patrones que SIEMPRE requieren token (incluso si contienen substrings públicos)
export const ALWAYS_PROTECTED_PATTERNS = [
  "/auth/sync",
  "/users/me",
  "/clients/me",
  "/companies/me",
  "/veterinarians/me",
  "/repartidores/me",
  "/applications",
  "/adoptions/me",
  "/services/me",
];

/**
 * Determina si un endpoint es público (no requiere token de autenticación).
 */
export const isPublicEndpoint = (url: string, method: string): boolean => {
  const alwaysPublic = ALWAYS_PUBLIC_PATTERNS.some((e) => url.includes(e));
  const publicGet =
    method === "get" &&
    PUBLIC_GET_PATTERNS.some((e) => url.includes(e));
  const isProtected = ALWAYS_PROTECTED_PATTERNS.some((e) => url.includes(e));

  return !isProtected && (alwaysPublic || publicGet);
};
