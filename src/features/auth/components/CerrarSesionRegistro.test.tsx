import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Quien inicia sesión con una cuenta sin perfil queda dentro del registro (AuthRedirector lo devuelve ahí
// desde cualquier página, incluso /login). Sin este botón no podía salir ni entrar con otra cuenta.

const { logout, auth } = vi.hoisted(() => {
  const logout = vi.fn();
  return { logout, auth: { nombre: 'Walter' as string | null, logout } };
});

vi.mock('../context/useAuth', () => ({ useAuth: () => auth }));

import { CerrarSesionRegistro } from './CerrarSesionRegistro';
import { WizardLayout } from '../../../components/ui/WizardLayout';

describe('CerrarSesionRegistro', () => {
  beforeEach(() => {
    logout.mockReset();
    auth.nombre = 'Walter';
  });

  it('cierra la sesión al pulsar el botón', async () => {
    render(<CerrarSesionRegistro />);

    await userEvent.click(screen.getByRole('button', { name: /Cerrar sesión/ }));

    expect(logout).toHaveBeenCalledTimes(1);
  });

  it('muestra con qué cuenta se inició sesión', () => {
    render(<CerrarSesionRegistro />);

    expect(screen.getByText('Walter')).toBeInTheDocument();
  });

  it('sin nombre, muestra solo el botón', () => {
    auth.nombre = null;
    render(<CerrarSesionRegistro />);

    expect(screen.queryByText(/Conectado como/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cerrar sesión/ })).toBeInTheDocument();
  });

  it('está en los formularios de perfil (WizardLayout)', () => {
    render(
      <WizardLayout steps={[]} currentStep={0} title="Completa tu perfil">
        <p>contenido</p>
      </WizardLayout>,
    );

    expect(screen.getByRole('button', { name: /Cerrar sesión/ })).toBeInTheDocument();
  });

  it('no aparece mientras el formulario carga', () => {
    render(
      <WizardLayout steps={[]} currentStep={0} title="Completa tu perfil" isLoading>
        <p>contenido</p>
      </WizardLayout>,
    );

    expect(screen.queryByRole('button', { name: /Cerrar sesión/ })).not.toBeInTheDocument();
  });
});
