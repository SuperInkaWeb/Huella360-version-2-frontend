import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ComponentType } from 'react';

// H360: las paginas de pago exitoso del veterinario y del cliente llamaban a POST /subscriptions/sync-payment,
// que no existe en el backend (404): mostraban "hubo un problema al activar tu plan" aunque el webhook
// ya lo hubiera activado (retest V1 del 27-09, pago 181166901376 del vet02).

const { syncPayment } = vi.hoisted(() => ({ syncPayment: vi.fn() }));
vi.mock('./services/subscriptionService', () => ({ subscriptionService: { syncPayment } }));
vi.mock('react-confetti', () => ({ default: () => null }));
vi.mock('react-use', () => ({ useWindowSize: () => ({ width: 1024, height: 768 }) }));

import { VetPaymentSuccessPage } from '../../veterinario/pages/VetPaymentSuccessPage';
import { ClientePaymentSuccessPage } from '../../cliente/pages/ClientePaymentSuccessPage';
import { PaymentSuccessPage } from '../../empresa/pages/PaymentSuccessPage';

const RETORNO_MP = '/pago-exitoso?payment_id=181166901376&status=approved&external_reference=SUB-2-5';

const paginas: [string, ComponentType][] = [
  ['veterinario', VetPaymentSuccessPage],
  ['cliente', ClientePaymentSuccessPage],
  ['empresa', PaymentSuccessPage],
];

describe.each(paginas)('Pago exitoso de suscripción (%s)', (_rol, Pagina) => {
  beforeEach(() => syncPayment.mockReset());

  const renderPagina = (url = RETORNO_MP) => render(<MemoryRouter initialEntries={[url]}><Pagina /></MemoryRouter>);

  it('sincroniza con GET /payments/sync (payment_id + external_reference) y confirma el plan', async () => {
    syncPayment.mockResolvedValue(undefined);
    renderPagina();

    expect(syncPayment).toHaveBeenCalledWith('181166901376', 'SUB-2-5');
    expect(await screen.findByText('¡Pago Completado!')).toBeInTheDocument();
    expect(screen.getByText(/Tu plan ha sido activado exitosamente/)).toBeInTheDocument();
  });

  it('si la sincronización falla muestra el mensaje del backend', async () => {
    syncPayment.mockRejectedValueOnce({ response: { data: { message: 'El pago no pertenece a este usuario' } } });
    renderPagina();

    expect(await screen.findByText('El pago no pertenece a este usuario')).toBeInTheDocument();
  });

  // Mercado Pago vuelve a esta misma pantalla con cualquier resultado. Antes mostraba "¡Pago Completado!"
  // y "Tu plan ha sido activado" aunque el pago se hubiera rechazado o abandonado (lanzamiento, 05-10).
  it.each([
    ['rechazado', '/pago-exitoso?payment_id=181166901376&status=rejected&external_reference=SUB-2-5'],
    ['abandonado (status=null)', '/pago-exitoso?status=null&external_reference=SUB-2-5'],
    ['sin parámetros', '/pago-exitoso'],
  ])('pago %s: avisa que no se completó y no sincroniza', async (_caso, url) => {
    renderPagina(url);

    await waitFor(() => expect(screen.getByText('El pago no se completó')).toBeInTheDocument());
    expect(screen.queryByText('¡Pago Completado!')).not.toBeInTheDocument();
    expect(screen.queryByText(/Tu plan ha sido activado/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Intentar de nuevo/ })).toBeInTheDocument();
    expect(syncPayment).not.toHaveBeenCalled();
  });

  it('pago pendiente: avisa que está en revisión y no lo da por completado', async () => {
    renderPagina('/pago-exitoso?payment_id=181166901376&status=pending&external_reference=SUB-2-5');

    await waitFor(() => expect(screen.getByText('Pago en revisión')).toBeInTheDocument());
    expect(screen.queryByText('¡Pago Completado!')).not.toBeInTheDocument();
    expect(syncPayment).not.toHaveBeenCalled();
  });
});
