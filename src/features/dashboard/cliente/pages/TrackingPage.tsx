import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { deliveryService, type DeliveryTrackingDTO } from "../services/deliveryService";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useAuth0 } from "@auth0/auth0-react";
import {
 Package, Truck, Store, Navigation, CheckCircle, Search,
 ArrowLeft, Clock, MapPin, ShieldCheck, AlertCircle, XCircle, Route, Trash2,
 MessageCircle, Star
} from "lucide-react";
import { DeliveryMap } from "../components/DeliveryMap";
import { RatingModal } from "../components/RatingModal";
import Swal from "sweetalert2";

const STOMP_URL = import.meta.env.VITE_WS_URL || "http://localhost:8080";

const STEPS = [
 { key: "BUSCANDO_REPARTIDOR", label: "Buscando repartidor", icon: Search, color: "text-amber-500" },
 { key: "REPARTIDOR_ASIGNADO", label: "Repartidor asignado", icon: Truck, color: "text-blue-500" },
 { key: "EN_TIENDA", label: "En la tienda", icon: Store, color: "text-indigo-500" },
 { key: "RECOGIDO", label: "Producto recogido", icon: Package, color: "text-purple-500" },
 { key: "EN_CAMINO", label: "En camino", icon: Navigation, color: "text-sky-500" },
 { key: "ENTREGADO", label: "Entregado", icon: CheckCircle, color: "text-green-500" },
];

const FINAL_STATES = ["ENTREGADO", "FALLIDO", "CANCELADO"];

