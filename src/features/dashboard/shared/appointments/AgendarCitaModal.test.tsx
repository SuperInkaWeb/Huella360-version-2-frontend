import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const { create, getDisponibilidad, getMyPets } = vi.hoisted(() => ({
  create: vi.fn(),
  getDisponibilidad: vi.fn(),
  getMyPets: vi.fn(),
}));
vi.mock('./appointmentService', () => ({ appointmentService: { create, getDisponibilidad } }));
vi.mock('../../cliente/services/petService', () => ({ petService: { getMyPets } }));

import { AgendarCitaModal } from './AgendarCitaModal';
import { hoyLocal } from '../../../../shared/utils/fechas';

const manana = hoyLocal(new Date(Date.now() + 24 * 60 * 60 * 1000));

const conBloques = {
  horarioConfigurado: true,
  slots: [
    { hora: '09:00:00', disponible: true },
    { hora: '09:30:00', disponible: false },
    { hora: '10:00:00', disponible: true },
  ],
};

// El cliente reserva un bloque del horario de atencion (empresa o veterinario independiente) y ve
// los bloques ocupados; si el veterinario no configuro horario, propone libremente la hora.
describe('AgendarCitaModal', () => {
  beforeEach(() => {
    create.mockReset().mockResolvedValue({ id: 1, estado: 'SOLICITADA' });
    getDisponibilidad.mockReset().mockResolvedValue(conBloques);
    getMyPets.mockReset().mockResolvedValue([]);
  });

  it('veterinario sin horario configurado: el cliente propone la hora y se envia sin empresaId', async () => {
    getDisponibilidad.mockResolvedValue({ horarioConfigurado: false, slots: [] });
    const user = userEvent.setup();
    render(<AgendarCitaModal isOpen onClose={vi.fn()} servicioId={8} veterinarioId={2} servicioNombre="Consulta a domicilio" />);

    const fecha = document.querySelector('input[type="date"]') as HTMLInputElement;
    expect(fecha.value).toBe(manana);
    expect(fecha.min).toBe(manana);

    await screen.findByText(/no tiene horario fijo/);
    expect(screen.getByText('Proponer Cita')).toBeInTheDocument();
    fireEvent.change(document.querySelector('input[type="time"]') as HTMLInputElement, { target: { value: '16:30' } });
    await user.click(screen.getByRole('button', { name: /Enviar propuesta/i }));

    await waitFor(() => expect(create).toHaveBeenCalledTimes(1));
    const req = create.mock.calls[0][0];
    expect(req).toMatchObject({ servicioId: 8, fechaProgramada: manana, horaInicio: '16:30' });
    expect(req).not.toHaveProperty('empresaId');
    expect(await screen.findByText(/El veterinario la confirmará o rechazará/)).toBeInTheDocument();
  });

  it('veterinario con horario: muestra sus bloques, los ocupados no se pueden elegir', async () => {
    const user = userEvent.setup();
    render(<AgendarCitaModal isOpen onClose={vi.fn()} servicioId={8} veterinarioId={2} servicioNombre="Consulta a domicilio" />);

    const ocupado = await screen.findByRole('button', { name: '09:30 ocupado' });
    expect(ocupado).toBeDisabled();
    expect(document.querySelector('input[type="time"]')).toBeNull();
    expect(getDisponibilidad).toHaveBeenCalledWith(8, manana);

    await user.click(ocupado);
    expect(screen.getByRole('button', { name: /Solicitar Cita/i })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: '10:00' }));
    await user.click(screen.getByRole('button', { name: /Solicitar Cita/i }));

    await waitFor(() => expect(create).toHaveBeenCalledTimes(1));
    const req = create.mock.calls[0][0];
    expect(req).toMatchObject({ servicioId: 8, fechaProgramada: manana, horaInicio: '10:00' });
    expect(req).not.toHaveProperty('empresaId');
  });

  it('veterinario: si no se puede leer su horario, queda la propuesta libre', async () => {
    getDisponibilidad.mockRejectedValueOnce(new Error('404'));
    render(<AgendarCitaModal isOpen onClose={vi.fn()} servicioId={8} veterinarioId={2} servicioNombre="Consulta a domicilio" />);

    expect(await screen.findByText(/no tiene horario fijo/)).toBeInTheDocument();
    expect(document.querySelector('input[type="time"]')).not.toBeNull();
  });

  it('empresa: muestra libres y ocupados desde manana y envia el empresaId', async () => {
    const user = userEvent.setup();
    render(<AgendarCitaModal isOpen onClose={vi.fn()} servicioId={30} empresaId={3} servicioNombre="Baño" />);

    expect(screen.getByText('Agendar Cita')).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: '09:30 ocupado' })).toBeDisabled();
    expect(document.querySelector('input[type="time"]')).toBeNull();
    // El backend exige fecha futura: ya no se ofrece la fecha de hoy
    expect((document.querySelector('input[type="date"]') as HTMLInputElement).min).toBe(manana);

    await user.click(screen.getByRole('button', { name: '09:00' }));
    await user.click(screen.getByRole('button', { name: /Solicitar Cita/i }));

    await waitFor(() => expect(create).toHaveBeenCalledTimes(1));
    expect(getDisponibilidad).toHaveBeenCalledWith(30, manana);
    expect(create.mock.calls[0][0]).toMatchObject({ servicioId: 30, empresaId: 3, fechaProgramada: manana, horaInicio: '09:00' });
  });

  it('empresa: sin atencion ese dia o con todo ocupado, lo explica', async () => {
    getDisponibilidad.mockResolvedValueOnce({ horarioConfigurado: true, slots: [] });
    const { unmount } = render(<AgendarCitaModal isOpen onClose={vi.fn()} servicioId={30} empresaId={3} servicioNombre="Baño" />);
    expect(await screen.findByText(/No hay atención en esta fecha/)).toBeInTheDocument();
    unmount();

    getDisponibilidad.mockResolvedValueOnce({ horarioConfigurado: true, slots: [{ hora: '09:00:00', disponible: false }] });
    render(<AgendarCitaModal isOpen onClose={vi.fn()} servicioId={30} empresaId={3} servicioNombre="Baño" />);
    expect(await screen.findByText(/Todos los horarios de esta fecha están ocupados/)).toBeInTheDocument();
  });
});
