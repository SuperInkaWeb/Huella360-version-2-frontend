import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const { getProfile, createProfile, swalFire, setPerfilCompleto, geocodeAddress } = vi.hoisted(() => ({
  getProfile: vi.fn(),
  createProfile: vi.fn(),
  swalFire: vi.fn(),
  // Referencia estable: el useEffect de la pagina depende de ella.
  setPerfilCompleto: vi.fn(),
  geocodeAddress: vi.fn(),
}));

vi.mock('../../services/profileService', () => ({
  profileService: { getClienteProfile: getProfile, createClienteProfile: createProfile },
}));
vi.mock('../../../dashboard/cliente/services/referralService', () => ({ referralService: { applyCode: vi.fn() } }));
vi.mock('../../../auth/context/useAuth', () => ({ useAuth: () => ({ setPerfilCompleto }) }));
vi.mock('sweetalert2', () => ({ default: { fire: swalFire } }));
vi.mock('../../../../shared/utils/geocoding', () => ({ geocodeAddress }));
// Leaflet no funciona en jsdom: el mapa se reemplaza por un boton que marca un punto.
vi.mock('../../../dashboard/empresa/components/MapPicker', () => ({
  MapPicker: ({ lat, lng, onChange }: { lat: number; lng: number; onChange: (lat: number, lng: number) => void }) => (
    <button type="button" data-testid="mapa" data-lat={lat} data-lng={lng} onClick={() => onChange(-5.2, -80.6)}>
      mapa
    </button>
  ),
}));

import { ClienteProfilePage } from './ClienteProfilePage';

const siguiente = (user: ReturnType<typeof userEvent.setup>) =>
  user.click(screen.getByRole('button', { name: /Siguiente/ }));

const llegarAlPasoUbicacion = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(await screen.findByPlaceholderText('Tus nombres'), 'Juan');
  await user.type(screen.getByPlaceholderText('Tus apellidos'), 'Perez');
  await user.type(screen.getByPlaceholderText('Ej: 999888777'), '999888777');
  await siguiente(user);
  await screen.findByText('Tu ubicación');
};

const renderPage = () =>
  render(
    <MemoryRouter>
      <ClienteProfilePage />
    </MemoryRouter>,
  );

describe('ClienteProfilePage: ubicación en el registro', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getProfile.mockRejectedValueOnce(new Error('sin perfil'));
    createProfile.mockResolvedValue({});
  });

  it('busca la dirección escrita y envía las coordenadas al crear la cuenta', async () => {
    const user = userEvent.setup();
    geocodeAddress.mockResolvedValueOnce({ lat: -5.19449, lng: -80.63282, displayName: 'Av. Grau 123, Piura' });
    renderPage();
    await llegarAlPasoUbicacion(user);

    await user.type(screen.getByPlaceholderText('Calle, número, distrito'), 'Av. Grau 123');
    await user.type(screen.getByPlaceholderText('Ej: Lima'), 'Piura');
    await user.click(screen.getByRole('button', { name: /Buscar mi dirección/ }));

    expect(geocodeAddress).toHaveBeenCalledWith('Av. Grau 123, Piura');
    await waitFor(() => expect(screen.getByTestId('mapa')).toHaveAttribute('data-lat', '-5.19449'));

    await siguiente(user);
    await user.click(await screen.findByRole('button', { name: /Crear mi cuenta/ }));

    await waitFor(() => expect(createProfile).toHaveBeenCalledTimes(1));
    expect(createProfile.mock.calls[0][0]).toMatchObject({
      nombres: 'Juan',
      direccion: 'Av. Grau 123',
      ciudad: 'Piura',
      latitud: -5.19449,
      longitud: -80.63282,
    });
  });

  it('la ubicación es opcional: sin marcar el mapa crea la cuenta sin coordenadas', async () => {
    const user = userEvent.setup();
    renderPage();
    await llegarAlPasoUbicacion(user);

    await siguiente(user);
    await user.click(await screen.findByRole('button', { name: /Crear mi cuenta/ }));

    await waitFor(() => expect(createProfile).toHaveBeenCalledTimes(1));
    expect(createProfile.mock.calls[0][0].latitud).toBeUndefined();
    expect(createProfile.mock.calls[0][0].longitud).toBeUndefined();
    expect(geocodeAddress).not.toHaveBeenCalled();
  });
});
