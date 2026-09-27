import { describe, it, expect } from 'vitest';
import { mapServiceToProduct } from './productAdapter';
import type { ServiceResponse } from '../types/marketplace';

const base: ServiceResponse = { id: 8, nombre: 'Consulta', descripcion: 'x', precio: 20, duracionMinutos: 30, modalidad: 'PRESENCIAL' };

describe('mapServiceToProduct', () => {
  it('servicio de veterinario independiente: expone veterinarioId para reservar con propuesta', () => {
    const p = mapServiceToProduct({ ...base, veterinarioId: 2, veterinarioNombres: 'Carlos', veterinarioApellidos: 'Rivas' });
    expect(p.veterinarioId).toBe(2);
    expect(p.empresaNombre).toBe('Carlos Rivas');
  });

  it('servicio de empresa: sin veterinarioId, reserva por horario de la empresa', () => {
    const p = mapServiceToProduct({ ...base, empresaId: 3, empresaNombre: 'Vet QA' });
    expect(p.veterinarioId).toBeUndefined();
    expect(p.empresaId).toBe(3);
  });
});
