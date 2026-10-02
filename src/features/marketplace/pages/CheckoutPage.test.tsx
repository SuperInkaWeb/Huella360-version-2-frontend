import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

// H360: el checkout cortaba la compra si la veterinaria no tenia mpPublicKey propia, aunque los
// cobros son centralizados (el backend usa MP_ACCESS_TOKEN de la plataforma) y el panel de empresa
// dice que no hace falta configurar Mercado Pago. Resultado en QA (2026-09-25): ningun cliente podia
// comprar ("Esta veterinaria no tiene configurada su pasarela de pagos").

const { createOrder, getPaymentLink, auth, useAvailableCheckoutRewards } = vi.hoisted(() => ({
  createOrder: vi.fn(),
  getPaymentLink: vi.fn(),
  useAvailableCheckoutRewards: vi.fn(() => ({ data: [] })),
  auth: { isAuthenticated: true, role: 'CLIENTE' as string | null },
}));

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
vi.mock('../../auth/context/useAuth', () => ({ useAuth: () => auth }));
vi.mock('../../dashboard/gamification/hooks/useGamification', () => ({
  useAvailableCheckoutRewards,
}));

import { CheckoutPage } from './CheckoutPage';

const renderPage = () => render(<MemoryRouter><CheckoutPage /></MemoryRouter>);

describe('CheckoutPage', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    auth.role = 'CLIENTE';
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

  // H360-UX-002: POST /orders exige CLIENTE; antes una cuenta de empresa llegaba al pago y recibia
  // el popup generico "Acceso Denegado" del backend.
  it('con una cuenta de empresa avisa que se compra como dueño de mascota y no deja pagar', async () => {
    auth.role = 'EMPRESA';
    renderPage();

    expect(screen.getByRole('status')).toHaveTextContent('Estás usando una cuenta de Empresa');
    const pagar = screen.getByRole('button', { name: /Pagar con MercadoPago/i });
    expect(pagar).toBeDisabled();
    await userEvent.click(pagar);
    expect(createOrder).not.toHaveBeenCalled();
    // tampoco consulta las recompensas del cliente (el backend responde 403)
    expect(useAvailableCheckoutRewards).toHaveBeenLastCalledWith(0);
  });

  it('con una cuenta de cliente consulta las recompensas de la tienda del carrito', () => {
    renderPage();

    expect(useAvailableCheckoutRewards).toHaveBeenLastCalledWith(3);
  });
});
