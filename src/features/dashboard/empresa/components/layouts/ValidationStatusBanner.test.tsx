import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

const { useEmpresaProfile } = vi.hoisted(() => ({ useEmpresaProfile: vi.fn() }));
vi.mock('../../hooks/useEmpresaProfile', () => ({ useEmpresaProfile }));

import { ValidationStatusBanner } from './ValidationStatusBanner';

const conEstado = (estadoValidacion?: string) =>
  useEmpresaProfile.mockReturnValue({ data: estadoValidacion === undefined ? undefined : { id: 3, estadoValidacion } });

describe('ValidationStatusBanner', () => {
  beforeEach(() => useEmpresaProfile.mockReset());

  it('PENDIENTE: avisa que la empresa esta en revision y no sale en el directorio', () => {
    conEstado('PENDIENTE');
    render(<ValidationStatusBanner />);

    expect(screen.getByRole('status')).toHaveTextContent('Tu empresa está en revisión.');
    expect(screen.getByRole('status')).toHaveTextContent('no aparecerá en el directorio de empresas');
  });

  it('RECHAZADO: avisa que la empresa esta desactivada', () => {
    conEstado('RECHAZADO');
    render(<ValidationStatusBanner />);

    expect(screen.getByRole('alert')).toHaveTextContent('Tu empresa está desactivada.');
  });

  it('VERIFICADO: no muestra nada', () => {
    conEstado('VERIFICADO');
    const { container } = render(<ValidationStatusBanner />);

    expect(container).toBeEmptyDOMElement();
  });

  it('mientras carga el perfil no muestra nada', () => {
    conEstado(undefined);
    const { container } = render(<ValidationStatusBanner />);

    expect(container).toBeEmptyDOMElement();
  });
});
