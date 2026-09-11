export interface HealthAlert {
  tipo: string;
  severidad: string;
  titulo: string;
  descripcion: string;
  recomendacion: string;
}

export interface HealthAlertResponse {
  alertas: HealthAlert[];
  resumen: string;
  alertasGeneradas: number;
}
