import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { marketplaceService } from "../services/marketplaceService";
import { useState, useMemo } from "react";
import { useAuth } from "../../auth/context/useAuth";
import { useAvailableCheckoutRewards } from "../../dashboard/gamification/hooks/useGamification";

export const CheckoutPage = () => {
    const { items, cartTotal } = useCart();
    const { isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Guest checkout fields
    const [guestEmail, setGuestEmail] = useState("");
    const [guestNombre, setGuestNombre] = useState("");

    // Estados de Envío
    const [deliveryMode, setDeliveryMode] = useState<'pickup' | 'delivery'>('pickup');
    const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [address, setAddress] = useState("");
    const [reference, setReference] = useState("");
    const [locationLoading, setLocationLoading] = useState(false);

    // Reward state
    const [selectedRewardId, setSelectedRewardId] = useState<number | null>(null);

    // Costo de envío (Ejemplo: S/ 10 base si es delivery)
    const shippingCost = deliveryMode === 'delivery' ? 10.00 : 0;

    // Determine the single empresaId for rewards
    const currentEmpresaId = useMemo(() => {
        if (items.length === 0) return 0;
        return items[0]?.empresaId || 0;
    }, [items]);

    // Fetch available redeemed rewards for this company
    const { data: availableRewards } = useAvailableCheckoutRewards(isAuthenticated ? currentEmpresaId : 0);

    // Calculate discount from selected reward
    const rewardDiscount = useMemo(() => {
        if (!selectedRewardId || !availableRewards) return 0;
        const reward = availableRewards.find((r: any) => r.id === selectedRewardId);
        if (!reward) return 0;

        if (reward.tipoDescuento === 'PORCENTAJE') {
            return (cartTotal * reward.valorDescuento) / 100;
        } else if (reward.tipoDescuento === 'MONTO_FIJO') {
            return Math.min(reward.valorDescuento, cartTotal);
        }
        return 0;
    }, [selectedRewardId, availableRewards, cartTotal]);

    const finalTotal = cartTotal + shippingCost - rewardDiscount;

    // Detect sandbox mode from the first item's mpPublicKey
    const isSandboxMode = useMemo(() => {
        if (items.length === 0) return false;
        const firstKey = items[0]?.mpPublicKey;
        return firstKey ? firstKey.startsWith('TEST-') : false;
    }, [items]);

    // Group items by company since backend orders are per company
    const groupedItems = items.reduce((acc, item) => {
        const empresaId = item.empresaId;
        if (!acc[empresaId]) {
            acc[empresaId] = {
                empresaNombre: item.empresaNombre,
                items: []
            };
        }
        acc[empresaId].items.push(item);
        return acc;
    }, {} as Record<number, { empresaNombre: string; items: any[] }>);

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            setError("Tu navegador no soporta geolocalización");
            return;
        }

        setLocationLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
                setLocationLoading(false);
                setError(null);
            },
            () => {
                setLocationLoading(false);
                setError("No pudimos obtener tu ubicación. Por favor, asegúrate de dar los permisos e inténtalo de nuevo.");
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const handleCheckout = async () => {
        setLoading(true);
        setError(null);

        try {
            const empresaIds = Object.keys(groupedItems).map(Number);

            if (empresaIds.length > 1) {
                setError("Por ahora solo puedes comprar a una empresa a la vez. Por favor, deja solo productos de una misma veterinaria en tu carrito.");
                setLoading(false);
                return;
            }

            const empresaId = empresaIds[0];
            const group = groupedItems[empresaId];

            // Get Public Key from any item (they all belong to the same company)
            const mpPublicKey = group.items[0]?.mpPublicKey;

            if (!mpPublicKey) {
                setError("Esta veterinaria no tiene configurada su pasarela de pagos. Por favor, contacta con soporte.");
                setLoading(false);
                return;
            }

            const orderItems = group.items.map((item: any) => ({
                productoId: item.id,
                servicioId: null,
                cantidad: item.quantity
            }));

            if (deliveryMode === 'delivery') {
                if (!location) {
                    setError("Necesitas compartir tu ubicación para el envío a domicilio");
                    setLoading(false);
                    return;
                }
                if (!address.trim()) {
                    setError("Necesitas ingresar una dirección para el envío");
                    setLoading(false);
                    return;
                }
            }

            // Validate guest fields if not authenticated
            if (!isAuthenticated) {
                if (!guestEmail.trim()) {
                    setError("El email es obligatorio para compras sin sesión");
                    setLoading(false);
                    return;
                }
                if (!guestNombre.trim()) {
                    setError("El nombre es obligatorio para compras sin sesión");
                    setLoading(false);
                    return;
                }
            }

            let orderId: number;

            if (isAuthenticated) {
                orderId = await marketplaceService.createOrder({
                    empresaId,
                    veterinarioId: null,
                    costoEnvio: shippingCost,
                    destinoLat: deliveryMode === 'delivery' && location ? location.lat : undefined,
                    destinoLng: deliveryMode === 'delivery' && location ? location.lng : undefined,
                    destinoDireccion: deliveryMode === 'delivery' ? address : undefined,
                    destinoReferencia: deliveryMode === 'delivery' ? reference : undefined,
                    canjeRecompensaId: selectedRewardId || undefined,
                    items: orderItems
                });
            } else {
                orderId = await marketplaceService.createGuestOrder({
                    empresaId,
                    veterinarioId: null,
                    guestEmail,
                    guestNombre,
                    costoEnvio: shippingCost,
                    destinoLat: deliveryMode === 'delivery' && location ? location.lat : undefined,
                    destinoLng: deliveryMode === 'delivery' && location ? location.lng : undefined,
                    destinoDireccion: deliveryMode === 'delivery' ? address : undefined,
                    destinoReferencia: deliveryMode === 'delivery' ? reference : undefined,
                    items: orderItems
                });
            }

            // 2. Get Payment Preference
            const { initPoint, sandboxInitPoint } = isAuthenticated
                ? await marketplaceService.getPaymentLink(orderId)
                : await marketplaceService.getGuestPaymentLink(orderId);

            // 3. Redirect to Mercado Pago.
            // IMPORTANT: sandboxInitPoint only works when the seller has TEST-type credentials.
            // If the seller used real OAuth (APP_USR- token), we must use initPoint always.
            // We detect TEST credentials by the public key prefix.
            const isSandboxCredentials = mpPublicKey.startsWith("TEST-");
            window.location.href = isSandboxCredentials ? sandboxInitPoint : initPoint;

            // Note: Cart will be cleared when the user returns to the success page.

        } catch (err: any) {
            console.error("Checkout error:", err);
            setError(err.response?.data?.message || "Ocurrió un error al procesar tu pedido. Inténtalo de nuevo.");
            setLoading(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-20 text-center">
                <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">shopping_cart</span>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Tu carrito está vacío</h2>
                <Link to="/marketplace" className="text-blue-600 font-medium hover:underline">
                    Ir a comprar algo
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full bg-slate-50 min-h-screen pb-20">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-3xl font-extrabold text-slate-900 mb-6">Confirmar Pedido</h1>

                {/* Sandbox Banner */}
                {isSandboxMode && (
                    <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-amber-500 text-xl mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>science</span>
                            <div>
                                <p className="text-sm font-bold text-amber-800">Modo Sandbox (Pruebas)</p>
                                <p className="text-xs text-amber-700 mt-1">
                                    Estás en entorno de pruebas. Para completar el pago:
                                </p>
                                <ul className="text-xs text-amber-700 mt-1.5 space-y-1 list-disc list-inside">
                                    <li>Inicia sesión en MercadoPago con tu <strong>cuenta de comprador de prueba</strong> (no tu correo real)</li>
                                    <li>Usa las <a href="https://www.mercadopago.com.pe/developers/es/docs/your-integrations/test/cards" target="_blank" rel="noopener noreferrer" className="underline font-semibold hover:text-amber-900">tarjetas de prueba oficiales</a></li>
                                    <li>Mastercard: <code className="bg-amber-100 px-1 rounded">5031 7557 3453 0604</code></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Resumen */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* SECCIÓN DE ENVÍO */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-blue-500">local_shipping</span>
                                Entrega
                            </h2>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <label className={`border rounded-xl p-4 cursor-pointer transition-all ${deliveryMode === 'pickup' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-300'}`}>
                                    <div className="flex items-center gap-3">
                                        <input type="radio" className="w-4 h-4 text-blue-600" checked={deliveryMode === 'pickup'} onChange={() => setDeliveryMode('pickup')} />
                                        <div>
                                            <p className="font-bold text-slate-900">Retiro en Tienda</p>
                                            <p className="text-xs text-slate-500">Gratis</p>
                                        </div>
                                    </div>
                                </label>
                                <label className={`border rounded-xl p-4 cursor-pointer transition-all ${deliveryMode === 'delivery' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-300'}`}>
                                    <div className="flex items-center gap-3">
                                        <input type="radio" className="w-4 h-4 text-blue-600" checked={deliveryMode === 'delivery'} onChange={() => setDeliveryMode('delivery')} />
                                        <div>
                                            <p className="font-bold text-slate-900">Envío a Domicilio</p>
                                            <p className="text-xs text-slate-500">S/ 10.00</p>
                                        </div>
                                    </div>
                                </label>
                            </div>

                            {deliveryMode === 'delivery' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
                                    <button 
                                        type="button"
                                        onClick={handleGetLocation}
                                        disabled={locationLoading}
                                        className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium py-3 px-4 rounded-xl transition-colors"
                                    >
                                        {locationLoading ? (
                                            <div className="w-5 h-5 border-2 border-slate-400 border-t-slate-800 rounded-full animate-spin" />
                                        ) : (
                                            <span className={`material-symbols-outlined ${location ? 'text-green-500' : 'text-slate-500'}`}>my_location</span>
                                        )}
                                        {location ? "Ubicación GPS capturada" : "Obtener mi ubicación exacta"}
                                    </button>

                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Dirección de Entrega</label>
                                            <input 
                                                type="text" 
                                                value={address}
                                                onChange={(e) => setAddress(e.target.value)}
                                                placeholder="Ej. Av. Larco 123, Miraflores"
                                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 placeholder:text-slate-400 outline-none focus:border-blue-500 transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Referencia (Opcional)</label>
                                            <input 
                                                type="text" 
                                                value={reference}
                                                onChange={(e) => setReference(e.target.value)}
                                                placeholder="Frente a la farmacia, portón negro"
                                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 placeholder:text-slate-400 outline-none focus:border-blue-500 transition-colors"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* SECCIÓN DE RECOMPENSAS */}
                        {isAuthenticated && availableRewards && availableRewards.length > 0 && (
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-amber-500">loyalty</span>
                                    Cupones Disponibles
                                </h2>
                                <p className="text-sm text-slate-500 mb-4">Selecciona un cupón canjeado para aplicar descuento.</p>
                                <div className="space-y-3">
                                    <label
                                        className={`block border rounded-xl p-4 cursor-pointer transition-all ${
                                            selectedRewardId === null
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-slate-200 hover:border-blue-300'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="radio"
                                                className="w-4 h-4 text-blue-600"
                                                checked={selectedRewardId === null}
                                                onChange={() => setSelectedRewardId(null)}
                                            />
                                            <span className="text-sm font-medium text-slate-700">No usar cupón</span>
                                        </div>
                                    </label>
                                    {availableRewards.map((reward: any) => (
                                        <label
                                            key={reward.id}
                                            className={`block border rounded-xl p-4 cursor-pointer transition-all ${
                                                selectedRewardId === reward.id
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-slate-200 hover:border-blue-300'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="radio"
                                                    className="w-4 h-4 text-blue-600"
                                                    checked={selectedRewardId === reward.id}
                                                    onChange={() => setSelectedRewardId(reward.id)}
                                                />
                                                <div className="flex-1">
                                                    <p className="font-bold text-slate-900">{reward.recompensaTitulo}</p>
                                                    <p className="text-xs text-slate-500 mt-0.5">
                                                        {reward.tipoDescuento === 'PORCENTAJE'
                                                            ? `${reward.valorDescuento}% de descuento`
                                                            : `S/${reward.valorDescuento.toFixed(2)} de descuento`}
                                                    </p>
                                                </div>
                                                <span className="text-green-600 font-bold text-sm">
                                                    -S/{reward.tipoDescuento === 'PORCENTAJE'
                                                        ? ((cartTotal * reward.valorDescuento) / 100).toFixed(2)
                                                        : Math.min(reward.valorDescuento, cartTotal).toFixed(2)
                                                    }
                                                </span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {Object.entries(groupedItems).map(([empresaId, group]) => (
                            <div key={empresaId} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                                <h2 className="text-sm font-bold uppercase text-slate-400 mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">storefront</span>
                                    Veterinaria: {group.empresaNombre}
                                </h2>
                                <div className="divide-y divide-slate-100">
                                    {group.items.map((item) => (
                                        <div key={item.id} className="py-4 flex gap-4">
                                            <div className="w-16 h-16 rounded-lg bg-slate-50 overflow-hidden shrink-0">
                                                <img src={item.imagenes?.[0]} alt={item.nombre} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-slate-900 font-medium">{item.nombre}</h3>
                                                <p className="text-sm text-slate-500">Cantidad: {item.quantity}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-slate-900 font-bold">S/{(item.precioActual * item.quantity).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pago */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-100 sticky top-8">
                            <h2 className="text-xl font-bold text-slate-900 mb-6">Resumen de Pago</h2>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-slate-600">
                                    <span>Subtotal</span>
                                    <span>S/{cartTotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Envío</span>
                                    {shippingCost === 0 ? (
                                        <span className="text-green-500 font-medium">Gratis (Retiro)</span>
                                    ) : (
                                        <span className="text-slate-900 font-medium">S/{shippingCost.toFixed(2)}</span>
                                    )}
                                </div>
                                {rewardDiscount > 0 && (
                                    <div className="flex justify-between text-green-600 font-medium">
                                        <span className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">loyalty</span>
                                            Descuento
                                        </span>
                                        <span>-S/{rewardDiscount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="pt-4 border-t border-slate-100 flex justify-between text-xl font-black text-slate-900">
                                    <span>Total</span>
                                    <span>S/{finalTotal.toFixed(2)}</span>
                                </div>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                                    {error}
                                </div>
                            )}

                            {!isAuthenticated && (
                                <div className="mb-6 space-y-4">
                                    <p className="text-xs text-center text-slate-500">
                                        Completa tus datos para continuar como invitado
                                    </p>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Nombre completo</label>
                                        <input
                                            type="text"
                                            value={guestNombre}
                                            onChange={(e) => setGuestNombre(e.target.value)}
                                            placeholder="Juan Pérez"
                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 placeholder:text-slate-400 outline-none focus:border-blue-500 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                        <input
                                            type="email"
                                            value={guestEmail}
                                            onChange={(e) => setGuestEmail(e.target.value)}
                                            placeholder="tu@email.com"
                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 placeholder:text-slate-400 outline-none focus:border-blue-500 transition-colors"
                                        />
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={handleCheckout}
                                disabled={loading}
                                className={`w-full py-4 rounded-xl font-bold text-white transition-all transform flex items-center justify-center gap-3 ${loading
                                    ? "bg-slate-400 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 active:scale-95"
                                    }`}
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Procesando...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined">payments</span>
                                        Pagar con MercadoPago
                                    </>
                                )}
                            </button>

                            <div className="mt-6 flex items-center justify-center gap-4 grayscale opacity-50">
                                <img src="https://logotipousa.com/wp-content/uploads/2021/11/mercadopago-logo.png" alt="Mercado Pago" className="h-6" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
