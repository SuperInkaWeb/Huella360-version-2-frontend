import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

// H360: el checkout cortaba la compra si la veterinaria no tenia mpPublicKey propia, aunque los
// cobros son centralizados (el backend usa MP_ACCESS_TOKEN de la plataforma) y el panel de empresa
// dice que no hace falta configurar Mercado Pago. Resultado en QA (2026-09-25): ningun cliente podia
// comprar ("Esta veterinaria no tiene configurada su pasarela de pagos").

const { createOrder, getPaymentLink } = vi.hoisted(() => ({ createOrder: vi.fn(), getPaymentLink: vi.fn() }));

vi.mock('../services/marketplaceService', () => ({
  marketplaceService: { createOrder, getPaymentLink, createGuestOrder: vi.fn(), getGuestPaymentLink: vi.fn() },
}));
vi.mock('../context/CartContext', () => ({
  useCart: () => ({
    items: [
      // Producto de una veterinaria SIN credenciales de Mercado Pago propias
      { id: 1, nombre: 'Pelota de goma', precio: 35.5, quantity: 1, empresaId: 3, empresaNombre: 'Veterinaria QA', mpPublicKey: undefined },
    ],
    cartTotal: 35.5,
  }),
}));
vi.mock('../../auth/context/useAuth', () => ({ useAuth: () => ({ isAuthenticated: true }) }));
vi.mock('../../dashboard/gamification/hooks/useGamification', () => ({
  useAvailableCheckoutRewards: () => ({ data: [] }),
}));

import { CheckoutPage } from './CheckoutPage';

const renderPage = () => render(<MemoryRouter><CheckoutPage /></MemoryRouter>);

describe('CheckoutPage', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    createOrder.mockReset().mockResolvedValue(10);
    getPaymentLink.mockReset().mockResolvedValue({
      preferenceId: 'pref-1',
      initPoint: 'https://www.mercadopago.com.pe/checkout/v1/redirect?pref_id=pref-1',
      sandboxInitPoint: 'https://sandbox.mercadopago.com.pe/checkout/v1/redirect?pref_id=pref-1',
    });
    Object.defineProperty(window, 'location', { configurable: true, value: { ...originalLocation, href: '' } });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', { configurable: true, value: originalLocation });
    vi.unstubAllEnvs();
  });

  it('permite pagar aunque la veterinaria no tenga credenciales de Mercado Pago propias', async () => {
    renderPage();

    await userEvent.click(screen.getByRole('button', { name: /Pagar con MercadoPago/i }));

    await waitFor(() => expect(window.location.href).toContain('pref_id=pref-1'));
    expect(createOrder).toHaveBeenCalledWith(expect.objectContaining({ empresaId: 3 }));
    expect(screen.queryByText(/no tiene configurada su pasarela de pagos/i)).not.toBeInTheDocument();
  });

  it('con credenciales APP_USR- de la plataforma usa initPoint', async () => {
    vi.stubEnv('VITE_MP_PUBLIC_KEY', 'APP_USR-abc');
    renderPage();

    await userEvent.click(screen.getByRole('button', { name: /Pagar con MercadoPago/i }));

    await waitFor(() => expect(window.location.href).toBe('https://www.mercadopago.com.pe/checkout/v1/redirect?pref_id=pref-1'));
  });

  it('con credenciales TEST- de la plataforma usa sandboxInitPoint y muestra el aviso de pruebas', async () => {
    vi.stubEnv('VITE_MP_PUBLIC_KEY', 'TEST-abc');
    renderPage();

    expect(screen.getByText(/Modo Sandbox/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Pagar con MercadoPago/i }));

    await waitFor(() => expect(window.location.href).toBe('https://sandbox.mercadopago.com.pe/checkout/v1/redirect?pref_id=pref-1'));
  });
});
