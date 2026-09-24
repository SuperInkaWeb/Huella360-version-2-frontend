import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

// getAccessTokenSilently debe ser una referencia estable (como en Auth0 real): el useEffect depende de ella.
const { apiGet, apiPatch, getToken } = vi.hoisted(() => ({ apiGet: vi.fn(), apiPatch: vi.fn(), getToken: vi.fn() }));

vi.mock('../../../shared/http/api', () => ({ api: { get: apiGet, patch: apiPatch } }));
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({ getAccessTokenSilently: getToken }),
}));
vi.mock('../context/useAuth', () => ({
  // Estado real para que setRole/setPerfilCompleto re-rendericen la pagina como en la app.
  useAuth: () => {
    const [role, setRole] = useState<string | null>(null);
    const [perfilCompleto, setPerfilCompleto] = useState(false);
    return { isAuthenticated: true, role, perfilCompleto, setRole, setPerfilCompleto };
  },
}));

import { RoleSelectionPage } from './RoleSelectionPage';

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/register/rol']}>
      <Routes>
        <Route path="/register/rol" element={<RoleSelectionPage />} />
        <Route path="/portal/empresa" element={<p>PORTAL EMPRESA</p>} />
        <Route path="/register/perfil/cliente" element={<p>PERFIL CLIENTE</p>} />
      </Routes>
    </MemoryRouter>,
  );

const networkError = () => Object.assign(new Error('Network Error'), { response: undefined });
const meResponse = (rol: string | null) => ({ data: { data: { rol } } });

describe('RoleSelectionPage', () => {
  beforeEach(() => {
    apiGet.mockReset();
    apiPatch.mockReset();
    getToken.mockReset().mockResolvedValue('token');
    localStorage.clear();
  });

  it('si el backend no responde, muestra reintentar y NO la seleccion de rol', async () => {
    apiGet.mockRejectedValueOnce(networkError());

    renderPage();

    expect(await screen.findByText('No pudimos verificar tu cuenta')).toBeInTheDocument();
    expect(screen.queryByText('¿Cómo usarás la plataforma?')).not.toBeInTheDocument();
  });

  it('un 5xx tambien se trata como fallo de verificacion', async () => {
    apiGet.mockRejectedValueOnce({ response: { status: 503 } });

    renderPage();

    expect(await screen.findByText('No pudimos verificar tu cuenta')).toBeInTheDocument();
  });

  it('al reintentar con el backend ya disponible, una empresa existente va a su portal', async () => {
    apiGet
      .mockRejectedValueOnce(networkError())
      .mockResolvedValueOnce(meResponse('EMPRESA')) // /users/me
      .mockResolvedValueOnce({ data: {} }); // /companies/me -> perfil completo

    renderPage();
    await userEvent.click(await screen.findByRole('button', { name: 'Reintentar' }));

    expect(await screen.findByText('PORTAL EMPRESA')).toBeInTheDocument();
  });

  it('un usuario nuevo (sin rol) sigue viendo la seleccion de rol', async () => {
    apiGet.mockResolvedValueOnce(meResponse(null));

    renderPage();

    expect(await screen.findByText('¿Cómo usarás la plataforma?')).toBeInTheDocument();
    expect(screen.queryByText('No pudimos verificar tu cuenta')).not.toBeInTheDocument();
  });

  it('si el backend responde 400 "ya esta definido como EMPRESA", re-verifica y lleva al portal', async () => {
    apiGet
      .mockResolvedValueOnce(meResponse(null)) // carga inicial (p. ej. dato desactualizado)
      .mockResolvedValueOnce(meResponse('EMPRESA')) // re-verificacion tras el rechazo
      .mockResolvedValueOnce({ data: {} }); // /companies/me
    apiPatch.mockRejectedValueOnce({
      response: { status: 400, data: { message: 'Tu rol ya está definido como EMPRESA y no puede ser cambiado desde aquí' } },
    });

    renderPage();
    await userEvent.click(await screen.findByText('Cliente'));
    await userEvent.click(screen.getByRole('button', { name: /Continuar como/ }));

    expect(await screen.findByText('PORTAL EMPRESA')).toBeInTheDocument();
    await waitFor(() => expect(apiPatch).toHaveBeenCalledTimes(1));
  });

  it('otros errores al guardar el rol se siguen mostrando en pantalla', async () => {
    apiGet.mockResolvedValueOnce(meResponse(null));
    apiPatch.mockRejectedValueOnce({ response: { status: 400, data: { message: 'Error de validación en los datos enviados' } } });

    renderPage();
    await userEvent.click(await screen.findByText('Cliente'));
    await userEvent.click(screen.getByRole('button', { name: /Continuar como/ }));

    expect(await screen.findByText('Error de validación en los datos enviados')).toBeInTheDocument();
  });
});
