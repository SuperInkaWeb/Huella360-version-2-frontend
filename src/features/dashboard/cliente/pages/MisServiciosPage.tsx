import { useEffect, useState } from "react";
import { marketplaceService } from "../../../marketplace/services/marketplaceService";
import { Calendar, Clock, Loader2, CalendarPlus } from "lucide-react";
import { AgendarCitaModal } from "../../shared/appointments/AgendarCitaModal";
import Swal from "sweetalert2";

interface PurchasedService {
 orderId: number;
 codigoOrden: string;
 servicioId: number;
 servicioNombre: string;
 empresaId: number;
 cantidad: number;
 estadoOrden: string;
 createdAt: string;
}

export const MisServiciosPage = () => {
 const [services, setServices] = useState<PurchasedService[]>([]);
 const [loading, setLoading] = useState(true);
 const [selectedService, setSelectedService] = useState<PurchasedService | null>(null);

 useEffect(() => {
 const fetchServices = async () => {
 try {
 const data = await marketplaceService.getMyOrders();
 const serviceItems: PurchasedService[] = [];
 data.content.forEach((order: any) => {
 order.items.forEach((item: any) => {
 if (item.servicioId) {
 serviceItems.push({
 orderId: order.id,
 codigoOrden: order.codigoOrden,
 servicioId: item.servicioId,
 servicioNombre: item.servicioNombre || item.nombre,
 empresaId: order.empresaId,
 cantidad: item.cantidad,
 estadoOrden: order.estado,
 createdAt: order.createdAt
 });
 }
 });
 });
 setServices(serviceItems);
 } catch (error) {
 console.error("Error fetching services:", error);
 Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudieron cargar tus servicios.', confirmButtonColor: '#3b82f6' });
 } finally {
 setLoading(false);
 }
 };
 fetchServices();
 }, []);

 if (loading) {
 return (
 <div className="flex flex-col items-center justify-center min-h-[400px]">
 <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
 <p className="text-slate-500 font-medium">Cargando tus servicios...</p>
 </div>
 );
 }

 return (
 <div className="p-6 max-w-6xl mx-auto">
 <div className="mb-8">
 <h1 className="text-3xl font-black text-slate-900 mb-2">Mis Servicios</h1>
 <p className="text-slate-500">Administra y agenda las citas de tus servicios adquiridos en el Marketplace.</p>
 </div>

 {services.length > 0 ? (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {services.map((service, index) => (
 <div key={`${service.orderId}-${index}`} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all group">
 <div className="flex justify-between items-start mb-4">
 <div className="p-3 bg-blue-50 rounded-xl text-blue-600 group-hover:scale-110 transition-transform">
 <Calendar className="w-6 h-6" />
 </div>
 <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${service.estadoOrden === 'COMPLETADA' || service.estadoOrden === 'PAGADA'
 ? 'bg-green-100 text-green-700 '
 : 'bg-orange-100 text-orange-700 '
 }`}>
 {service.estadoOrden}
 </span>
 </div>

 <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight">
 {service.servicioNombre}
 </h3>

 <div className="space-y-2 mb-6 text-sm text-slate-500">
 <div className="flex items-center gap-2">
 <Clock className="w-4 h-4" />
 <span>Orden: {service.codigoOrden}</span>
 </div>
 <p className="italic">Adquirido el {new Date(service.createdAt).toLocaleDateString()}</p>
 </div>

 <button
 onClick={() => service.empresaId ? setSelectedService(service) : undefined}
 disabled={!service.empresaId}
 className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95"
 >
 <CalendarPlus className="w-5 h-5" />
 Agendar Turno
 </button>
 </div>
 ))}
 </div>
 ) : (
 <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 ">
 <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
 <Calendar className="w-10 h-10 text-slate-400" />
 </div>
 <h2 className="text-2xl font-bold text-slate-900 mb-2">No tienes servicios comprados</h2>
 <p className="text-slate-500 mb-8 max-w-md mx-auto">
 Aún no has adquirido ningún servicio veterinario en el Marketplace.
 </p>
 <a href="/marketplace" className="inline-flex items-center gap-2 text-blue-600 font-bold hover:underline">
 Ver servicios en el Marketplace →
 </a>
 </div>
 )}

 {selectedService && (
 <AgendarCitaModal
 isOpen={true}
 onClose={() => setSelectedService(null)}
 servicioId={selectedService.servicioId}
 empresaId={selectedService.empresaId}
 servicioNombre={selectedService.servicioNombre}
 />
 )}
 </div>
 );
};
