import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useEffect, useState } from "react";

export const CartSidebar = () => {
    const { items, isOpen, closeCart, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();
    const navigate = useNavigate();
    const [visible, setVisible] = useState(false);

    // Animate in/out
    useEffect(() => {
        if (isOpen) {
            // Trigger slide-in on next frame
            requestAnimationFrame(() => setVisible(true));
        } else {
            setVisible(false);
        }
    }, [isOpen]);

    const handleClose = () => {
        setVisible(false);
        setTimeout(() => closeCart(), 280);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300"
                style={{ opacity: visible ? 1 : 0 }}
                onClick={handleClose}
            />

            {/* Panel */}
            <div
                className="absolute inset-y-0 right-0 w-full max-w-[420px] transition-transform duration-300 ease-out"
                style={{ transform: visible ? 'translateX(0)' : 'translateX(100%)' }}
            >
                <div className="flex h-full flex-col bg-white shadow-2xl">
                    {/* ── Header ── */}
                    <div className="flex items-center justify-between px-6 py-5">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-2xl text-slate-800" style={{ fontVariationSettings: "'FILL' 1" }}>shopping_bag</span>
                            <h2 className="text-lg font-bold text-slate-900">Carrito</h2>
                            {cartCount > 0 && (
                                <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-blue-600 text-[11px] font-bold text-white">
                                    {cartCount}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                        >
                            <span className="material-symbols-outlined text-xl">close</span>
                        </button>
                    </div>

                    <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

                    {/* ── Items list ── */}
                    <div className="flex-1 overflow-y-auto px-6 py-4">
                        {items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center gap-3 pb-10">
                                <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-4xl text-slate-300">shopping_cart</span>
                                </div>
                                <p className="text-slate-500 text-sm">Tu carrito está vacío</p>
                                <button
                                    onClick={handleClose}
                                    className="mt-1 text-sm text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                                >
                                    Explorar productos
                                </button>
                            </div>
                        ) : (
                            <ul className="space-y-3">
                                {items.map((item) => {
                                    const atMaxStock = item.quantity >= item.stock;

                                    return (
                                        <li
                                            key={item.id}
                                            className="flex gap-3 p-3 rounded-xl bg-slate-50 group transition-all hover:bg-slate-100"
                                        >
                                            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-white">
                                                <img
                                                    src={item.imagenes?.[0] || 'https://via.placeholder.com/100'}
                                                    alt={item.nombre}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>

                                            <div className="flex flex-1 flex-col min-w-0 justify-between">
                                                <div className="flex justify-between items-start gap-2">
                                                    <h3 className="text-sm font-semibold text-slate-800 truncate">
                                                        {item.nombre}
                                                    </h3>
                                                    <button
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="p-0.5 rounded text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                                                        title="Eliminar"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                                    </button>
                                                </div>

                                                <p className="text-[11px] text-slate-400 truncate">{item.empresaNombre}</p>

                                                <div className="flex items-center justify-between mt-1.5">
                                                    <div className="flex items-center">
                                                        <div className="flex items-center h-7 border border-slate-200 rounded-full overflow-hidden">
                                                            <button
                                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                                className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors text-sm font-medium"
                                                            >
                                                                −
                                                            </button>
                                                            <span className="w-7 text-center text-xs font-bold text-slate-800 tabular-nums">
                                                                {item.quantity}
                                                            </span>
                                                            <button
                                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                                disabled={atMaxStock}
                                                                className={`w-7 h-7 flex items-center justify-center transition-colors text-sm font-medium rounded-r-full ${atMaxStock
                                                                    ? 'text-slate-300 cursor-not-allowed'
                                                                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                                                                    }`}
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                        {atMaxStock && (
                                                            <span className="ml-2 text-[10px] text-amber-500 font-medium">Máx</span>
                                                        )}
                                                    </div>

                                                    <p className="text-sm font-bold text-slate-900 tabular-nums">
                                                        S/{(item.precioActual * item.quantity).toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>

                    {/* ── Footer ── */}
                    {items.length > 0 && (
                        <div className="border-t border-slate-100 px-6 pt-4 pb-6 space-y-4 bg-white">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-500">
                                    {cartCount} {cartCount === 1 ? 'artículo' : 'artículos'}
                                </span>
                                <div className="text-right">
                                    <p className="text-[11px] text-slate-400 uppercase tracking-wider">Total</p>
                                    <p className="text-xl font-black text-slate-900 tabular-nums">
                                        S/{cartTotal.toFixed(2)}
                                    </p>
                                </div>
                            </div>

                            <button
                                className="w-full rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:shadow-blue-600/30 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
                                onClick={() => {
                                    handleClose();
                                    setTimeout(() => navigate("/marketplace/checkout"), 300);
                                }}
                            >
                                <span className="material-symbols-outlined text-lg">shopping_cart_checkout</span>
                                Finalizar Compra
                            </button>

                            <button
                                onClick={handleClose}
                                className="w-full text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors text-center py-1"
                            >
                                Seguir comprando
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
