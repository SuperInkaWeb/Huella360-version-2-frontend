import React from 'react';
import { X, Package, Truck, ShieldCheck, Download, Printer } from 'lucide-react';
import type { Order } from '../types/order.types';

interface InvoiceModalProps {
 order: Order;
 isOpen: boolean;
 onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, isOpen, onClose }) => {
 if (!isOpen) return null;

 const formatDate = (dateString: string) => {
 return new Intl.DateTimeFormat('es-PE', {
 day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
 }).format(new Date(dateString));
 };

 return (
 <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
 <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300">
 {/* Header */}
 <div className="relative bg-indigo-600 p-8 text-white">
 <button 
 onClick={onClose}
 className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
 >
 <X size={20} />
 </button>
 <div className="flex justify-between items-end">
 <div>
 <p className="text-indigo-100 text-sm font-semibold uppercase tracking-wider mb-1">Comprobante de Pago</p>
 <h2 className="text-3xl font-black">Factura Detallada</h2>
 </div>
 <div className="text-right">
 <p className="text-2xl font-mono font-bold">{order.codigoOrden}</p>
 <p className="text-indigo-100 text-xs mt-1">{formatDate(order.createdAt)}</p>
 </div>
 </div>
 </div>

 <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
 {/* Info Section */}
 <div className="grid grid-cols-2 gap-8 mb-8">
 <div>
 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Vendedor</h3>
 <p className="font-bold text-slate-900 ">{order.empresaNombre}</p>
 <p className="text-sm text-slate-500">Marketplace Huella360</p>
 </div>
 <div>
 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Cliente</h3>
 <p className="font-bold text-slate-900 ">{order.clienteNombre}</p>
 <p className="text-sm text-slate-500">Metodo de Pago: {order.metodoPago || 'Mercado Pago'}</p>
 </div>
 </div>

 {/* Table */}
 <table className="w-full mb-8">
 <thead>
 <tr className="border-b border-slate-100 ">
 <th className="text-left py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Descripción</th>
 <th className="text-center py-4 text-xs font-bold text-slate-400 uppercase tracking-widest leading-none px-2">Cant</th>
 <th className="text-right py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Precio</th>
 <th className="text-right py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Subtotal</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-50 ">
 {order.items.map((item, idx) => (
 <tr key={idx} className="group">
 <td className="py-4">
 <div className="flex items-center gap-3">
 <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
 <Package size={14} />
 </div>
 <span className="text-sm font-medium text-slate-700 ">
 {item.productoNombre || item.servicioNombre}
 </span>
 </div>
 </td>
 <td className="py-4 text-center text-sm text-slate-600 font-medium leading-none px-2">{item.cantidad}</td>
 <td className="py-4 text-right text-sm text-slate-600 ">S/ {item.precioUnitario.toFixed(2)}</td>
 <td className="py-4 text-right text-sm font-bold text-slate-900 ">S/ {item.subtotal.toFixed(2)}</td>
 </tr>
 ))}
 </tbody>
 </table>

 {/* Summary */}
 <div className="space-y-3 border-t border-slate-100 pt-6">
 <div className="flex justify-between text-sm">
 <span className="text-slate-500">Subtotal Productos</span>
 <span className="font-medium text-slate-900 ">S/ {order.subtotal.toFixed(2)}</span>
 </div>
 <div className="flex justify-between text-sm">
 <div className="flex items-center gap-2">
 <Truck size={14} className="text-blue-500" />
 <span className="text-slate-500">Servicio de Delivery (Pago al repartidor)</span>
 </div>
 <span className="font-medium text-slate-900 ">S/ {order.costoEnvio.toFixed(2)}</span>
 </div>
 {order.descuento > 0 && (
 <div className="flex justify-between text-sm text-green-600 font-medium">
 <div className="flex items-center gap-2">
 <Package size={14} />
 <span>Descuento (Cupón de Recompensa)</span>
 </div>
 <span>-S/ {order.descuento.toFixed(2)}</span>
 </div>
 )}
 <div className="flex justify-between text-sm">
 <div className="flex items-center gap-2">
 <ShieldCheck size={14} className="text-indigo-500" />
 <span className="text-slate-500">Comisión de Plataforma (Huella360 SaaS)</span>
 </div>
 <span className="font-medium text-slate-900 ">S/ {order.comisionPlataforma.toFixed(2)}</span>
 </div>
 <div className="flex justify-between pt-4 border-t border-slate-200 mt-4">
 <span className="text-lg font-bold text-slate-900 ">Total Pagado</span>
 <span className="text-2xl font-black text-indigo-600 ">S/ {order.total.toFixed(2)}</span>
 </div>
 </div>
 </div>

 {/* Footer Actions */}
 <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
 <button 
 onClick={() => window.print()}
 className="px-4 py-2 flex items-center gap-2 text-sm font-bold text-slate-600 hover:bg-slate-200 :bg-slate-700 rounded-xl transition-all"
 >
 <Printer size={18} /> Imprimir
 </button>
 <button className="px-6 py-2 flex items-center gap-2 text-sm font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all">
 <Download size={18} /> Descargar PDF
 </button>
 </div>
 </div>
 </div>
 );
};
