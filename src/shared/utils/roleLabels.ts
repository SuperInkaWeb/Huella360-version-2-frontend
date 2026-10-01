// H360-UX-001: nombres legibles de cada rol y del portal al que pertenece, para que el usuario
// identifique en qué perfil se encuentra (antes se mostraba el rol crudo: "CLIENTE", "VETERINARIO").
interface RoleInfo {
  label: string;
  portal: string;
}

const ROLE_INFO: Record<string, RoleInfo> = {
  CLIENTE: { label: "Dueño de mascota", portal: "Portal del dueño de mascota" },
  VETERINARIO: { label: "Veterinario", portal: "Portal profesional veterinario" },
  EMPRESA: { label: "Empresa", portal: "Panel de la empresa" },
  ADMIN: { label: "Administrador", portal: "Panel de administración" },
  REPARTIDOR: { label: "Repartidor", portal: "Panel del repartidor" },
};

export const getRoleLabel = (role?: string | null) =>
  (role && ROLE_INFO[role]?.label) || "Usuario";

export const getPortalName = (role?: string | null) =>
  (role && ROLE_INFO[role]?.portal) || "Mi portal";
