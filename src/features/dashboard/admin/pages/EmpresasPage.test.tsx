import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('sweetalert2', () => ({ default: { fire: vi.fn() } }));

const getCompanies = vi.fn();
vi.mock('../services/adminService', () => ({
  adminService: {
    getCompanies: (params: unknown) => getCompanies(params),
    toggleCompanyStatus: vi.fn(),
  },
}));

import { EmpresasPage } from './EmpresasPage';

const empresa = (id: number, nombre: string) => ({
  id, nombreComercial: nombre, ruc: `2099988877${id}`, emailContacto: `e${id}@test.com`, tipoServicio: 'VETERINARIA',
  telefonoContacto: '987654321', direccion: 'Av. QA', ciudad: 'Lima', pais: 'Perú', estadoValidacion: 'PENDIENTE', createdAt: '2026-09-29T10:00:00',
});
const pagina = (n: number, totalElements: number) => ({
  content: [empresa(n, `Empresa ${n}`)], totalElements, totalPages: Math.ceil(totalElements / 20), size: 20, number: n,
  first: n === 0, last: false, empty: false, numberOfElements: 1,
});

const renderPage = () => render(
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    <EmpresasPage />
  </QueryClientProvider>,
);

describe('EmpresasPage: listado paginado en el servidor', () => {
  beforeEach(() => {
    getCompanies.mockReset();
    getCompanies.mockImplementation(({ page }: { page: number }) => Promise.resolve(pagina(page, 45)));
  });

  it('muestra el total real y permite ir a la página siguiente', async () => {
    renderPage();
    expect(await screen.findAllByText('Empresa 0')).not.toHaveLength(0);
    expect(screen.getByText('Página 1 de 3')).toBeTruthy();
    expect(screen.getByText('45')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));

    await waitFor(() => expect(getCompanies).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1, size: 20 })));
    expect(await screen.findByText('Página 2 de 3')).toBeTruthy();
  });

  it('la búsqueda y el filtro por estado se envían al backend y vuelven a la página 1', async () => {
    renderPage();
    await screen.findAllByText('Empresa 0');
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));
    await screen.findByText('Página 2 de 3');

    fireEvent.change(screen.getByPlaceholderText('Buscar por nombre, RUC o email...'), { target: { value: ' 20999 ' } });
    fireEvent.change(screen.getByLabelText('Filtrar por estado'), { target: { value: 'PENDIENTE' } });

    await waitFor(() => expect(getCompanies).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 0, q: '20999', estado: 'PENDIENTE' }),
    ));
  });
});
