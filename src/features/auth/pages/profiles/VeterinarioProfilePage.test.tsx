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
  profileService: { getVeterinarioProfile: getProfile, createVeterinarioProfile: createProfile },
}));
vi.mock('../../../auth/context/useAuth', () => ({
  useAuth: () => ({ setPerfilCompleto }),
}));
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

import { VeterinarioProfilePage } from './VeterinarioProfilePage';

const DUPLICADA = 'El número de colegiatura ya está registrado';

const llegarAlPasoUbicacion = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(await screen.findByPlaceholderText('Tus nombres'), 'Ana');
  await user.type(screen.getByPlaceholderText('Tus apellidos'), 'Ramos');
  await user.click(screen.getByRole('button', { name: /Siguiente/ }));
  await user.type(await screen.findByPlaceholderText('Ej: Medicina Interna'), 'Medicina Interna');
  await user.type(screen.getByPlaceholderText('Ej: 12345'), '54377');
  await user.click(screen.getByRole('button', { name: /Siguiente/ }));
  await screen.findByPlaceholderText('Calle, número');
};

const llegarAlPasoFinal = async (user: ReturnType<typeof userEvent.setup>) => {
  await llegarAlPasoUbicacion(user);
  await user.click(screen.getByRole('button', { name: /Siguiente/ }));
  await screen.findByRole('button', { name: /Ir al Portal Médico/ });
};

describe('VeterinarioProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getProfile.mockRejectedValueOnce(new Error('sin perfil'));
  });

  it('si la colegiatura ya existe, vuelve al paso del dato con el error y permite corregirla', async () => {
    const user = userEvent.setup();
    createProfile.mockRejectedValueOnce({ response: { data: { message: DUPLICADA } } });
    createProfile.mockResolvedValueOnce({});
    render(<MemoryRouter><VeterinarioProfilePage /></MemoryRouter>);

    await llegarAlPasoFinal(user);
    await user.click(screen.getByRole('button', { name: /Ir al Portal Médico/ }));

    const colegiatura = await screen.findByPlaceholderText('Ej: 12345');
    expect(colegiatura).toHaveValue('54377');
    expect(screen.getByText(DUPLICADA)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ej: Medicina Interna')).toHaveValue('Medicina Interna');

    await user.clear(colegiatura);
    await user.type(colegiatura, '54378');
    await user.click(screen.getByRole('button', { name: /Siguiente/ }));
    await screen.findByPlaceholderText('Calle, número');
    await user.click(screen.getByRole('button', { name: /Siguiente/ }));
    await user.click(await screen.findByRole('button', { name: /Ir al Portal Médico/ }));

    await waitFor(() => expect(createProfile).toHaveBeenCalledTimes(2));
    expect(createProfile.mock.calls[1][0]).toMatchObject({ numeroColegiatura: '54378', nombres: 'Ana' });
  });

  it('en el paso final se puede volver atrás antes de guardar', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><VeterinarioProfilePage /></MemoryRouter>);

    await llegarAlPasoFinal(user);
    await user.click(screen.getByRole('button', { name: 'Atrás' }));

    expect(await screen.findByPlaceholderText('Calle, número')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Atrás' }));

    expect(await screen.findByPlaceholderText('Ej: 12345')).toHaveValue('54377');
    expect(createProfile).not.toHaveBeenCalled();
  });

  it('ubica la dirección escrita y envía la ubicación al guardar el perfil', async () => {
    const user = userEvent.setup();
    geocodeAddress.mockResolvedValueOnce({ lat: -5.19449, lng: -80.63282, displayName: 'Av. Grau 123, Piura' });
    createProfile.mockResolvedValueOnce({});
    render(<MemoryRouter><VeterinarioProfilePage /></MemoryRouter>);

    await llegarAlPasoUbicacion(user);
    await user.type(screen.getByPlaceholderText('Ej: Lima'), 'Piura');
    await user.type(screen.getByPlaceholderText('Calle, número'), 'Av. Grau 123');
    await user.click(screen.getByRole('button', { name: /Buscar mi dirección/ }));

    expect(geocodeAddress).toHaveBeenCalledWith('Av. Grau 123, Piura');
    await waitFor(() => expect(screen.getByTestId('mapa')).toHaveAttribute('data-lat', '-5.19449'));

    await user.click(screen.getByRole('button', { name: /Siguiente/ }));
    await user.click(await screen.findByRole('button', { name: /Ir al Portal Médico/ }));

    await waitFor(() => expect(createProfile).toHaveBeenCalledTimes(1));
    expect(createProfile.mock.calls[0][0]).toMatchObject({
      ciudad: 'Piura',
      direccion: 'Av. Grau 123',
      latitud: -5.19449,
      longitud: -80.63282,
    });
  });

  it('la ubicación es opcional: sin marcarla el perfil se guarda sin coordenadas', async () => {
    const user = userEvent.setup();
    createProfile.mockResolvedValueOnce({});
    render(<MemoryRouter><VeterinarioProfilePage /></MemoryRouter>);

    await llegarAlPasoFinal(user);
    await user.click(screen.getByRole('button', { name: /Ir al Portal Médico/ }));

    await waitFor(() => expect(createProfile).toHaveBeenCalledTimes(1));
    const enviado = createProfile.mock.calls[0][0];
    expect(enviado.latitud).toBeUndefined();
    expect(enviado.longitud).toBeUndefined();
    expect(enviado.direccion).toBeUndefined();
    expect(geocodeAddress).not.toHaveBeenCalled();
  });
});
