export type EstadoOrden =
  | 'PENDIENTE'
  | 'PAGADO'
  | 'ENVIADO'
  | 'ENTREGADO'
  | 'CANCELADO'
  | 'FALLIDO'
  | 'REEMBOLSADO';

export interface OrderSummary {
  id: number;
  codigoOrden: string;
  clienteNombre: string;
  subtotal: number;
  costoEnvio: number;
  comisionPlataforma: number;
  descuento: number;
  total: number;
  estado: EstadoOrden;
  metodoPago?: string;
  createdAt: string;
}

export interface PaymentRecord {
  id: number;
  mpPaymentId: string;
  monto: number;
  metodoPago: string;
  estado: string; // "approved" | "pending" | "rejected" | "cancelled" | "refunded"
  createdAt: string;
}
