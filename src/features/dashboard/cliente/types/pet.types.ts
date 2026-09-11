export const Sexo = {
  MACHO: "MACHO",
  HEMBRA: "HEMBRA",
} as const;

export type Sexo = typeof Sexo[keyof typeof Sexo];

export interface Pet {
  id: number;
  nombre: string;
  especie: string;
  raza: string;
  sexo: Sexo;
  fechaNacimiento: string;
  pesoKg: number;
  fotoUrl: string | null;
  esterilizado: boolean;
  observacionesMedicas: string | null;
  createdAt: string;
}

export interface CreatePetRequest {
  nombre: string;
  especie: string;
  raza: string | null;
  sexo: Sexo | null;
  fechaNacimiento: string | null;
  pesoKg: number;
  esterilizado: boolean;
  observacionesMedicas: string | null;
}

export interface UpdatePetRequest extends Partial<CreatePetRequest> {}
