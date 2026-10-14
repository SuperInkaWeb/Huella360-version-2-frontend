import { SubscriptionPaymentResult } from '../../shared/subscriptions/components/SubscriptionPaymentResult';

export const ClientePaymentSuccessPage = () => (
    <SubscriptionPaymentResult
        homePath="/portal/cliente/mascotas"
        homeLabel="Ir a Mis Mascotas"
        subscriptionPath="/portal/cliente/suscripcion"
    />
);
