import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const { useVetProfile, updateProfile, swalFire, geocodeAddress } = vi.hoisted(() => ({
  useVetProfile: vi.fn(),
  updateProfile: vi.fn(),
  swalFire: vi.fn(),
  geocodeAddress: vi.fn(),
}));

vi.mock('../hooks/useVetProfile', () => ({ useVetProfile }));
vi.mock('../services/vetService', () => ({ vetService: { updateProfile } }));
vi.mock('../../../auth/context/useAuth', () => ({ useAuth: () => ({ logout: vi.fn() }) }));
vi.mock('../../../auth/services/authService', () => ({ authService: {} }));
vi.mock('sweetalert2', () => ({ default: { fire: swalFire } }));
vi.mock('../../../../shared/utils/geocoding', () => ({ geocodeAddress }));
// Leaflet no funciona en jsdom: el mapa se reemplaza por un boton que marca un punto.
vi.mock('../../empresa/components/MapPicker', () => ({
  MapPicker: ({ lat, lng, onChange }: { lat: number; lng: number; onChange: (lat: number, lng: number) => void }) => (
    <button type="button" data-testid="mapa" data-lat={lat} data-lng={lng} onClick={() => onChange(-5.2, -80.6)}>
      mapa
    </button>
  ),
}));

import { VetConfiguracionPage } from './VetConfiguracionPage';

const perfil = {
  idVeterinario: 5,
  idUsuario: 20,
  nombres: 'Ana',
  apellidos: 'Rojas',
  especialidad: 'Medicina Interna',
  numeroColegiatura: '12345',
  aniosExperiencia: 5,
  estadoValidacion: 'VERIFICADO',
  email: 'ana@test.com',
};

const renderPage = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <VetConfiguracionPage />
    </QueryClientProvider>,
  );

describe('VetConfiguracionPage: ubicación', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    updateProfile.mockResolvedValue({});
  });

  it('veterinario sin ubicación: busca su dirección y la guarda con el perfil', async () => {
    const user = userEvent.setup();
    useVetProfile.mockReturnValue({ data: { ...perfil, latitud: null, longitud: null }, isLoading: false });
    geocodeAddress.mockResolvedValueOnce({ lat: -5.19449, lng: -80.63282, displayName: 'Av. Grau 123, Piura' });
    renderPage();

    await user.type(screen.getByLabelText('Ciudad'), 'Piura');
    await user.type(screen.getByLabelText('Dirección'), 'Av. Grau 123');
    await user.click(screen.getByRole('button', { name: /Buscar mi dirección/ }));

    expect(geocodeAddress).toHaveBeenCalledWith('Av. Grau 123, Piura');
    await waitFor(() => expect(screen.getByTestId('mapa')).toHaveAttribute('data-lat', '-5.19449'));

    await user.click(screen.getByRole('button', { name: /Guardar Cambios/ }));

    await waitFor(() => expect(updateProfile).toHaveBeenCalledTimes(1));
    expect(updateProfile.mock.calls[0][0]).toMatchObject({
      nombres: 'Ana',
      ciudad: 'Piura',
      direccion: 'Av. Grau 123',
      latitud: -5.19449,
      longitud: -80.63282,
    });
  });

  it('muestra la ubicación guardada y permite moverla en el mapa', async () => {
    const user = userEvent.setup();
    useVetProfile.mockReturnValue({
      data: { ...perfil, ciudad: 'Lima', direccion: 'Jr. de la Unión 300', latitud: -12.046374, longitud: -77.042793 },
      isLoading: false,
    });
    renderPage();

    expect(screen.getByLabelText('Dirección')).toHaveValue('Jr. de la Unión 300');
    expect(screen.getByTestId('mapa')).toHaveAttribute('data-lat', '-12.046374');

    await user.click(screen.getByTestId('mapa'));
    await user.click(screen.getByRole('button', { name: /Guardar Cambios/ }));

    await waitFor(() => expect(updateProfile).toHaveBeenCalledTimes(1));
    expect(updateProfile.mock.calls[0][0]).toMatchObject({ latitud: -5.2, longitud: -80.6 });
  });
});
