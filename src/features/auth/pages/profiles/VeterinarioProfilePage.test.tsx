import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const { getProfile, createProfile, swalFire, setPerfilCompleto } = vi.hoisted(() => ({
  getProfile: vi.fn(),
  createProfile: vi.fn(),
  swalFire: vi.fn(),
  // Referencia estable: el useEffect de la pagina depende de ella.
  setPerfilCompleto: vi.fn(),
}));

vi.mock('../../services/profileService', () => ({
  profileService: { getVeterinarioProfile: getProfile, createVeterinarioProfile: createProfile },
}));
vi.mock('../../../auth/context/useAuth', () => ({
  useAuth: () => ({ setPerfilCompleto }),
}));
vi.mock('sweetalert2', () => ({ default: { fire: swalFire } }));

import { VeterinarioProfilePage } from './VeterinarioProfilePage';

const DUPLICADA = 'El número de colegiatura ya está registrado';

const llegarAlPasoFinal = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(await screen.findByPlaceholderText('Tus nombres'), 'Ana');
  await user.type(screen.getByPlaceholderText('Tus apellidos'), 'Ramos');
  await user.click(screen.getByRole('button', { name: /Siguiente/ }));
  await user.type(await screen.findByPlaceholderText('Ej: Medicina Interna'), 'Medicina Interna');
  await user.type(screen.getByPlaceholderText('Ej: 12345'), '54377');
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
    await user.click(await screen.findByRole('button', { name: /Ir al Portal Médico/ }));

    await waitFor(() => expect(createProfile).toHaveBeenCalledTimes(2));
    expect(createProfile.mock.calls[1][0]).toMatchObject({ numeroColegiatura: '54378', nombres: 'Ana' });
  });

  it('en el paso final se puede volver atrás antes de guardar', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><VeterinarioProfilePage /></MemoryRouter>);

    await llegarAlPasoFinal(user);
    await user.click(screen.getByRole('button', { name: 'Atrás' }));

    expect(await screen.findByPlaceholderText('Ej: 12345')).toHaveValue('54377');
    expect(createProfile).not.toHaveBeenCalled();
  });
});
