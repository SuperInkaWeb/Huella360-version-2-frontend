import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const { getProfile, createProfile, swalFire, setPerfilCompleto, setEmpresaId, geocodeAddress } = vi.hoisted(() => ({
  getProfile: vi.fn(),
  createProfile: vi.fn(),
  swalFire: vi.fn(),
  // Referencias estables: el useEffect de la pagina depende de ellas.
  setPerfilCompleto: vi.fn(),
  setEmpresaId: vi.fn(),
  geocodeAddress: vi.fn(),
}));

vi.mock('../../services/profileService', () => ({
  profileService: { getEmpresaProfile: getProfile, createEmpresaProfile: createProfile },
}));
vi.mock('../../../auth/context/useAuth', () => ({
  useAuth: () => ({ setPerfilCompleto, setEmpresaId }),
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

import { EmpresaProfilePage } from './EmpresaProfilePage';

const siguiente = (user: ReturnType<typeof userEvent.setup>) =>
  user.click(screen.getByRole('button', { name: /Siguiente/ }));

const llegarAlPasoUbicacion = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(await screen.findByPlaceholderText('Ej: Mi Empresa S.A.C.'), 'Patitas SAC');
  await user.type(screen.getByPlaceholderText('Ej: 20606677074'), '20606677074');
  await siguiente(user);
  await user.type(await screen.findByPlaceholderText('Nombre que ven los clientes'), 'Patitas');
  await user.selectOptions(screen.getByRole('combobox'), 'VETERINARIA');
  await user.type(screen.getByPlaceholderText('Ej: 999888777'), '999888777');
  await user.type(screen.getByPlaceholderText('contacto@empresa.com'), 'hola@patitas.pe');
  await user.type(screen.getByPlaceholderText('Ej: Lima'), 'Piura');
  await user.type(screen.getByPlaceholderText('Calle, número'), 'Av. Grau 123');
  await siguiente(user);
  await screen.findByText('Ubicación del negocio');
};

describe('EmpresaProfilePage: ubicación en el registro', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getProfile.mockRejectedValueOnce(new Error('sin perfil'));
  });

  it('ubica sola la dirección escrita y envía las coordenadas al activar la empresa', async () => {
    const user = userEvent.setup();
    geocodeAddress.mockResolvedValueOnce({ lat: -5.19449, lng: -80.63282, displayName: 'Av. Grau 123, Piura' });
    createProfile.mockResolvedValueOnce({ data: { id: 7 } });
    render(<MemoryRouter><EmpresaProfilePage /></MemoryRouter>);

    await llegarAlPasoUbicacion(user);

    expect(geocodeAddress).toHaveBeenCalledWith('Av. Grau 123, Piura');
    await waitFor(() => expect(screen.getByTestId('mapa')).toHaveAttribute('data-lat', '-5.19449'));

    await siguiente(user);
    await screen.findByText('Imágenes de marca');
    await siguiente(user);
    await user.click(await screen.findByRole('button', { name: /Activar Empresa/ }));

    await waitFor(() => expect(createProfile).toHaveBeenCalledTimes(1));
    expect(createProfile.mock.calls[0][0]).toMatchObject({
      nombreComercial: 'Patitas',
      direccion: 'Av. Grau 123',
      latitud: -5.19449,
      longitud: -80.63282,
    });
  });

  it('sin punto en el mapa no deja continuar; al marcarlo sí', async () => {
    const user = userEvent.setup();
    geocodeAddress.mockResolvedValueOnce(null);
    render(<MemoryRouter><EmpresaProfilePage /></MemoryRouter>);

    await llegarAlPasoUbicacion(user);
    expect(await screen.findByText(/No encontramos esa dirección/)).toBeInTheDocument();

    await siguiente(user);
    expect(screen.getByRole('alert')).toHaveTextContent('Marca en el mapa dónde está tu negocio');
    expect(screen.queryByText('Imágenes de marca')).not.toBeInTheDocument();

    await user.click(screen.getByTestId('mapa'));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    await siguiente(user);

    expect(await screen.findByText('Imágenes de marca')).toBeInTheDocument();
  });

  it('si la búsqueda de la dirección falla, se puede marcar el punto a mano', async () => {
    const user = userEvent.setup();
    geocodeAddress.mockRejectedValueOnce(new Error('sin red'));
    render(<MemoryRouter><EmpresaProfilePage /></MemoryRouter>);

    await llegarAlPasoUbicacion(user);
    expect(await screen.findByText(/No se pudo buscar la dirección/)).toBeInTheDocument();

    await user.click(screen.getByTestId('mapa'));
    await siguiente(user);

    expect(await screen.findByText('Imágenes de marca')).toBeInTheDocument();
  });
});
