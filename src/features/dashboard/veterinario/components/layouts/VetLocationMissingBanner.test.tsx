import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const { useVetProfile } = vi.hoisted(() => ({ useVetProfile: vi.fn() }));
vi.mock('../../hooks/useVetProfile', () => ({ useVetProfile }));

import { VetLocationMissingBanner } from './VetLocationMissingBanner';

const renderBanner = () => render(<MemoryRouter><VetLocationMissingBanner /></MemoryRouter>);

describe('VetLocationMissingBanner', () => {
  beforeEach(() => useVetProfile.mockReset());

  it('veterinario sin coordenadas: avisa y lleva a Configuración', () => {
    useVetProfile.mockReturnValue({ data: { idVeterinario: 3, latitud: null, longitud: null } });
    renderBanner();

    expect(screen.getByRole('status')).toHaveTextContent('Aún no tienes ubicación en el mapa.');
    expect(screen.getByRole('link', { name: 'Agregar ubicación' })).toHaveAttribute('href', '/portal/veterinario/configuracion');
  });

  it('veterinario con ubicación: no muestra nada', () => {
    useVetProfile.mockReturnValue({ data: { idVeterinario: 3, latitud: -5.19449, longitud: -80.63282 } });
    const { container } = renderBanner();

    expect(container).toBeEmptyDOMElement();
  });

  it('mientras carga el perfil no muestra nada', () => {
    useVetProfile.mockReturnValue({ data: undefined });
    const { container } = renderBanner();

    expect(container).toBeEmptyDOMElement();
  });
});
