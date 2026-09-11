export interface HistoriaClinica {
  id: number;
  mascotaId: number;
  veterinarioId: number;
  nombreVeterinario: string | null;
  citaId: number | null;
  diagnostico: string;
  tratamiento: string;
  notas: string | null;
  pesoKg: number | null;
  fechaRegistro: string;
  createdAt: string;
}
