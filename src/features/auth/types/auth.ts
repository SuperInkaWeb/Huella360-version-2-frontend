// ─── Auth ─────────────────────────────────────────────────────────────────────

/** Body enviado al backend en POST /auth/login */
export interface LoginRequest {
  correo: string;
  password: string; // el backend usa "password" (no "contrasenia")
}

/** Body enviado al backend en POST /auth/register */
export interface RegisterRequest {
  correo: string;
  password: string;
  rol: "CLIENTE" | "VETERINARIO" | "EMPRESA" | "REPARTIDOR";
}

/** Response unificada de /auth/login y /auth/register */
export interface LoginResponse {
  token: string;
  refreshToken?: string;
  rol: string;
  empresaId?: number;
  nombre?: string;
}

/** Body enviado al backend en POST /auth/change-password */
export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/** Body enviado al backend en POST /auth/forgot-password */
export interface ForgotPasswordRequest {
  correo: string;
}

/** Body enviado al backend en POST /auth/reset-password */
export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

// ─── Perfiles ─────────────────────────────────────────────────────────────────

/** POST /api/v1/clients/me */
export interface ClienteProfileRequest {
  nombres: string;
  apellidos: string;
  telefono: string;
  direccion?: string;
  ciudad?: string;
  pais?: string;
}

/** POST /api/v1/veterinarians/profile */
export interface VeterinarioProfileRequest {
  nombres: string;
  apellidos: string;
  especialidad: string;
  numeroColegiatura: string;
  biografia?: string;
  aniosExperiencia?: number;
}

/**
 * POST /api/v1/companies — multipart/form-data
 * La parte "data" es este objeto serializado como JSON Blob.
 */
export interface EmpresaProfileRequest {
  nombreComercial: string;
  razonSocial: string;
  ruc: string;
  tipoServicio: string;
  telefono: string;
  emailContacto: string;
  direccion: string;
  ciudad: string;
  descripcion?: string;
  latitud?: number;
  longitud?: number;
}

/** POST /api/v1/repartidores/me — multipart/form-data */
export interface RepartidorProfileRequest {
  nombres: string;
  apellidos: string;
  telefono: string;
  tipoVehiculo: string;
  placaVehiculo?: string;
}