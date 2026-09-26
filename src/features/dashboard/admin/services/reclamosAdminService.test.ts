import { describe, it, expect } from 'vitest';
import { numeroReclamo, fechaLimiteRespuesta } from './reclamosAdminService';

describe('Libro de Reclamaciones: helpers del panel admin', () => {
  it('numero visible con 6 digitos, igual al que recibe el consumidor', () => {
    expect(numeroReclamo(7)).toBe('000007');
    expect(numeroReclamo(123456)).toBe('123456');
  });

  it('plazo legal: 15 dias habiles (lunes a viernes) desde el registro', () => {
    // Jueves 24/09/2026 + 15 dias habiles = jueves 15/10/2026
    const limite = fechaLimiteRespuesta('2026-09-24T10:00:00');
    expect(limite.getFullYear()).toBe(2026);
    expect(limite.getMonth()).toBe(9); // octubre
    expect(limite.getDate()).toBe(15);
  });

  it('un registro en viernes no cuenta el fin de semana', () => {
    // Viernes 25/09/2026 + 15 habiles = viernes 16/10/2026
    const limite = fechaLimiteRespuesta('2026-09-25T18:00:00');
    expect(limite.getDate()).toBe(16);
    expect(limite.getDay()).toBe(5);
  });
});
