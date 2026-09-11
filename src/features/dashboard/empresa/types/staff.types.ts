export interface StaffMember {
  idStaff: number;
  idVeterinario: number;
  nombres: string;
  apellidos: string;
  especialidad?: string;
  fotoPerfil?: string;
  rolInterno: string;
  activo: boolean;
}

export interface InviteStaffRequest {
  emailVeterinario: string;
  rolInterno: string;
}
