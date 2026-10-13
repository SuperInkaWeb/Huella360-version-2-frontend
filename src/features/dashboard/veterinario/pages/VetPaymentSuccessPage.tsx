import { SubscriptionPaymentResult } from '../../shared/subscriptions/components/SubscriptionPaymentResult';

export const VetPaymentSuccessPage = () => (
    <SubscriptionPaymentResult
        homePath="/portal/veterinario/"
        homeLabel="Ir al Dashboard"
        subscriptionPath="/portal/veterinario/suscripcion"
    />
);
