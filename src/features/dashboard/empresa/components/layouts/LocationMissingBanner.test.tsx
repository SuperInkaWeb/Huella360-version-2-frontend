import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const { useEmpresaProfile } = vi.hoisted(() => ({ useEmpresaProfile: vi.fn() }));
vi.mock('../../hooks/useEmpresaProfile', () => ({ useEmpresaProfile }));

import { LocationMissingBanner } from './LocationMissingBanner';

const renderBanner = () => render(<MemoryRouter><LocationMissingBanner /></MemoryRouter>);

describe('LocationMissingBanner', () => {
  beforeEach(() => useEmpresaProfile.mockReset());

  it('empresa sin coordenadas: avisa y lleva a Configuración', () => {
    useEmpresaProfile.mockReturnValue({ data: { id: 3, latitud: null, longitud: null } });
    renderBanner();

    expect(screen.getByRole('status')).toHaveTextContent('Tu negocio aún no tiene ubicación en el mapa.');
    expect(screen.getByRole('link', { name: 'Agregar ubicación' })).toHaveAttribute('href', '/portal/empresa/configuracion');
  });

  it('empresa con ubicación: no muestra nada', () => {
    useEmpresaProfile.mockReturnValue({ data: { id: 3, latitud: -5.19449, longitud: -80.63282 } });
    const { container } = renderBanner();

    expect(container).toBeEmptyDOMElement();
  });

  it('mientras carga el perfil no muestra nada', () => {
    useEmpresaProfile.mockReturnValue({ data: undefined });
    const { container } = renderBanner();

    expect(container).toBeEmptyDOMElement();
  });
});
