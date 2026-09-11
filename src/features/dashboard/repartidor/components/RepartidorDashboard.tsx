import React, { useState, useEffect } from 'react';
import { useRepartidor } from '../hooks/useRepartidor';
import { useGeolocation } from '../hooks/useGeolocation';
import { useStompClient } from '../hooks/useStompClient';
import { useAuth } from '../../../auth/context/useAuth';
import Swal from 'sweetalert2';
import { repartidorService } from '../services/repartidorService';
import { 
    MapPin, Store, Navigation, CheckCircle, Package, AlertCircle, 
    Power, User, Bike, Car, Truck, ShoppingBag, 
    MessageCircle, Star, Camera, History, Home, CreditCard,
    ChevronRight, Calendar, DollarSign, ArrowUpRight, X
} from 'lucide-react';
import type { DeliveryResponseDTO } from '../types/delivery';

export const RepartidorDashboard: React.FC = () => {
    const { logout } = useAuth();
    const { 
        perfil, 
        deliveriesActivos,
        historial,
        loading, 
        toggleDisponibilidad, 
        avanzarEstado, 
        entregarConOTP, 
        rechazarPedido,
        recargarDatos 
    } = useRepartidor();
    
    const [activeTab, setActiveTab] = useState<'home' | 'history' | 'profile'>('home');
    const [otpMap, setOtpMap] = useState<Record<number, string>>({});
    const [disponibles, setDisponibles] = useState<DeliveryResponseDTO[]>([]);
    const [aceptandoId, setAceptandoId] = useState<number | null>(null);
    const [cargandoFoto, setCargandoFoto] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const [showIncidenciaModal, setShowIncidenciaModal] = useState(false);
    const [incidenciaDeliveryId, setIncidenciaDeliveryId] = useState<number | null>(null);
    const [motivoIncidencia, setMotivoIncidencia] = useState("");
    const [descIncidencia, setDescIncidencia] = useState("");
    const [fotoIncidencia, setFotoIncidencia] = useState<File | null>(null);
    const [enviandoIncidencia, setEnviandoIncidencia] = useState(false);

    const isDisponible = perfil?.estadoActual === 'DISPONIBLE';
    const isOcupado = perfil?.estadoActual === 'OCUPADO' || deliveriesActivos.length > 0;
    const maxPedidos = 3;

    const gananciasTotales = historial.reduce((acc, curr) => acc + (curr.costoDelivery || 0), 0);
    const entregasCompletadas = historial.length;

    useEffect(() => {
        if (isDisponible && deliveriesActivos.length === 0) {
            repartidorService.getPedidosDisponibles()
                .then(res => setDisponibles(res.data.data))
                .catch(err => console.error("Error cargando disponibles:", err));
        }
    }, [isDisponible, deliveriesActivos.length]);

    const { isConnected, sendLocation, stompClient } = useStompClient({
        repartidorId: perfil?.idRepartidor,
        onNewOrder: (pedido) => {
            console.log("Pedido asignado directamente:", pedido);
            recargarDatos();
        }
    });

    useEffect(() => {
        if (stompClient && isConnected && isDisponible) {
            const sub = stompClient.subscribe('/topic/pedidos-disponibles', (msg) => {
                const nuevo = JSON.parse(msg.body) as DeliveryResponseDTO;
                setDisponibles(prev => {
                    if (prev.find(p => p.idDelivery === nuevo.idDelivery)) return prev;
                    return [nuevo, ...prev];
                });
                
                const Toast = Swal.mixin({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true
                });
                Toast.fire({
                    icon: 'info',
                    title: '¡Nuevo pedido disponible!'
                });
            });

            const subUpdate = stompClient.subscribe('/topic/pedidos-pool-update', (msg) => {
                const idEliminar = parseInt(msg.body);
                setDisponibles(prev => prev.filter(d => d.idDelivery !== idEliminar));
            });

            return () => {
                sub.unsubscribe();
                subUpdate.unsubscribe();
            };
        }
    }, [stompClient, isConnected, isDisponible]);

    const handleAceptarPedido = async (deliveryId: number) => {
        try {
            setAceptandoId(deliveryId);
            await repartidorService.aceptarPedido(deliveryId);
            setDisponibles(prev => prev.filter(d => d.idDelivery !== deliveryId));
            Swal.fire({
                title: '¡Pedido Aceptado!',
                text: 'El pedido ha sido asignado a ti correctamente.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
            recargarDatos();
        } catch (err: any) {
            Swal.fire('Error', err.response?.data?.message || 'No se pudo aceptar el pedido', 'error');
        } finally {
            setAceptandoId(null);
        }
    };

    const handleFotoChange = async (e: React.ChangeEvent<HTMLInputElement>, deliveryId: number) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setCargandoFoto(true);
            await repartidorService.confirmarFoto(deliveryId, file);
            Swal.fire({
                title: '¡Entrega confirmada!',
                text: 'La evidencia fotográfica se guardó correctamente.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
            recargarDatos();
        } catch (err: any) {
            Swal.fire('Error', err.response?.data?.message || 'No se pudo subir la foto', 'error');
        } finally {
            setCargandoFoto(false);
        }
    };

    const handleLocationUpdate = (lat: number, lng: number) => {
        if (deliveriesActivos.length > 0 && isConnected) {
            deliveriesActivos.forEach(d => sendLocation(lat, lng, d.idDelivery));
        } else {
            repartidorService.actualizarUbicacion(lat, lng).catch(console.error);
        }
    };

    const handleReportarIncidencia = async () => {
        if (!incidenciaDeliveryId || !motivoIncidencia || !descIncidencia) return;

        try {
            setEnviandoIncidencia(true);
            await repartidorService.reportarIncidencia(
                incidenciaDeliveryId,
                motivoIncidencia,
                descIncidencia,
                fotoIncidencia || undefined
            );

            Swal.fire({
                title: 'Reporte Enviado',
                text: 'La incidencia ha sido registrada. El pedido ha sido actualizado.',
                icon: 'success'
            });

            setShowIncidenciaModal(false);
            setIncidenciaDeliveryId(null);
            setMotivoIncidencia("");
            setDescIncidencia("");
            setFotoIncidencia(null);
            recargarDatos();
        } catch (err: any) {
            Swal.fire('Error', err.response?.data?.message || 'No se pudo enviar el reporte', 'error');
        } finally {
            setEnviandoIncidencia(false);
        }
    };

    useGeolocation(isDisponible || isOcupado, handleLocationUpdate);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!perfil) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6 text-amber-600">
                    <AlertCircle className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Perfil no encontrado</h2>
                <p className="text-gray-500 mt-3 max-w-xs mx-auto">
                    No hemos podido encontrar tu información de repartidor.
                </p>
                <div className="mt-8 flex flex-col gap-3 w-full max-w-xs">
                    <a href="/register/perfil/repartidor" className="bg-blue-600 text-white font-bold py-4 px-6 rounded-2xl">
                        Completar mi Perfil
                    </a>
                </div>
            </div>
        );
    }

    const VehicleIcon = () => {
        if (!perfil.tipoVehiculo) return <Bike className="w-5 h-5" />;
        const type = perfil.tipoVehiculo.toLowerCase();
        if (type.includes('auto') || type.includes('carro')) return <Car className="w-5 h-5" />;
        if (type.includes('camioneta') || type.includes('furgon')) return <Truck className="w-5 h-5" />;
        return <Bike className="w-5 h-5" />;
    };

    const renderDeliveryCard = (delivery: DeliveryResponseDTO) => {
        const setOtp = (val: string) => setOtpMap(prev => ({ ...prev, [delivery.idDelivery]: val }));
        const currentOtp = otpMap[delivery.idDelivery] || "";

        return (
            <div key={delivery.idDelivery} className="bg-white rounded-3xl p-6 shadow-xl border border-blue-100 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
                
                <div className="relative z-10">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                                {delivery.estado.replace('_', ' ')}
                            </span>
                            {(delivery.estado === 'REPARTIDOR_ASIGNADO' || delivery.estado === 'EN_TIENDA') && (
                                <button
                                    onClick={() => rechazarPedido(delivery.idDelivery)}
                                    className="flex items-center gap-1 bg-red-50 text-red-600 text-[10px] font-bold px-2 py-1 rounded-full hover:bg-red-100 transition-colors"
                                >
                                    <X className="w-3 h-3" /> RECHAZAR
                                </button>
                            )}
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Pago</p>
                            <p className="text-lg font-black text-blue-600">S/ {delivery.costoDelivery.toFixed(2)}</p>
                        </div>
                    </div>

                    {/* Info Cliente */}
                    <div className="flex justify-between items-center bg-gray-50 p-3 rounded-2xl mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold uppercase">
                                {delivery.clienteNombre?.charAt(0) || 'C'}
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Cliente</p>
                                <p className="text-sm font-bold text-gray-800 truncate max-w-[120px]">{delivery.clienteNombre}</p>
                            </div>
                        </div>
                        {delivery.clienteTelefono && (
                            <a 
                                href={`https://wa.me/${delivery.clienteTelefono.replace(/\D/g, '')}`} 
                                target="_blank" 
                                className="bg-green-500 text-white p-2.5 rounded-xl shadow-lg shadow-green-100"
                            >
                                <MessageCircle className="w-5 h-5" />
                            </a>
                        )}
                    </div>

                    {/* Ruta */}
                    <div className="space-y-6 mb-8 relative before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                        <div className="relative pl-8">
                            <div className="absolute left-0 top-0.5 w-5 h-5 rounded-full bg-white border-2 border-blue-500 flex items-center justify-center">
                                <Store className="w-2.5 h-2.5 text-blue-500" />
                            </div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Origen</p>
                            <p className="text-xs font-bold text-gray-800 leading-snug">{delivery.origenDireccion}</p>
                        </div>
                        <div className="relative pl-8">
                            <div className="absolute left-0 top-0.5 w-5 h-5 rounded-full bg-white border-2 border-red-500 flex items-center justify-center">
                                <Navigation className="w-2.5 h-2.5 text-red-500" />
                            </div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Destino</p>
                            <p className="text-xs font-bold text-gray-800 leading-snug">{delivery.destinoDireccion}</p>
                        </div>
                    </div>

                    {/* Acciones */}
                    {delivery.estado === 'REPARTIDOR_ASIGNADO' && (
                        <button onClick={() => avanzarEstado(delivery.idDelivery, 'EN_TIENDA')} className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200">
                            LLEGUÉ A LA TIENDA
                        </button>
                    )}
                    {delivery.estado === 'EN_TIENDA' && (
                        <button onClick={() => avanzarEstado(delivery.idDelivery, 'RECOGIDO')} className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200">
                            PRODUCTO RECOGIDO
                        </button>
                    )}
                    {delivery.estado === 'RECOGIDO' && (
                        <button onClick={() => avanzarEstado(delivery.idDelivery, 'EN_CAMINO')} className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200">
                            INICIAR ENTREGA
                        </button>
                    )}
                    {(delivery.estado === 'EN_CAMINO' || delivery.estado === 'CERCA') && (
                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                <p className="text-center text-[10px] font-bold text-gray-400 uppercase mb-3">Confirmación de Entrega</p>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={currentOtp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                        placeholder="CÓDIGO PIN"
                                        className="flex-1 bg-white border border-gray-200 rounded-xl px-4 text-center font-black tracking-[0.3em] outline-none focus:border-blue-500"
                                    />
                                    <button 
                                        onClick={() => { entregarConOTP(delivery.idDelivery, currentOtp); setOtp(''); }}
                                        disabled={currentOtp.length !== 4}
                                        className="bg-green-500 text-white px-6 py-4 rounded-xl font-bold disabled:opacity-50"
                                    >
                                        ENTREGAR
                                    </button>
                                </div>
                                <div className="mt-4">
                                    <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={(e) => handleFotoChange(e, delivery.idDelivery)} />
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={cargandoFoto}
                                        className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-[10px] font-bold text-gray-500 flex items-center justify-center gap-2"
                                    >
                                        <Camera className="w-4 h-4" /> {cargandoFoto ? 'SUBIENDO...' : 'O SUBIR FOTO DE EVIDENCIA'}
                                    </button>
                                </div>
                                <div className="mt-4">
                                    <button 
                                        onClick={() => { setIncidenciaDeliveryId(delivery.idDelivery); setShowIncidenciaModal(true); }}
                                        className="w-full py-3 text-[10px] font-bold text-red-500 flex items-center justify-center gap-2 hover:bg-red-50 rounded-xl transition-all"
                                    >
                                        <AlertCircle className="w-4 h-4" /> REPORTAR PROBLEMA / ACCIDENTE
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderHome = () => (
        <div className="space-y-6 pb-24">
            {/* Control de Disponibilidad */}
            <div className="bg-white/70 backdrop-blur-lg p-5 rounded-3xl shadow-sm border border-white/60">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-sm font-bold text-gray-800">
                            {isDisponible ? 'En línea' : isOcupado ? 'Ocupado' : 'Desconectado'}
                        </h3>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                            {isConnected ? '⚡ GPS Activo' : '⏳ Conectando...'}
                        </p>
                    </div>
                    <button 
                        onClick={() => toggleDisponibilidad(!isDisponible)}
                        disabled={isOcupado}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all ${
                            isOcupado ? 'bg-gray-200 text-gray-400' : 
                            isDisponible ? 'bg-red-500 text-white shadow-red-200' : 'bg-green-500 text-white shadow-green-200'
                        }`}
                    >
                        <Power className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Resumen de Ganancias y Estadísticas */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-5 rounded-3xl text-white shadow-lg shadow-blue-200">
                    <div className="flex justify-between items-start mb-2">
                        <DollarSign className="w-5 h-5 opacity-80" />
                        <ArrowUpRight className="w-4 h-4 opacity-60" />
                    </div>
                    <p className="text-[10px] font-bold opacity-80 uppercase tracking-wider">Ganancias</p>
                    <p className="text-xl font-black">S/ {gananciasTotales.toFixed(2)}</p>
                </div>
                <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-2 text-blue-600">
                        <CheckCircle className="w-5 h-5 opacity-80" />
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Completados</p>
                    <p className="text-xl font-black text-gray-800">{entregasCompletadas}</p>
                </div>
            </div>

            {/* Pedidos Activos */}
            {deliveriesActivos.length > 0 && (
                <div className="flex items-center justify-between px-1">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <Truck className="w-4 h-4 text-blue-600" />
                        Pedidos Activos
                    </h3>
                    <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-black">
                        {deliveriesActivos.length}/{maxPedidos}
                    </span>
                </div>
            )}

            {/* Área de Delivery Activo o Disponibles */}
            {deliveriesActivos.length === 0 ? (
                <div className="space-y-4">
                    {isDisponible ? (
                        <>
                            <div className="flex items-center justify-between px-1">
                                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                    <ShoppingBag className="w-4 h-4 text-blue-600" />
                                    Pedidos Disponibles
                                </h3>
                                <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-black">
                                    {disponibles.length}
                                </span>
                            </div>
                            
                            {disponibles.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-12 bg-white/40 backdrop-blur-md rounded-3xl border-2 border-dashed border-gray-200">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-20"></div>
                                        <div className="bg-blue-100 p-4 rounded-full text-blue-600 relative z-10">
                                            <MapPin className="w-8 h-8 animate-bounce" />
                                        </div>
                                    </div>
                                    <h3 className="mt-6 text-sm font-bold text-gray-600">Buscando...</h3>
                                    <p className="text-[10px] text-gray-400 mt-1">Mantente cerca de zonas comerciales.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {disponibles.map(pedido => (
                                        <div key={pedido.idDelivery} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                                            <div className="flex justify-between items-center mb-3">
                                                <div className="bg-blue-50 text-blue-600 p-2 rounded-xl">
                                                    <Package className="w-4 h-4" />
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] text-gray-400 font-bold">GANANCIA</p>
                                                    <p className="text-base font-black text-blue-600">S/ {pedido.costoDelivery.toFixed(2)}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-2 mb-4 relative before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                                                <div className="flex items-center gap-3 pl-4 relative">
                                                    <div className="absolute left-0 w-3 h-3 rounded-full bg-blue-100 border-2 border-blue-500"></div>
                                                    <p className="text-xs text-gray-700 font-medium truncate">{pedido.origenDireccion}</p>
                                                </div>
                                                <div className="flex items-center gap-3 pl-4 relative">
                                                    <div className="absolute left-0 w-3 h-3 rounded-full bg-red-100 border-2 border-red-500"></div>
                                                    <p className="text-xs text-gray-700 font-medium truncate">{pedido.destinoDireccion}</p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => handleAceptarPedido(pedido.idDelivery)}
                                                disabled={aceptandoId === pedido.idDelivery || deliveriesActivos.length >= maxPedidos}
                                                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-md transition-all active:scale-95 disabled:bg-gray-300"
                                            >
                                                {aceptandoId === pedido.idDelivery ? 'ACEPTANDO...' : deliveriesActivos.length >= maxPedidos ? 'LÍMITE ALCANZADO' : 'TOMAR PEDIDO'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-12 bg-white/40 backdrop-blur-md rounded-3xl border-2 border-dashed border-gray-200">
                            <Power className="w-8 h-8 text-gray-300" />
                            <h3 className="mt-4 text-sm font-bold text-gray-800">Desconectado</h3>
                            <p className="text-[10px] text-gray-500 mt-1">Conéctate para recibir pedidos.</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {deliveriesActivos.map(delivery => renderDeliveryCard(delivery))}
                </div>
            )}

            {/* Modal de Incidencia */}
            {showIncidenciaModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="p-6">
                            <h3 className="text-lg font-black text-gray-800 text-center mb-1">Reportar Incidencia</h3>
                            <p className="text-[10px] text-gray-400 text-center mb-6 uppercase tracking-widest font-bold">Información de Seguridad</p>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block">Motivo</label>
                                    <select 
                                        value={motivoIncidencia}
                                        onChange={(e) => setMotivoIncidencia(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-bold text-gray-700 outline-none focus:border-blue-500"
                                    >
                                        <option value="">Selecciona un motivo</option>
                                        <option value="ACCIDENTE">Tuve un accidente</option>
                                        <option value="ROBO">Fui víctima de un robo</option>
                                        <option value="FALLA_MECANICA">Falla mecánica del vehículo</option>
                                        <option value="EMERGENCIA_PERSONAL">Emergencia personal</option>
                                        <option value="OTRO">Otro problema</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block">Descripción</label>
                                    <textarea 
                                        value={descIncidencia}
                                        onChange={(e) => setDescIncidencia(e.target.value)}
                                        placeholder="Cuéntanos brevemente qué ocurrió..."
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-medium text-gray-700 outline-none focus:border-blue-500 min-h-[100px] resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block">Evidencia (Opcional)</label>
                                    <div className="relative">
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            capture="environment"
                                            className="hidden" 
                                            id="incidencia-file"
                                            onChange={(e) => setFotoIncidencia(e.target.files?.[0] || null)}
                                        />
                                        <label 
                                            htmlFor="incidencia-file"
                                            className="w-full py-4 border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 transition-all"
                                        >
                                            <Camera className="w-5 h-5 text-gray-300" />
                                            <span className="text-[10px] font-bold text-gray-400 uppercase">
                                                {fotoIncidencia ? 'Foto seleccionada' : 'Tomar Foto de Evidencia'}
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex gap-3">
                                <button 
                                    onClick={() => { setShowIncidenciaModal(false); setIncidenciaDeliveryId(null); }}
                                    className="flex-1 py-4 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    CANCELAR
                                </button>
                                <button 
                                    onClick={handleReportarIncidencia}
                                    disabled={enviandoIncidencia || !motivoIncidencia || !descIncidencia}
                                    className="flex-[2] bg-red-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-red-100 transition-all active:scale-95 disabled:bg-gray-200"
                                >
                                    {enviandoIncidencia ? 'ENVIANDO...' : 'ENVIAR REPORTE'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const renderHistory = () => (
        <div className="space-y-6 pb-24">
            <div className="flex items-center justify-between px-2">
                <h2 className="text-xl font-bold text-gray-800">Mi Historial</h2>
                <div className="bg-white px-3 py-1 rounded-full text-[10px] font-black text-blue-600 border border-blue-50 shadow-sm">
                    {entregasCompletadas} TOTAL
                </div>
            </div>

            {historial.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-20 text-center">
                    <History className="w-12 h-12 text-gray-200 mb-4" />
                    <p className="text-sm font-bold text-gray-400">Aún no tienes entregas completadas.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {historial.map(item => (
                        <div key={item.idDelivery} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-green-50 text-green-600 p-2 rounded-xl">
                                    <CheckCircle className="w-4 h-4" />
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-400 font-bold">GANANCIA</p>
                                    <p className="text-sm font-black text-green-600">S/ {item.costoDelivery.toFixed(2)}</p>
                                </div>
                            </div>
                            <div className="space-y-1 mb-4">
                                <p className="text-[10px] font-bold text-gray-400 uppercase">Destino</p>
                                <p className="text-xs font-bold text-gray-700 truncate">{item.destinoDireccion}</p>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 bg-gray-50 px-3 py-2 rounded-xl">
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> 
                                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                                </div>
                                <div className="text-blue-600">PEDIDO #{item.idDelivery}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderProfile = () => (
        <div className="space-y-6 pb-24">
            <h2 className="text-xl font-bold text-gray-800 px-2">Mi Perfil</h2>
            
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-center">
                <div className="relative w-24 h-24 mx-auto mb-4">
                    {perfil.fotoPerfil ? (
                        <img src={perfil.fotoPerfil} alt="Perfil" className="w-full h-full rounded-3xl object-cover border-4 border-blue-50" />
                    ) : (
                        <div className="w-full h-full rounded-3xl bg-blue-50 flex items-center justify-center text-blue-300">
                            <User className="w-10 h-10" />
                        </div>
                    )}
                    <button className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-xl shadow-lg">
                        <Camera className="w-4 h-4" />
                    </button>
                </div>
                <h3 className="text-lg font-black text-gray-800">{perfil.nombres} {perfil.apellidos}</h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Repartidor Verificado</p>
            </div>

            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
                <div className="p-4 border-b border-gray-50 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-50 text-amber-500 rounded-xl"><VehicleIcon /></div>
                        <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Vehículo</p>
                            <p className="text-xs font-bold text-gray-700">{perfil.tipoVehiculo} - {perfil.placaVehiculo}</p>
                        </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
                <div className="p-4 border-b border-gray-50 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-500 rounded-xl"><CreditCard className="w-4 h-4"/></div>
                        <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Billetera / Pagos</p>
                            <p className="text-xs font-bold text-gray-700">Configurar cuenta bancaria</p>
                        </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
            </div>

            <button 
                onClick={() => { logout(); }}
                className="w-full py-4 text-red-500 font-bold text-sm bg-red-50 rounded-2xl border border-red-100 active:scale-95 transition-all"
            >
                Cerrar Sesión
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* Cabecera / Header Premium */}
            <div className="bg-white/80 backdrop-blur-xl border-b border-white shadow-sm sticky top-0 z-50">
                <div className="max-w-md mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                            <Truck className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-sm font-black text-gray-800 tracking-tight leading-tight uppercase">Dashboard</h1>
                            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter">Marketplace Delivery</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span className="text-xs font-black text-amber-700">{Number(perfil.calificacionPromedio || 5).toFixed(1)}</span>
                    </div>
                </div>
            </div>

            <div className="max-w-md mx-auto px-4 mt-6">
                {activeTab === 'home' && renderHome()}
                {activeTab === 'history' && renderHistory()}
                {activeTab === 'profile' && renderProfile()}
            </div>

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 pt-3 pb-8 px-8 z-50">
                <div className="max-w-md mx-auto flex justify-between items-center">
                    <button 
                        onClick={() => setActiveTab('home')}
                        className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'home' ? 'text-blue-600 scale-110' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <Home className={`w-6 h-6 ${activeTab === 'home' ? 'fill-blue-50' : ''}`} />
                        <span className="text-[10px] font-black uppercase tracking-tighter">Inicio</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('history')}
                        className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'history' ? 'text-blue-600 scale-110' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <History className={`w-6 h-6 ${activeTab === 'history' ? 'fill-blue-50' : ''}`} />
                        <span className="text-[10px] font-black uppercase tracking-tighter">Historial</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('profile')}
                        className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'profile' ? 'text-blue-600 scale-110' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <User className={`w-6 h-6 ${activeTab === 'profile' ? 'fill-blue-50' : ''}`} />
                        <span className="text-[10px] font-black uppercase tracking-tighter">Perfil</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
