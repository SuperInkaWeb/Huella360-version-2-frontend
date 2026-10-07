import { SubscriptionPaymentResult } from '../../shared/subscriptions/components/SubscriptionPaymentResult';

export const PaymentSuccessPage = () => (
    <SubscriptionPaymentResult
        homePath="/portal/empresa"
        homeLabel="Ir al Dashboard"
        subscriptionPath="/portal/empresa/suscripcion"
    />
);
