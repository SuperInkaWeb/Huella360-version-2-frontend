import { useState, useEffect } from "react";
import {
    Search,
    Receipt,
    Download,
    Link as LinkIcon,
    CreditCard,
    DollarSign,
    Package,
    Calendar,
    Filter,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
} from "lucide-react";
import { Button } from "../../../../components/ui/Button";
import { billingService } from "../services/billingService";
import { deliveryEmpresaService } from "../services/deliveryEmpresaService";
import type { OrderSummary } from "../types/billing.types";
import Swal from "sweetalert2";

/* ── Helpers ────────────────────────────────────────────────── */

const DEFAULT_ESTADO = { label: "Desconocido", color: "bg-slate-100 text-slate-500" };

const ESTADO_CONFIG: Record<string, { label: string; color: string }> = {
    PENDIENTE: { label: "Pendiente", color: "bg-amber-100 text-amber-700" },
    PAGADO: { label: "Pagado", color: "bg-emerald-100 text-emerald-700" },
    ENVIADO: { label: "Enviado", color: "bg-blue-100 text-blue-700" },
    ENTREGADO: { label: "Entregado", color: "bg-indigo-100 text-indigo-700" },
    CANCELADO: { label: "Cancelado", color: "bg-slate-100 text-slate-700" },
    FALLIDO: { label: "Fallido", color: "bg-red-100 text-red-700" },
    REEMBOLSADO: { label: "Reembolsado", color: "bg-fuchsia-100 text-fuchsia-700" },
};

/* ── Page Component ──────────────────────────────────────── */

