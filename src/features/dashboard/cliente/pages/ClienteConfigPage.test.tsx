import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const { getMyProfile, updateMyProfile, swalFire, geocodeAddress } = vi.hoisted(() => ({
  getMyProfile: vi.fn(),
  updateMyProfile: vi.fn(),
  swalFire: vi.fn(),
  geocodeAddress: vi.fn(),
}));

vi.mock('../services/clienteService', () => ({ clienteService: { getMyProfile, updateMyProfile } }));
vi.mock('../../../auth/context/useAuth', () => ({ useAuth: () => ({ nombre: 'Juan', logout: vi.fn() }) }));
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

import { ClienteConfigPage } from './ClienteConfigPage';

const perfil = {
  id: 3,
  usuarioId: 9,
  nombres: 'Juan',
  apellidos: 'Perez',
  telefono: '999888777',
  direccion: '',
  createdAt: '2026-10-01T10:00:00',
};

describe('ClienteConfigPage: ubicación', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    updateMyProfile.mockResolvedValue({});
  });

  it('cliente sin ubicación: busca su dirección y la guarda con el perfil', async () => {
    const user = userEvent.setup();
    getMyProfile.mockResolvedValueOnce({ ...perfil, ubicacionLat: null, ubicacionLng: null });
    geocodeAddress.mockResolvedValueOnce({ lat: -5.19449, lng: -80.63282, displayName: 'Av. Grau 123, Piura' });
    render(<ClienteConfigPage />);

    await user.type(await screen.findByLabelText(/Dirección/), 'Av. Grau 123');
    await user.type(screen.getByLabelText(/Ciudad/), 'Piura');
    await user.click(screen.getByRole('button', { name: /Buscar mi dirección/ }));

    expect(geocodeAddress).toHaveBeenCalledWith('Av. Grau 123, Piura');
    await waitFor(() => expect(screen.getByTestId('mapa')).toHaveAttribute('data-lat', '-5.19449'));

    await user.click(screen.getByRole('button', { name: /Guardar Cambios/ }));

    await waitFor(() => expect(updateMyProfile).toHaveBeenCalledTimes(1));
    expect(updateMyProfile.mock.calls[0][0]).toMatchObject({
      nombres: 'Juan',
      direccion: 'Av. Grau 123',
      ciudad: 'Piura',
      latitud: -5.19449,
      longitud: -80.63282,
    });
  });

  it('muestra la ubicación guardada y deja guardar cuando solo se mueve el punto', async () => {
    const user = userEvent.setup();
    getMyProfile.mockResolvedValueOnce({
      ...perfil,
      direccion: 'Jr. de la Unión 300',
      ciudad: 'Lima',
      ubicacionLat: -12.046374,
      ubicacionLng: -77.042793,
    });
    render(<ClienteConfigPage />);

    expect(await screen.findByLabelText(/Ciudad/)).toHaveValue('Lima');
    expect(screen.getByTestId('mapa')).toHaveAttribute('data-lat', '-12.046374');
    expect(screen.getByRole('button', { name: /Guardar Cambios/ })).toBeDisabled();

    await user.click(screen.getByTestId('mapa'));
    await user.click(screen.getByRole('button', { name: /Guardar Cambios/ }));

    await waitFor(() => expect(updateMyProfile).toHaveBeenCalledTimes(1));
    expect(updateMyProfile.mock.calls[0][0]).toMatchObject({ latitud: -5.2, longitud: -80.6 });
  });
});
