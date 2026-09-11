export interface Recordatorio {
  id: number;
  mascotaId: number;
  mascotaNombre: string;
  tipo: string;
  titulo: string;
  descripcion: string | null;
  fechaProgramada: string;
  enviado: boolean;
  activo: boolean;
}

export interface CreateRecordatorioRequest {
  mascotaId: number;
  tipo: string;
  titulo: string;
  descripcion?: string;
  fechaProgramada: string;
}