export const FacturacionPage = () => {
    const [orders, setOrders] = useState<OrderSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [searchStatus, setSearchStatus] = useState<string>("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const fetchOrders = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await billingService.getMyOrders(page, 15, {
                estado: searchStatus || undefined,
                codigoOrden: debouncedSearch || undefined,
                startDate: startDate || undefined,
                endDate: endDate || undefined
            });
            setOrders(data.content);
            setTotalPages(data.totalPages);
            setTotalElements(data.totalElements);
        } catch (error: any) {
            console.error("Error fetching orders:", error);
            setError(error.response?.data?.message || "Error al cargar las órdenes. Intenta de nuevo.");
        } finally {
            setIsLoading(false);
        }
    };

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Single fetch effect — resets page when filters change
    useEffect(() => {
        setPage(0);
    }, [debouncedSearch, searchStatus, startDate, endDate]);

    useEffect(() => {
        fetchOrders();
    }, [page, searchStatus, startDate, endDate, debouncedSearch]);

    const handleResetDelivery = async (orderId: number) => {
        const result = await Swal.fire({
            title: '¿Re-enviar pedido?',
            text: "Esto buscará un nuevo repartidor para este pedido.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, re-enviar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                // El deliveryId suele ser el mismo que orderId o está relacionado, 
                // pero el endpoint espera el ID del delivery.
                // En este sistema, un pedido tiene un delivery.
                await deliveryEmpresaService.reintentarDelivery(orderId);
                Swal.fire('¡Listo!', 'El pedido ha sido reseteado y está buscando repartidor.', 'success');
                fetchOrders();
            } catch (error: any) {
                Swal.fire('Error', error.response?.data?.message || 'No se pudo resetear el pedido.', 'error');
            }
        }
    };

    const handleGenerateCheckout = async (orderId: number) => {
        try {
            const url = await billingService.generateCheckout(orderId);
            window.open(url, "_blank");
        } catch (error: any) {
            Swal.fire("Error", error.response?.data?.message || "No se pudo generar el link de pago.", "error");
        }
    };

    // Filtro local eliminado a favor de filtro en el backend
    const filteredOrders = orders;

    return (
        <div className="h-full flex flex-col p-4 md:p-6 gap-4 md:gap-6 overflow-hidden">
            {/* Dynamic Header KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 shrink-0">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-semibold text-slate-500">Total Órdenes</p>
                        <h3 className="text-2xl font-bold text-slate-900 mt-1">{totalElements}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                        <DollarSign size={24} className="text-emerald-500" />
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-semibold text-slate-500">Órdenes Pagadas</p>
                        <h3 className="text-2xl font-bold text-slate-900 mt-1">{orders.filter(o => o.estado === 'PAGADO').length}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                        <Package size={24} className="text-blue-500" />
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-semibold text-slate-500">Pendientes de Pago</p>
                        <h3 className="text-2xl font-bold text-slate-900 mt-1">{orders.filter(o => o.estado === 'PENDIENTE').length}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                        <CreditCard size={24} className="text-amber-500" />
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-h-0 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Toolbar */}
                <div className="shrink-0 p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Receipt size={20} className="text-primary" />
                        Historial de Órdenes
                    </h2>
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative group min-w-[180px]">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={16} />
                            <select
                                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none appearance-none text-sm"
                                value={searchStatus}
                                onChange={(e) => { setSearchStatus(e.target.value); setPage(0); }}
                            >
                                <option value="">Todos los estados</option>
                                {Object.entries(ESTADO_CONFIG).map(([key, { label }]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200">
                            <div className="relative group">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                <input
                                    type="date"
                                    className="pl-8 pr-3 py-1.5 bg-transparent border-none focus:ring-0 text-xs outline-none cursor-pointer"
                                    value={startDate}
                                    onChange={(e) => { setStartDate(e.target.value); setPage(0); }}
                                    placeholder="Desde"
                                />
                            </div>
                            <span className="text-slate-400 text-xs">-</span>
                            <div className="relative group">
                                <input
                                    type="date"
                                    className="px-3 py-1.5 bg-transparent border-none focus:ring-0 text-xs outline-none cursor-pointer"
                                    value={endDate}
                                    onChange={(e) => { setEndDate(e.target.value); setPage(0); }}
                                    placeholder="Hasta"
                                />
                            </div>
                        </div>

                        <div className="relative group sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={16} />
                            <input
                                type="text"
                                placeholder="N° de Orden..."
                                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none placeholder:text-slate-400 text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-auto custom-scrollbar">
                    {/* Desktop Table */}
                    <div className="hidden md:block min-w-[800px]">
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-sm shadow-sm z-10">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Código</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cliente</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Total</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Estado</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {isLoading ? (
                                    Array.from({ length: 4 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={6} className="px-6 py-4 h-16 bg-slate-50/50" />
                                        </tr>
                                    ))
                                ) : error ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-16 text-center">
                                            <Receipt size={32} className="mx-auto text-red-300 mb-3" />
                                            <p className="text-red-500 font-medium">{error}</p>
                                            <button onClick={fetchOrders} className="mt-3 text-sm text-primary hover:underline">Reintentar</button>
                                        </td>
                                    </tr>
                                ) : filteredOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-16 text-center">
                                            <Receipt size={32} className="mx-auto text-slate-300 mb-3" />
                                            <p className="text-slate-500 font-medium">No se encontraron órdenes.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-sm font-semibold text-slate-900">
                                                    {order.codigoOrden}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-slate-700">
                                                {order.clienteNombre}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-sm font-bold text-slate-900">
                                                    S/ {order.total.toFixed(2)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-opacity-20 ${(ESTADO_CONFIG[order.estado] || DEFAULT_ESTADO).color}`}>
                                                    {(ESTADO_CONFIG[order.estado] || DEFAULT_ESTADO).label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {order.estado === "PENDIENTE" && (
                                                        <button
                                                            onClick={() => handleGenerateCheckout(order.id)}
                                                            title="Generar Link de Pago"
                                                            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md transition-colors"
                                                        >
                                                            <LinkIcon size={16} />
                                                        </button>
                                                    )}
                                                    {(order.estado === "FALLIDO" || (order as any).estado === "INCIDENCIA") && (
                                                        <button
                                                            onClick={() => handleResetDelivery(order.id)}
                                                            title="Re-enviar pedido (Cargar nuevamente)"
                                                            className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-md transition-colors"
                                                        >
                                                            <RefreshCw size={16} />
                                                        </button>
                                                    )}
                                                    <button
                                                        title="Descargar Comprobante"
                                                        className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-md transition-colors"
                                                    >
                                                        <Download size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden flex flex-col p-4 gap-4">
                        {isLoading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="h-24 bg-slate-50 rounded-2xl animate-pulse border border-slate-100" />
                            ))
                        ) : error ? (
                            <div className="py-12 text-center">
                                <p className="text-red-500 font-medium">{error}</p>
                                <button onClick={fetchOrders} className="mt-3 text-sm text-primary hover:underline">Reintentar</button>
                            </div>
                        ) : filteredOrders.length === 0 ? (
                            <div className="py-12 text-center text-slate-500">No se encontraron órdenes.</div>
                        ) : (
                            filteredOrders.map(order => (
                                <div key={order.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-mono text-sm font-bold text-slate-900">{order.codigoOrden}</p>
                                            <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${(ESTADO_CONFIG[order.estado] || DEFAULT_ESTADO).color}`}>
                                            {(ESTADO_CONFIG[order.estado] || DEFAULT_ESTADO).label}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-700">{order.clienteNombre}</p>
                                        <p className="text-lg font-bold text-slate-900 mt-0.5">S/ {order.total.toFixed(2)}</p>
                                    </div>
                                    <div className="flex gap-2 pt-2 border-t border-slate-200">
                                        {order.estado === "PENDIENTE" && (
                                            <Button variant="outline" onClick={() => handleGenerateCheckout(order.id)} className="flex-1 text-xs py-1.5 gap-1.5 shadow-sm">
                                                <LinkIcon size={14} /> Link Pago
                                            </Button>
                                        )}
                                        {(order.estado === "FALLIDO" || (order as any).estado === "INCIDENCIA") && (
                                            <Button variant="outline" onClick={() => handleResetDelivery(order.id)} className="flex-1 text-xs py-1.5 gap-1.5 shadow-sm bg-amber-50 border-amber-200 text-amber-700">
                                                <RefreshCw size={14} /> Re-enviar
                                            </Button>
                                        )}
                                        <Button variant="outline" className="flex-1 text-xs py-1.5 gap-1.5 shadow-sm">
                                            <Download size={14} /> PDF
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="shrink-0 px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 z-10">
                    <span className="text-sm font-medium text-slate-500">
                        Mostrando {filteredOrders.length} de {totalElements} órdenes
                    </span>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0 || isLoading}
                            className="h-9 px-3 gap-1.5"
                        >
                            <ChevronLeft size={16} />
                            Anterior
                        </Button>
                        <div className="flex items-center px-4 h-9 rounded-lg bg-white border border-slate-200 text-sm font-semibold text-slate-700">
                            Página {page + 1} de {totalPages || 1}
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={page >= totalPages - 1 || isLoading}
                            className="h-9 px-3 gap-1.5"
                        >
                            Siguiente
                            <ChevronRight size={16} />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