export const TrackingPage = () => {
 const { ordenId } = useParams<{ ordenId: string }>();
 const [delivery, setDelivery] = useState<DeliveryTrackingDTO | null>(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
 const stompRef = useRef<Client | null>(null);
 const { getAccessTokenSilently } = useAuth0();

 // Fetch inicial del delivery
 useEffect(() => {
 if (!ordenId) return;
 setLoading(true);
 deliveryService.getByOrden(Number(ordenId))
 .then(res => {
 setDelivery(res.data);
 setError(null);
 })
 .catch(() => setError("No se encontró un envío para esta orden."))
 .finally(() => setLoading(false));
 }, [ordenId]);

 // WebSocket para updates en tiempo real
 useEffect(() => {
 if (!delivery || FINAL_STATES.includes(delivery.estado)) return;

 let client: Client | null = null;

 const connect = async () => {
 try {
 const token = await getAccessTokenSilently();
 client = new Client({
 webSocketFactory: () => new SockJS(`${STOMP_URL}/api/v1/ws`),
 connectHeaders: { Authorization: `Bearer ${token}` },
 reconnectDelay: 5000,
 debug: () => {},
 });

 client.onConnect = () => {
 client?.subscribe(`/topic/delivery/${delivery.idDelivery}/estado`, (msg) => {
 let nuevoEstado: string;
 try {
 const parsed = JSON.parse(msg.body);
 nuevoEstado = typeof parsed === "object" && parsed.estado ? parsed.estado : String(parsed);
 } catch {
 nuevoEstado = msg.body.replace(/"/g, "");
 }

 setDelivery(prev => prev ? { ...prev, estado: nuevoEstado } : prev);

 deliveryService.getByOrden(Number(ordenId))
 .then(res => setDelivery(res.data))
 .catch(() => {});
 });

 client?.subscribe(`/topic/delivery/${delivery.idDelivery}/ubicacion`, (msg) => {
 try {
 const ubicacion = JSON.parse(msg.body);
 setDelivery(prev => prev ? {
 ...prev,
 repartidorLat: ubicacion.lat,
 repartidorLng: ubicacion.lng,
 } : prev);
 } catch {
 // Ignore malformed GPS data
 }
 });
 };

 client.activate();
 stompRef.current = client;
 } catch {
 // Token acquisition failed
 }
 };

 connect();

 return () => {
 if (client) {
 client.deactivate();
 }
 stompRef.current = null;
 };
 }, [delivery?.idDelivery, ordenId, getAccessTokenSilently]);

 const handleCancelar = async () => {
 if (!delivery) return;

 const result = await Swal.fire({
 title: '¿Cancelar envío?',
 text: "Esta acción no se puede deshacer. Podrás rastrearlo nuevamente si lo pides otra vez.",
 icon: 'warning',
 showCancelButton: true,
 confirmButtonColor: '#EF4444',
 cancelButtonColor: '#64748B',
 confirmButtonText: 'Sí, cancelar envío',
 cancelButtonText: 'No, esperar',
 reverseButtons: true
 });

 if (result.isConfirmed) {
 try {
 await deliveryService.cancelarDelivery(delivery.idDelivery);
 Swal.fire('Cancelado', 'Tu envío ha sido cancelado exitosamente.', 'success');
 // El WebSocket actualizará el estado automáticamente
 } catch (err: any) {
 Swal.fire('Error', err.response?.data?.message || 'No se pudo cancelar el envío.', 'error');
 }
 }
 };

 const handleRatingSubmit = async (data: any) => {
 if (!delivery) return;
 try {
 await deliveryService.calificar(delivery.idDelivery, data);
 Swal.fire('¡Gracias!', 'Tu calificación ha sido enviada.', 'success');
 // Recargar datos para ocultar el botón
 const res = await deliveryService.getByOrden(Number(ordenId));
 setDelivery(res.data);
 } catch (err: any) {
 Swal.fire('Error', err.response?.data?.message || 'No se pudo enviar la calificación.', 'error');
 throw err;
 }
 };

 // Index del paso actual en el stepper
 const currentStepIndex = delivery
 ? STEPS.findIndex(s => s.key === delivery.estado)
 : -1;

 const isFinal = delivery ? FINAL_STATES.includes(delivery.estado) : false;
 const isFailed = delivery?.estado === "FALLIDO" || delivery?.estado === "CANCELADO";

 if (loading) {
 return (
 <div className="min-h-screen flex items-center justify-center">
 <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
 </div>
 );
 }

 if (error || !delivery) {
 return (
 <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
 <AlertCircle className="w-16 h-16 text-gray-300 mb-4" />
 <h2 className="text-xl font-bold text-gray-800 ">{error || "No hay delivery"}</h2>
 <Link to="/portal/cliente/compras" className="mt-4 text-blue-600 hover:underline text-sm font-medium flex items-center gap-1">
 <ArrowLeft className="w-4 h-4" /> Volver a Mis Compras
 </Link>
 </div>
 );
 }

 return (
 <div className="container mx-auto px-4 py-8 max-w-2xl min-h-screen">
 {/* Header */}
 <div className="flex items-center gap-3 mb-8">
 <Link
 to="/portal/cliente/compras"
 className="p-2 hover:bg-gray-100 :bg-gray-800 rounded-xl transition-colors"
 >
 <ArrowLeft className="w-5 h-5 text-gray-500" />
 </Link>
 <div>
 <h1 className="text-2xl font-bold text-gray-900 ">Seguimiento de Envío</h1>
 <p className="text-sm text-gray-500">Orden #{ordenId}</p>
 </div>
 </div>

 {/* Estado final: Fallido / Cancelado */}
 {isFailed && (
 <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-4">
 <XCircle className="w-10 h-10 text-red-500 shrink-0" />
 <div>
 <h3 className="font-bold text-red-700 ">
 {delivery.estado === "CANCELADO" ? "Envío Cancelado" : "Envío Fallido"}
 </h3>
 <p className="text-sm text-red-600/70 mt-1">
 Contacta a soporte si necesitas ayuda con tu pedido.
 </p>
 </div>
 </div>
 )}

 {/* Stepper Visual */}
 <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
 <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Estado del Envío</h3>
 <div className="space-y-0">
 {STEPS.map((step, idx) => {
 const isActive = idx === currentStepIndex;
 const isCompleted = idx < currentStepIndex;
 const isPending = idx > currentStepIndex;
 const StepIcon = step.icon;

 return (
 <div key={step.key} className="flex items-start gap-4">
 {/* Línea + Punto */}
 <div className="flex flex-col items-center">
 <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${
 isCompleted ? "bg-green-100 text-green-600" :
 isActive ? "bg-blue-100 text-blue-600 ring-4 ring-blue-100 " :
 "bg-gray-100 text-gray-400"
 }`}>
 {isCompleted ? (
 <CheckCircle className="w-5 h-5" />
 ) : (
 <StepIcon className="w-5 h-5" />
 )}
 </div>
 {idx < STEPS.length - 1 && (
 <div className={`w-0.5 h-8 transition-colors duration-500 ${
 isCompleted ? "bg-green-300 " : "bg-gray-200 "
 }`} />
 )}
 </div>
 {/* Texto */}
 <div className={`pt-2 pb-4 ${isPending ? "opacity-40" : ""}`}>
 <p className={`text-sm font-bold ${
 isActive ? "text-blue-700 " :
 isCompleted ? "text-green-700 " :
 "text-gray-500"
 }`}>
 {step.label}
 {isActive && !isFinal && (
 <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-wider">
 <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
 Ahora
 </span>
 )}
 </p>
 </div>
 </div>
 );
 })}
 </div>
 </div>

 {/* Mapa con Leaflet */}
 <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
 <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Mapa en Vivo</h3>
 <DeliveryMap
 origenLat={delivery.origenLat}
 origenLng={delivery.origenLng}
 origenDireccion={delivery.origenDireccion}
 destinoLat={delivery.destinoLat}
 destinoLng={delivery.destinoLng}
 destinoDireccion={delivery.destinoDireccion}
 repartidorLat={delivery.repartidorLat}
 repartidorLng={delivery.repartidorLng}
 repartidorNombre={delivery.repartidorNombre}
 />
 </div>

 {/* Código OTP del Cliente */}
 {!isFinal && (
 <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 mb-6">
 <div className="flex items-center gap-3 mb-3">
 <ShieldCheck className="w-6 h-6 text-amber-600" />
 <h3 className="font-bold text-amber-800 ">Tu Código de Entrega (PIN)</h3>
 </div>
 <p className="text-sm text-amber-700/80 mb-4">
 Cuando el repartidor llegue, dile este código para confirmar la entrega.
 Lo recibiste en el correo de confirmación de tu compra.
 </p>
 <div className="bg-white rounded-xl p-4 flex items-center justify-center border-2 border-dashed border-amber-300 ">
 <p className="text-3xl font-mono font-black tracking-[0.5em] text-amber-800 select-all">
 {delivery.otpCliente || "****"}
 </p>
 </div>
 {!delivery.otpCliente && (
 <p className="text-xs text-amber-600/60 mt-2 text-center">
 Revisa tu correo electrónico para ver el código.
 </p>
 )}
 </div>
 )}

 {/* Tarjeta del Repartidor */}
 {delivery.repartidorId ? (
 <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
 <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Tu Repartidor</h3>
 <div className="flex items-center gap-4">
 {delivery.repartidorFoto ? (
 <img
 src={delivery.repartidorFoto}
 alt="Repartidor"
 className="w-16 h-16 rounded-full object-cover border-2 border-gray-100 shadow-sm"
 />
 ) : (
 <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
 <Truck className="w-7 h-7" />
 </div>
 )}
 <div className="flex-1">
 <p className="font-bold text-gray-900 text-lg">{delivery.repartidorNombre}</p>
 <div className="flex items-center gap-3 mt-1">
 {delivery.repartidorVehiculo && (
 <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg font-medium">
 🏍️ {delivery.repartidorVehiculo}
 </span>
 )}
 {delivery.repartidorCalificacionPromedio && (
 <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100 ">
 <Star size={12} className="text-amber-500 fill-amber-500" />
 <span className="text-xs font-bold text-amber-700 ">
 {Number(delivery.repartidorCalificacionPromedio).toFixed(1)}
 </span>
 </div>
 )}
 </div>
 </div>
 {delivery.repartidorTelefono && (
 <a
 href={`https://wa.me/${delivery.repartidorTelefono.replace(/\D/g, '')}`}
 target="_blank"
 rel="noopener noreferrer"
 className="p-3 bg-green-100 text-green-600 rounded-xl hover:bg-green-200 transition-colors flex items-center justify-center gap-2"
 title="Escribir por WhatsApp"
 >
 <MessageCircle className="w-5 h-5" />
 </a>
 )}
 </div>
 </div>
 ) : (
 !isFinal && (
 <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
 <div className="flex items-center gap-4">
 <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
 <Search className="w-6 h-6 text-gray-400 animate-pulse" />
 </div>
 <div>
 <p className="font-bold text-gray-700 ">Buscando repartidor...</p>
 <p className="text-xs text-gray-500 mt-0.5">Un repartidor cercano tomará tu pedido pronto.</p>
 </div>
 </div>
 </div>
 )
 )}

 {/* Direcciones */}
 <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
 <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Detalles de Ruta</h3>
 <div className="space-y-4">
 <div className="flex items-start gap-3">
 <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
 <Store className="w-4 h-4" />
 </div>
 <div>
 <p className="text-xs font-semibold text-gray-400 uppercase">Recogida</p>
 <p className="text-sm font-medium text-gray-800 mt-0.5">{delivery.origenDireccion}</p>
 </div>
 </div>
 <div className="ml-4 border-l-2 border-dashed border-gray-200 h-4" />
 <div className="flex items-start gap-3">
 <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600 shrink-0 mt-0.5">
 <MapPin className="w-4 h-4" />
 </div>
 <div>
 <p className="text-xs font-semibold text-gray-400 uppercase">Entrega</p>
 <p className="text-sm font-medium text-gray-800 mt-0.5">{delivery.destinoDireccion}</p>
 {delivery.destinoReferencia && (
 <p className="text-xs text-gray-500 mt-0.5">Ref: {delivery.destinoReferencia}</p>
 )}
 </div>
 </div>
 </div>
 </div>

 {/* Botón de Cancelación (Solo si no ha sido recogido) */}
 {!isFinal && delivery.estado !== 'RECOGIDO' && delivery.estado !== 'EN_CAMINO' && delivery.estado !== 'CERCA' && (
 <div className="mb-6">
 <button
 onClick={handleCancelar}
 className="w-full flex items-center justify-center gap-2 p-4 text-red-600 font-bold bg-red-50 border border-red-100 rounded-2xl hover:bg-red-100 :bg-red-900/20 transition-all active:scale-[0.98]"
 >
 <Trash2 size={20} /> Cancelar Pedido de Envío
 </button>
 <p className="text-[10px] text-gray-400 text-center mt-2 uppercase tracking-widest font-bold">
 Solo puedes cancelar antes de que el repartidor recoja el producto
 </p>
 </div>
 )}

 {/* Info adicional */}
 <div className="grid grid-cols-3 gap-4 mb-6">
 <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
 <Clock className="w-5 h-5 text-gray-400 mx-auto mb-2" />
 <p className="text-xs text-gray-500 font-medium">Tiempo Estimado</p>
 <p className="text-lg font-black text-gray-800 ">
 {delivery.tiempoEstimadoMin ? `${delivery.tiempoEstimadoMin} min` : "—"}
 </p>
 </div>
 <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
 <Route className="w-5 h-5 text-gray-400 mx-auto mb-2" />
 <p className="text-xs text-gray-500 font-medium">Distancia</p>
 <p className="text-lg font-black text-gray-800 ">
 {delivery.distanciaKm ? `${Number(delivery.distanciaKm).toFixed(1)} km` : "—"}
 </p>
 </div>
 <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
 <Package className="w-5 h-5 text-gray-400 mx-auto mb-2" />
 <p className="text-xs text-gray-500 font-medium">Costo Envío</p>
 <p className="text-lg font-black text-gray-800 ">
 S/ {delivery.costoDelivery.toFixed(2)}
 </p>
 </div>
 </div>

 {/* Foto de entrega (si fue entregado con foto) */}
 {delivery.estado === "ENTREGADO" && delivery.fotoEntregaUrl && (
 <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
 <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Foto de Entrega</h3>
 <img
 src={delivery.fotoEntregaUrl}
 alt="Evidencia de entrega"
 className="w-full rounded-xl object-cover max-h-64"
 />
 </div>
 )}

 {/* Estado ENTREGADO: Mensaje de éxito */}
 {delivery.estado === "ENTREGADO" && (
 <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
 <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
 <h3 className="text-lg font-bold text-green-800 ">¡Pedido Entregado!</h3>
 <p className="text-sm text-green-600/70 mt-1">
 Tu pedido fue entregado exitosamente. ¡Gracias por tu compra!
 </p>
 
 {/* Botón para Calificar */}
 {delivery.calificacionRepartidor === null && (
 <button
 onClick={() => setIsRatingModalOpen(true)}
 className="mt-6 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-green-600/20 transition-all active:scale-95 flex items-center justify-center gap-2 mx-auto"
 >
 <Star className="w-5 h-5 fill-white" /> Calificar Experiencia
 </button>
 )}

 {delivery.calificacionRepartidor !== null && (
 <div className="mt-6 flex flex-col items-center gap-1 opacity-60">
 <div className="flex gap-0.5">
 {[1, 2, 3, 4, 5].map(s => (
 <Star 
 key={s} 
 size={16} 
 className={s <= (delivery.calificacionRepartidor || 0) ? 'text-amber-500 fill-amber-500' : 'text-gray-300'} 
 />
 ))}
 </div>
 <p className="text-[10px] font-bold uppercase tracking-widest text-green-800/40">Calificado satisfactoriamente</p>
 </div>
 )}
 </div>
 )}

 {/* Modal de Calificación */}
 <RatingModal
 isOpen={isRatingModalOpen}
 onClose={() => setIsRatingModalOpen(false)}
 onSubmit={handleRatingSubmit}
 repartidorNombre={delivery.repartidorNombre || undefined}
 />
 </div>
 );
};
