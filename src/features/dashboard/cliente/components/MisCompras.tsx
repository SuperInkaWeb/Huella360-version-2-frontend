import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { marketplaceService } from "../../../marketplace/services/marketplaceService";
import type { Order } from "../types/order.types";
import {
 Package, X,
 ChevronLeft, ChevronRight, CreditCard, ExternalLink,
 Calendar, Truck, FileText
} from "lucide-react";
import Swal from "sweetalert2";
import { InvoiceModal } from "./InvoiceModal";

export const MisCompras = () => {
 const navigate = useNavigate();
 const [orders, setOrders] = useState<Order[]>([]);
 const [isLoading, setIsLoading] = useState(true);
 const [isPaying, setIsPaying] = useState<number | null>(null);
 const [openOrder, setOpenOrder] = useState<number | null>(null);
 const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);

 // Estados para paginación y filtros
 const [page, setPage] = useState(0);
 const [size] = useState(10);
 const [totalPages, setTotalPages] = useState(0);
 const [totalElements, setTotalElements] = useState(0);
 const [dateFilter, setDateFilter] = useState({ start: "", end: "" });

 const fetchOrders = useCallback(async () => {
 try {
 setIsLoading(true);
 // Implementación con orden descendente (explicado en el paso anterior)
 const response = await marketplaceService.getMyOrders(page, size, dateFilter.start, dateFilter.end);

 setOrders(response.content);
 if (response.page) {
 setTotalPages(response.page.totalPages);
 setTotalElements(response.page.totalElements);
 }
 } catch (error) {
 console.error("Error al obtener las órdenes:", error);
 Swal.fire({ icon: "error", title: "Error", text: "No se pudieron cargar tus compras." });
 } finally {
 setIsLoading(false);
 }
 }, [page, size, dateFilter.start, dateFilter.end]);

 useEffect(() => {
 fetchOrders();
 }, [fetchOrders]);

 const handlePagar = async (orderId: number) => {
 try {
 setIsPaying(orderId);
 const paymentData = await marketplaceService.getPaymentLink(orderId);
 window.location.href = paymentData.initPoint;
 } catch (error) {
 Swal.fire({ icon: "error", title: "Error", text: "No se pudo generar el pago." });
 } finally {
 setIsPaying(null);
 }
 };

 const formatDate = (dateString: string) => {
 return new Intl.DateTimeFormat('es-PE', {
 day: 'numeric', month: 'long', year: 'numeric'
 }).format(new Date(dateString));
 };

 return (
 <div className="container mx-auto px-4 py-8 max-w-5xl min-h-screen">
 {/* Header Estilo Plantilla */}
 <div className="mb-8">
 <h1 className="text-3xl font-bold text-gray-900 ">Historial de Órdenes</h1>
 <p className="text-gray-600 mt-2">Revisa tus compras recientes y el estado de tus pagos.</p>
 </div>

 {/* Barra de Filtros Mejorada */}
 <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-8 flex flex-wrap items-center justify-between gap-4">
 <div className="flex items-center gap-4">
 <div className="flex items-center gap-2 text-gray-500">
 <Calendar size={18} />
 <span className="text-sm font-medium">Filtrar por fecha:</span>
 </div>
 <div className="flex items-center gap-2">
 <input
 type="date"
 value={dateFilter.start}
 onChange={(e) => { setPage(0); setDateFilter(prev => ({ ...prev, start: e.target.value })) }}
 className="px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
 />
 <span className="text-gray-400">a</span>
 <input
 type="date"
 value={dateFilter.end}
 onChange={(e) => { setPage(0); setDateFilter(prev => ({ ...prev, end: e.target.value })) }}
 className="px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
 />
 </div>
 </div>
 {(dateFilter.start || dateFilter.end) && (
 <button onClick={() => { setPage(0); setDateFilter({ start: "", end: "" }); }}
 className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1 font-medium transition-colors">
 <X size={16} /> Limpiar filtros
 </button>
 )}
 </div>

 {/* Listado de Órdenes */}
 <div className="space-y-6">
 {isLoading ? (
 <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>
 ) : orders.length === 0 ? (
 <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-200 ">
 <Package size={48} className="mx-auto text-gray-300 mb-4" />
 <p className="text-gray-500">No se encontraron órdenes.</p>
 </div>
 ) : (
 orders.map((order) => (
 <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
 {/* Order Summary (Header del Card) */}
 <div
 className="p-6 cursor-pointer hover:bg-gray-50 :bg-gray-800 transition-colors"
 onClick={() => setOpenOrder(openOrder === order.id ? null : order.id)}
 >
 <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
 <div className="mb-4 md:mb-0">
 <div className="flex items-center space-x-4 mb-1">
 <span className="text-sm font-bold text-gray-900 uppercase tracking-wider">
 Orden {order.codigoOrden || `#${order.id}`}
 </span>
 <span className={`px-3 py-1 rounded-full text-xs font-semibold ${order.estado === 'PAGADO'
 ? 'bg-green-100 text-green-700'
 : 'bg-yellow-100 text-yellow-700'
 }`}>
 {order.estado}
 </span>
 </div>
 <p className="text-sm text-gray-500 flex items-center gap-1">
 <Calendar size={14} /> {formatDate(order.createdAt)}
 </p>
 </div>
 <div className="text-left md:text-right">
 <p className="text-xl font-bold text-gray-900 ">S/ {order.total.toFixed(2)}</p>
 <p className="text-sm text-gray-500">{order.items?.length || 0} productos</p>
 </div>
 </div>
 </div>

 {/* Order Details (Expandible) */}
 {openOrder === order.id && (
 <div className="border-t border-gray-100 bg-gray-50/50 transition-all">
 <div className="p-6 space-y-6">
 {/* Items Purchased */}
 <div className="space-y-4">
 <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Productos</h3>
 <div className="space-y-3">
 {order.items?.map((item, idx) => (
 <div key={idx} className="flex items-center justify-between group">
 <div className="flex items-center space-x-4">
 <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center text-gray-500">
 <Package size={20} />
 </div>
 <div>
 <p className="text-sm font-medium text-gray-900 ">{item.productoNombre}</p>
 <p className="text-xs text-gray-500">Cantidad: {item.cantidad}</p>
 </div>
 </div>
 <p className="text-sm font-semibold text-gray-900 ">S/ {item.subtotal.toFixed(2)}</p>
 </div>
 ))}
 </div>
 </div>

 {/* Footer del detalle con acciones */}
 <div className="pt-6 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
 <div className="flex items-center gap-2 text-sm text-gray-500">
 <CreditCard size={16} />
 <span>Pago mediante Mercado Pago</span>
 </div>
 <div className="flex space-x-3 w-full md:w-auto">
 {order.estado === 'PENDIENTE' && (
 <button
 onClick={(e) => { e.stopPropagation(); handlePagar(order.id); }}
 disabled={isPaying === order.id}
 className="flex-1 md:flex-none px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
 >
 {isPaying === order.id ? "Procesando..." : (
 <>Pagar Ahora <ExternalLink size={16} /></>
 )}
 </button>
 )}
 {order.estado === 'PAGADO' && (
 <button
 onClick={(e) => { e.stopPropagation(); navigate(`/portal/cliente/tracking/${order.id}`); }}
 className="flex-1 md:flex-none px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"
 >
 <Truck size={16} /> Rastrear Envío
 </button>
 )}
 <button 
 onClick={(e) => { e.stopPropagation(); setSelectedOrderForInvoice(order); }}
 className="flex-1 md:flex-none px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 :bg-gray-700 transition-colors flex items-center justify-center gap-2"
 >
 <FileText size={16} /> Ver Factura
 </button>
 </div>
 </div>
 </div>
 </div>
 )}
 </div>
 ))
 )}
 </div>

 {/* Paginación Estilo Plantilla */}
 {!isLoading && totalPages > 0 && (
 <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-12 pt-8 border-t border-gray-200 ">
 <p className="text-sm text-gray-600 ">
 Mostrando <span className="font-semibold text-gray-900 ">{orders.length}</span> de {totalElements} órdenes
 </p>

 <nav className="inline-flex items-center -space-x-px rounded-md shadow-sm">
 <button
 onClick={() => setPage(prev => Math.max(0, prev - 1))}
 disabled={page === 0}
 className="px-3 py-2 rounded-l-md border border-gray-300 text-gray-500 hover:bg-gray-50 :bg-gray-800 disabled:opacity-30 transition-colors"
 >
 <ChevronLeft size={20} />
 </button>

 {Array.from({ length: totalPages }, (_, i) => (
 <button
 key={i}
 onClick={() => setPage(i)}
 className={`px-4 py-2 text-sm font-bold border transition-colors ${page === i
 ? 'bg-blue-600 text-white border-blue-600 z-10'
 : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
 }`}
 >
 {i + 1}
 </button>
 ))}

 <button
 onClick={() => setPage(prev => Math.min(totalPages - 1, prev + 1))}
 disabled={page === totalPages - 1}
 className="px-3 py-2 rounded-r-md border border-gray-300 text-gray-500 hover:bg-gray-50 :bg-gray-800 disabled:opacity-30 transition-colors"
 >
 <ChevronRight size={20} />
 </button>
 </nav>
 </div>
 )}

 {/* Modal de Factura */}
 {selectedOrderForInvoice && (
 <InvoiceModal 
 order={selectedOrderForInvoice}
 isOpen={!!selectedOrderForInvoice}
 onClose={() => setSelectedOrderForInvoice(null)}
 />
 )}
 </div>
 );
};