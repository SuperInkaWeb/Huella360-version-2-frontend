export type VerificationStatus = 'PENDIENTE' | 'VEREFICADO' | 'RECHAZADO';

export interface VetProfile {
  idVeterinario: number;
  idUsuario: number;
  nombres: string;
  apellidos: string;
  especialidad: string;
  numeroColegiatura: string;
  biografia?: string;
  aniosExperiencia: number;
  fotoPerfilUrl?: string;
  estadoValidacion: VerificationStatus;
  email: string;
  mpAccessToken?: string;
  mpPublicKey?: string;
}

export interface StaffInvitation {
  idStaff: number;
  idVeterinario: number;
  nombres: string;
  apellidos: string;
  especialidad?: string;
  fotoPerfil?: string;
  rolInterno: string;
  activo: boolean;
  /** Nombre de la empresa que envió la invitación (viene del contexto, no del StaffResponse directo) */
  empresaNombre?: string;
}
