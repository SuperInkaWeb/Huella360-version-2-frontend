import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const { createService, swalFire } = vi.hoisted(() => ({ createService: vi.fn(), swalFire: vi.fn() }));
vi.mock('../services/vetService', () => ({ vetService: { createService, updateService: vi.fn() } }));
// SweetAlert2 no funciona en jsdom: se verifica con que se invoca.
vi.mock('sweetalert2', () => ({ default: { fire: swalFire } }));

import { VetServiceModal } from './VetServiceModal';

// H360-QA-VET V4: al superar el limite de servicios del plan, el veterinario veia
// "Ocurrió un error al guardar el servicio" sin saber por que ni como mejorar su plan.
const llenarYGuardar = async () => {
  const user = userEvent.setup();
  render(<VetServiceModal isOpen onClose={vi.fn()} onSuccess={vi.fn()} />);
  const file = new File(['x'], 'foto.png', { type: 'image/png' });
  await user.upload(document.querySelector('input[type="file"]') as HTMLInputElement, file);
  await user.type(screen.getByPlaceholderText('Ej: Consulta General'), 'Consulta QA');
  await user.type(screen.getByPlaceholderText('0.00'), '20');
  await user.click(screen.getByRole('button', { name: /Guardar/i }));
};

describe('VetServiceModal: errores al crear un servicio', () => {
  beforeEach(() => {
    createService.mockReset();
    swalFire.mockReset().mockResolvedValue({ isConfirmed: false });
    URL.createObjectURL = vi.fn(() => 'blob:preview');
    document.body.innerHTML = '';
  });

  it('si el backend rechaza por el limite del plan, muestra su mensaje y ofrece ver planes', async () => {
    createService.mockRejectedValueOnce({
      response: { data: { message: 'Has alcanzado el límite de 4 servicio(s) de tu plan Huella Free B2B. Actualiza tu plan para agregar más.' } },
    });

    await llenarYGuardar();

    await waitFor(() => expect(swalFire).toHaveBeenCalled());
    const opciones = swalFire.mock.calls[0][0];
    expect(opciones.title).toBe('Límite de tu plan');
    expect(opciones.text).toMatch(/Has alcanzado el límite de 4 servicio/);
    expect(opciones.confirmButtonText).toBe('Ver planes');
  });

  it('otros errores del backend muestran su mensaje en vez de uno generico', async () => {
    createService.mockRejectedValueOnce({ response: { data: { message: 'La imagen supera el tamaño permitido' } } });

    await llenarYGuardar();

    await waitFor(() => expect(swalFire).toHaveBeenCalledWith('Error', 'La imagen supera el tamaño permitido', 'error'));
  });

  it('sin respuesta del backend mantiene el mensaje generico', async () => {
    createService.mockRejectedValueOnce(new Error('Network Error'));

    await llenarYGuardar();

    await waitFor(() => expect(swalFire).toHaveBeenCalledWith('Error', 'Ocurrió un error al guardar el servicio', 'error'));
  });
});
