interface CheckoutLinks {
    initPoint?: string | null;
    sandboxInitPoint?: string | null;
}

// Los cobros son centralizados (MP_ACCESS_TOKEN de la plataforma), asi que el modo sandbox
// depende de la credencial de la plataforma. sandboxInitPoint solo sirve con credenciales
// TEST-; con APP_USR- (produccion o usuarios de prueba de MP) hay que usar initPoint.
export const isMercadoPagoSandbox = (): boolean =>
    (import.meta.env.VITE_MP_PUBLIC_KEY ?? "").startsWith("TEST-");

// Mercado Pago devuelve sandboxInitPoint siempre, tambien en produccion: no sirve como
// señal de ambiente.
export const resolveCheckoutUrl = ({ initPoint, sandboxInitPoint }: CheckoutLinks): string =>
    (isMercadoPagoSandbox() && sandboxInitPoint ? sandboxInitPoint : initPoint) ?? "";
