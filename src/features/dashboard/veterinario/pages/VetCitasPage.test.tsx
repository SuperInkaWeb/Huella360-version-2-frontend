import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const { get, patch, swalFire } = vi.hoisted(() => ({ get: vi.fn(), patch: vi.fn(), swalFire: vi.fn() }));
vi.mock('../../../../shared/http/api', () => ({ api: { get, patch } }));
vi.mock('../hooks/useVetProfile', () => ({ useVetProfile: () => ({ data: { idVeterinario: 2 } }) }));
vi.mock('sweetalert2', () => ({ default: { fire: swalFire } }));

import { VetCitasPage } from './VetCitasPage';

const propuesta = {
  id: 50, clienteNombre: 'cliente@test.com', mascotaNombre: 'Firulais', servicioNombre: 'Consulta a domicilio',
  fechaProgramada: '2026-10-02', horaInicio: '16:00:00', horaFin: '16:45:00', estado: 'SOLICITADA', notasCliente: 'Cojea',
};

const renderPage = () => render(
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    <VetCitasPage />
  </QueryClientProvider>,
);

// V2: la agenda leia cita.idCita, pero el backend devuelve "id": Confirmar/Rechazar llamaban a
// /appointments/undefined/status y siempre fallaban.
describe('VetCitasPage: confirmar o rechazar una propuesta', () => {
  beforeEach(() => {
    get.mockReset().mockResolvedValue({ data: { data: [propuesta] } });
    patch.mockReset().mockResolvedValue({ data: { data: { ...propuesta, estado: 'CONFIRMADA' } } });
    swalFire.mockReset().mockResolvedValue({ isConfirmed: true });
  });

  it('confirmar usa el id real de la cita', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByRole('button', { name: /Confirmar/i }));

    await waitFor(() => expect(patch).toHaveBeenCalled());
    expect(patch).toHaveBeenCalledWith('/appointments/50/status', null, { params: { estado: 'CONFIRMADA' } });
  });

  it('rechazar usa el id real de la cita', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByRole('button', { name: /Rechazar/i }));

    await waitFor(() => expect(patch).toHaveBeenCalledWith('/appointments/50/status', null, { params: { estado: 'RECHAZADA' } }));
  });

  it('si el backend rechaza la confirmacion (cruce de horario), muestra su mensaje', async () => {
    const msg = 'Ya tienes otra cita confirmada en ese horario. Rechaza esta propuesta o reprograma la otra.';
    patch.mockRejectedValueOnce({ response: { data: { message: msg } } });
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByRole('button', { name: /Confirmar/i }));

    await waitFor(() => expect(swalFire).toHaveBeenCalledWith('Error', msg, 'error'));
  });
});
