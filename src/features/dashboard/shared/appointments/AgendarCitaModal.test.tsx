import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const { create, getAvailableSlots, getMyPets } = vi.hoisted(() => ({
  create: vi.fn(),
  getAvailableSlots: vi.fn(),
  getMyPets: vi.fn(),
}));
vi.mock('./appointmentService', () => ({ appointmentService: { create, getAvailableSlots } }));
vi.mock('../../cliente/services/petService', () => ({ petService: { getMyPets } }));

import { AgendarCitaModal } from './AgendarCitaModal';
import { hoyLocal } from '../../../../shared/utils/fechas';

// V2: el cliente propone fecha y hora a un veterinario independiente (sin horario de atencion),
// y la reserva con una empresa sigue usando sus horarios disponibles.
describe('AgendarCitaModal', () => {
  beforeEach(() => {
    create.mockReset().mockResolvedValue({ id: 1, estado: 'SOLICITADA' });
    getAvailableSlots.mockReset().mockResolvedValue(['09:00:00', '09:30:00']);
    getMyPets.mockReset().mockResolvedValue([]);
  });

  it('veterinario independiente: no pide horarios de empresa y envia la propuesta sin empresaId', async () => {
    const user = userEvent.setup();
    render(<AgendarCitaModal isOpen onClose={vi.fn()} servicioId={8} veterinarioId={2} servicioNombre="Consulta a domicilio" />);

    expect(screen.getByText('Proponer Cita')).toBeInTheDocument();
    const fecha = document.querySelector('input[type="date"]') as HTMLInputElement;
    const manana = hoyLocal(new Date(Date.now() + 24 * 60 * 60 * 1000));
    expect(fecha.value).toBe(manana);
    expect(fecha.min).toBe(manana);

    fireEvent.change(document.querySelector('input[type="time"]') as HTMLInputElement, { target: { value: '16:30' } });
    await user.click(screen.getByRole('button', { name: /Enviar propuesta/i }));

    await waitFor(() => expect(create).toHaveBeenCalledTimes(1));
    const req = create.mock.calls[0][0];
    expect(req).toMatchObject({ servicioId: 8, fechaProgramada: manana, horaInicio: '16:30' });
    expect(req).not.toHaveProperty('empresaId');
    expect(getAvailableSlots).not.toHaveBeenCalled();
    expect(await screen.findByText(/El veterinario la confirmará o rechazará/)).toBeInTheDocument();
  });

  it('empresa: sigue mostrando los horarios disponibles y envia el empresaId', async () => {
    const user = userEvent.setup();
    render(<AgendarCitaModal isOpen onClose={vi.fn()} servicioId={30} empresaId={3} servicioNombre="Baño" />);

    expect(screen.getByText('Agendar Cita')).toBeInTheDocument();
    expect(document.querySelector('input[type="time"]')).toBeNull();
    await user.click(await screen.findByRole('button', { name: '09:30' }));
    await user.click(screen.getByRole('button', { name: /Solicitar Cita/i }));

    await waitFor(() => expect(create).toHaveBeenCalledTimes(1));
    expect(getAvailableSlots).toHaveBeenCalledWith(3, 30, hoyLocal());
    expect(create.mock.calls[0][0]).toMatchObject({ servicioId: 30, empresaId: 3, horaInicio: '09:30' });
  });
});
