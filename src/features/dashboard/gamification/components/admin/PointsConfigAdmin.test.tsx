import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

const mutate = vi.fn();
const configs = [
  { id: 6, accion: 'PRIMERA_MASCOTA', puntosOtorgados: 30, activo: true, descripcion: 'Primera mascota' },
  { id: 1, accion: 'REGISTRO', puntosOtorgados: 50, activo: true, descripcion: 'Registro' },
  { id: 3, accion: 'COMPRA', puntosOtorgados: 10, activo: true, descripcion: 'Compra' },
];

vi.mock('../../hooks/useGamification', () => ({
  usePointsConfig: () => ({ data: configs, isLoading: false }),
  useUpdatePointsConfig: () => ({ mutate, isPending: false }),
}));

import { PointsConfigAdmin } from './PointsConfigAdmin';
import { normalizarPuntos, MAX_PUNTOS_POR_ACCION } from './pointsLimits';

describe('PointsConfigAdmin', () => {
  beforeEach(() => mutate.mockClear());

  it('muestra las acciones en orden fijo por id, sin importar el orden de la API', () => {
    render(<PointsConfigAdmin />);
    const acciones = screen.getAllByRole('row').slice(1).map(r => r.querySelector('td')?.textContent);
    expect(acciones).toEqual(['REGISTRO', 'COMPRA', 'PRIMERA MASCOTA']);
  });

  it('cambiar solo el interruptor "activo" reenvia los puntos actuales', () => {
    render(<PointsConfigAdmin />);
    const fila = screen.getAllByRole('row')[1]; // REGISTRO
    fireEvent.click(fila.querySelector('input[type="checkbox"]')!);
    fireEvent.click(fila.querySelector('button')!);
    expect(mutate).toHaveBeenCalledWith({ id: 1, puntosOtorgados: 50, activo: false }, expect.anything());
  });

  it('no permite valores negativos ni por encima del tope', () => {
    expect(normalizarPuntos('-10')).toBe(0);
    expect(normalizarPuntos('')).toBe(0);
    expect(normalizarPuntos('55')).toBe(55);
    expect(normalizarPuntos('5550000')).toBe(MAX_PUNTOS_POR_ACCION);
  });
});
