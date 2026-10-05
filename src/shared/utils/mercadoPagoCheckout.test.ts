import { afterEach, describe, expect, it, vi } from 'vitest';
import { isMercadoPagoSandbox, resolveCheckoutUrl } from './mercadoPagoCheckout';

const links = {
    initPoint: 'https://www.mercadopago.com.pe/checkout/v1/redirect?pref_id=pref-1',
    sandboxInitPoint: 'https://sandbox.mercadopago.com.pe/checkout/v1/redirect?pref_id=pref-1',
};

describe('mercadoPagoCheckout', () => {
    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it('con credenciales APP_USR- usa initPoint aunque venga sandboxInitPoint', () => {
        vi.stubEnv('VITE_MP_PUBLIC_KEY', 'APP_USR-1234');

        expect(isMercadoPagoSandbox()).toBe(false);
        expect(resolveCheckoutUrl(links)).toBe(links.initPoint);
    });

    it('sin VITE_MP_PUBLIC_KEY usa initPoint', () => {
        vi.stubEnv('VITE_MP_PUBLIC_KEY', '');

        expect(resolveCheckoutUrl(links)).toBe(links.initPoint);
    });

    it('con credenciales TEST- usa sandboxInitPoint', () => {
        vi.stubEnv('VITE_MP_PUBLIC_KEY', 'TEST-1234');

        expect(isMercadoPagoSandbox()).toBe(true);
        expect(resolveCheckoutUrl(links)).toBe(links.sandboxInitPoint);
    });

    it('con credenciales TEST- y sin sandboxInitPoint cae a initPoint', () => {
        vi.stubEnv('VITE_MP_PUBLIC_KEY', 'TEST-1234');

        expect(resolveCheckoutUrl({ initPoint: links.initPoint, sandboxInitPoint: '' })).toBe(links.initPoint);
    });
});
