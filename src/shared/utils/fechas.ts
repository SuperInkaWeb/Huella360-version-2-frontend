// El backend trabaja con fechas "de pared" en la zona del negocio (LocalDate / LocalDateTime, sin zona).
// Pasarlas por UTC (toISOString, new Date("YYYY-MM-DD")) corre la fecha o la hora 5 horas en Peru.

const dosDigitos = (n: number) => String(n).padStart(2, "0");

/** "YYYY-MM-DD" de la fecha dada (hoy por defecto) en la zona del navegador. */
export const hoyLocal = (fecha: Date = new Date()): string =>
  `${fecha.getFullYear()}-${dosDigitos(fecha.getMonth() + 1)}-${dosDigitos(fecha.getDate())}`;

/** Valor de un <input type="datetime-local"> ("YYYY-MM-DDTHH:mm") al LocalDateTime del backend, sin convertir a UTC. */
export const aLocalDateTime = (valorInput: string): string =>
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(valorInput) ? `${valorInput}:00` : valorInput;

/** Fecha del backend a Date. Un LocalDate ("YYYY-MM-DD") se toma como medianoche local, no UTC. */
export const parseFecha = (valor: string): Date =>
  /^\d{4}-\d{2}-\d{2}$/.test(valor) ? new Date(`${valor}T00:00:00`) : new Date(valor);
