export type DeliveryStatus = 
  | 'BUSCANDO_REPARTIDOR' 
  | 'REPARTIDOR_ASIGNADO' 
  | 'EN_TIENDA' 
  | 'RECOGIDO' 
  | 'EN_CAMINO' 
  | 'CERCA' 
  | 'ENTREGADO' 
  | 'FALLIDO' 
  | 'CANCELADO'
  | 'INCIDENCIA';

export type RepartidorStatus = 'DISPONIBLE' | 'OCUPADO' | 'INACTIVO' | 'OFFLINE';

export interface RepartidorResponseDTO {
    idRepartidor: number;
    nombres: string;
    apellidos: string;
    telefono: string;
    fotoPerfil: string;
    tipoVehiculo: string;
    placaVehiculo: string;
    estadoActual: RepartidorStatus;
    calificacionPromedio: number;
    totalEntregas: number;
    activo: boolean;
}

export interface DeliveryResponseDTO {
    idDelivery: number;
    ordenId: number;
    estado: DeliveryStatus;
    clienteNombre?: string;
    clienteTelefono?: string;
    repartidorCalificacionPromedio?: number;
    origenDireccion: string;
    destinoDireccion: string;
    costoDelivery: number;
    distanciaKm?: number;
    tiempoEstimadoMin?: number;
    createdAt?: string;
    asignadoAt?: string;
    entregadoAt?: string;
}