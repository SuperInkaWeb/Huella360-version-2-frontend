export interface PointsConfig {
  id: number;
  accion: string;
  puntosOtorgados: number;
  activo: boolean;
  descripcion: string;
}

export interface Reward {
  id: number;
  empresaId: number;
  titulo: string;
  descripcion: string;
  costoPuntos: number;
  tipoDescuento: 'PORCENTAJE' | 'MONTO_FIJO';
  valorDescuento: number;
  aplicaACiertosProductos: boolean;
  activo: boolean;
  totalCanjes?: number;
  productosAplicablesIds: number[];
}

export interface PointHistory {
  id: number;
  puntos: number;
  tipoAccion: string;
  descripcion: string;
  fecha: string;
}

export interface ClientPointsDashboard {
  totalPuntos: number;
  historialReciente: PointHistory[];
}

export interface RedeemedReward {
  id: number;
  recompensaId: number;
  recompensaTitulo: string;
  tipoDescuento: 'PORCENTAJE' | 'MONTO_FIJO';
  valorDescuento: number;
  fechaCanje: string;
  utilizado: boolean;
  fechaUtilizacion?: string;
  ordenId?: number;
}
