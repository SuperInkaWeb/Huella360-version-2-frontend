import { Link, useSearchParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useEffect, useState } from "react";
import { marketplaceService } from "../services/marketplaceService";

export const PaymentSuccessPage = () => {
    const { clearCart } = useCart();
    const [searchParams] = useSearchParams();

    const [uiState, setUiState] = useState<'loading' | 'approved' | 'pending' | 'error'>('loading');

    useEffect(() => {
        const processPayment = async () => {
            const paymentId = searchParams.get("payment_id");
            const status = searchParams.get("status");
            const externalReference = searchParams.get("external_reference");

            if (!paymentId || !externalReference) {
                setUiState('error');
                return;
            }

            try {
                await marketplaceService.syncPayment(paymentId, externalReference);

                if (status === "approved") {
                    setUiState('approved');
                    clearCart();
                } else if (status === "pending" || status === "in_process") {
                    setUiState('pending');
                    clearCart();
                } else {
                    setUiState('error');
                }

            } catch (error) {
                console.error("Error sincronizando pago como fallback:", error);
                if (status === "approved") {
                    setUiState('approved');
                    clearCart();
                } else {
                    setUiState('error');
                }
            }
        };

        processPayment();
    }, [clearCart, searchParams]);

    if (uiState === 'loading') {
        return (
            <div className="w-full bg-slate-50 min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="w-full bg-slate-50 min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl p-10 shadow-xl text-center border border-slate-100">

                {/* Renderizado Dinámico del Icono y Colores */}
                {uiState === 'approved' && (
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-4xl font-bold">check</span>
                    </div>
                )}
                {uiState === 'pending' && (
                    <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-4xl font-bold">schedule</span>
                    </div>
                )}
                {uiState === 'error' && (
                    <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-4xl font-bold">error</span>
                    </div>
                )}

                {/* Renderizado Dinámico de los Textos */}
                <h1 className="text-3xl font-extrabold text-slate-900 mb-4">
                    {uiState === 'approved' ? '¡Pago Exitoso!' : uiState === 'pending' ? 'Pago en Revisión' : 'Ocurrió un problema'}
                </h1>

                <p className="text-slate-500 mb-8 leading-relaxed">
                    {uiState === 'approved' && 'Tu pedido ha sido procesado correctamente. Recibirás un correo electrónico con los detalles y el comprobante de tu compra.'}
                    {uiState === 'pending' && 'Tu pedido está guardado. Estamos esperando la confirmación del pago por parte del banco o la agencia en efectivo. Te notificaremos por correo.'}
                    {uiState === 'error' && 'No pudimos validar tu pago o fue rechazado. Por favor, intenta realizar la compra nuevamente desde tu carrito.'}
                </p>

                <div className="space-y-4">
                    <Link
                        to="/portal/cliente/compras"
                        className="block w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all"
                    >
                        Ver mis pedidos
                    </Link>
                    <Link
                        to={uiState === 'error' ? "/marketplace/checkout" : "/marketplace"}
                        className="block w-full py-4 text-blue-600 font-bold hover:underline transition-all"
                    >
                        {uiState === 'error' ? 'Volver al Checkout' : 'Seguir comprando'}
                    </Link>
                </div>
            </div>
        </div>
    );
};