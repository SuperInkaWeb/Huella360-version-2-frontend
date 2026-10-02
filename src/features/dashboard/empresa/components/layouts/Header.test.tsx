import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const { useEmpresaProfile } = vi.hoisted(() => ({ useEmpresaProfile: vi.fn() }));
vi.mock('../../hooks/useEmpresaProfile', () => ({ useEmpresaProfile }));
vi.mock('../../../../auth/context/useAuth', () => ({ useAuth: () => ({ role: 'EMPRESA', nombre: 'Usuario QA' }) }));

import { Header } from './Header';

const renderHeader = () => render(<MemoryRouter><Header onMenuClick={() => {}} /></MemoryRouter>);

const conEmpresa = (estadoValidacion: string) =>
  useEmpresaProfile.mockReturnValue({ data: { id: 3, nombreComercial: 'Veterinaria QA', estadoValidacion }, isLoading: false });

// H360-UX-002: el panel del negocio debe distinguirse de la vista del cliente.
describe('Header de empresa', () => {
  beforeEach(() => useEmpresaProfile.mockReset());

  it('identifica el panel del negocio y muestra el rol legible, sin el buscador muerto', () => {
    conEmpresa('VERIFICADO');
    renderHeader();

    expect(screen.getByText('Panel del negocio')).toBeInTheDocument();
    expect(screen.getByText('Veterinaria QA')).toBeInTheDocument();
    expect(screen.getByText('Empresa')).toBeInTheDocument();
    expect(screen.queryByText(/^empresa$/)).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/Buscar pacientes/i)).not.toBeInTheDocument();
  });

  it('VERIFICADO: enlaza al perfil público para verlo como cliente', () => {
    conEmpresa('VERIFICADO');
    renderHeader();

    expect(screen.getByRole('link', { name: /Ver como cliente/i })).toHaveAttribute('href', '/empresa/3');
  });

  it('PENDIENTE: no ofrece el perfil público porque aún no existe para los clientes', () => {
    conEmpresa('PENDIENTE');
    renderHeader();

    expect(screen.queryByRole('link', { name: /Ver como cliente/i })).not.toBeInTheDocument();
  });
});
