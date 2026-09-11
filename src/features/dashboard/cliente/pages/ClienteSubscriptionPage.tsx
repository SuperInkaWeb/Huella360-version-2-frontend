import { useState, useEffect } from "react";
import { Check, AlertCircle } from "lucide-react";
import { subscriptionService } from "../../shared/subscriptions/services/subscriptionService";
import type { Plan, Suscripcion } from "../../shared/subscriptions/types/subscription.types";
import { Button } from "../../../../components/ui/Button";
import Swal from "sweetalert2";

export const ClienteSubscriptionPage = () => {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [mySub, setMySub] = useState<Suscripcion | null>(null);
    const [loading, setLoading] = useState(true);

    const isPaidPlan = mySub && mySub.plan.precioMensual > 0;
    const currentPrice = mySub?.plan.precioMensual ?? 0;
    const maxPrice = Math.max(...plans.map(p => p.precioMensual));
    const isMaxPlan = currentPrice >= maxPrice;
    const upgradePlans = plans.filter(p => p.precioMensual > currentPrice);

    const fetchSubscriptionData = async () => {
        try {
            setLoading(true);
            const [allPlansResult, mySubResult] = await Promise.allSettled([
                subscriptionService.getPlans("B2C"),
                subscriptionService.getMySubscription(),
            ]);
            if (allPlansResult.status === 'fulfilled') setPlans(allPlansResult.value);
            if (mySubResult.status === 'fulfilled') setMySub(mySubResult.value);
        } catch (error) {
            console.error("Error loading subscription data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscriptionData();
    }, []);

    const handleCancel = async () => {
        if (!mySub) return;
        const freePlan = plans.find(p => p.precioMensual === 0);
        if (!freePlan) return;

        const result = await Swal.fire({
            title: '¿Cancelar suscripción?',
            html: `
                <div class="text-left space-y-3">
                    <p class="text-slate-600">Volverás al plan <strong>${freePlan.nombre}</strong> y perderás los beneficios del plan actual.</p>
                    <p class="text-xs text-slate-400 italic">Esta acción es inmediata. Puedes volver a suscribirte cuando quieras.</p>
                </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, cancelar',
            cancelButtonText: 'Mantener plan',
            confirmButtonColor: '#ef4444',
            reverseButtons: true
        });

        if (result.isConfirmed) {
            try {
                await subscriptionService.updatePlan(freePlan.id);
                Swal.fire({ icon: 'success', title: 'Suscripción cancelada', timer: 2000, showConfirmButton: false });
                fetchSubscriptionData();
            } catch (err: any) {
                Swal.fire('Error', err.response?.data?.message || 'No se pudo cancelar.', 'error');
            }
        }
    };

    const handleUpgrade = async (plan: Plan) => {
        if (!mySub || mySub.plan.id === plan.id) return;

        const result = await Swal.fire({
            title: `Adquirir ${plan.nombre}`,
            html: `
                <div class="text-left space-y-4">
                    <div class="flex items-center justify-between text-lg font-bold">
                        <span class="text-slate-700">${plan.nombre}</span>
                        <span class="text-primary">S/ ${plan.precioMensual}<span class="text-sm font-normal text-slate-400">/mes</span></span>
                    </div>
                    <p class="text-xs text-slate-400">Pago único mensual. Se activa inmediatamente después del pago.</p>
                </div>
            `,
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Ir a pagar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#fe5c3c',
        });

        if (!result.isConfirmed) return;

        try {
            Swal.fire({
                title: 'Generando pago...',
                text: 'Preparando tu enlace de pago.',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            const preference = await subscriptionService.createSubscriptionCheckout(plan.id);
            const checkoutUrl = preference.sandboxInitPoint || preference.initPoint;
            if (checkoutUrl) window.open(checkoutUrl, '_blank');

            Swal.close();

            if (import.meta.env.DEV) {
                const syncResult = await Swal.fire({
                    title: '¿Ya pagaste?',
                    html: `
                        <p class="text-slate-500 mb-3">Ingresa el <strong>ID de pago</strong> de la URL de Mercado Pago.</p>
                        <div class="bg-slate-100 rounded-xl p-3 text-left text-xs font-mono text-slate-500 break-all">
                            ?payment_id=<span class="text-primary font-bold">&lt;ID&gt;</span>
                        </div>
                    `,
                    input: 'text',
                    inputPlaceholder: 'Ej: 1234567890',
                    showCancelButton: true,
                    confirmButtonText: 'Sincronizar',
                    cancelButtonText: 'Después',
                    confirmButtonColor: '#fe5c3c',
                    preConfirm: async (value) => {
                        if (!value) { Swal.showValidationMessage('Ingresa el ID'); return; }
                        try {
                            await subscriptionService.syncPayment(value);
                            await fetchSubscriptionData();
                            Swal.fire({ icon: 'success', title: '¡Plan activado!', timer: 2000, showConfirmButton: false });
                        } catch (err: any) {
                            Swal.showValidationMessage(err.response?.data?.message || 'Error al sincronizar.');
                        }
                    }
                });
                if (syncResult.value) fetchSubscriptionData();
            } else {
                Swal.fire({ icon: 'success', title: 'Redirigiendo a pago...', text: 'Se abrió MP en una nueva ventana.', timer: 2000, showConfirmButton: false });
            }
        } catch (error) {
            console.error("Error en checkout:", error);
            Swal.fire('Error', 'No se pudo procesar el pago.', 'error');
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-500 font-medium">Cargando suscripción...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
            <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
                <header className="text-center space-y-2">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                        Mi Suscripción
                        {mySub && <span className="text-primary block text-lg font-bold mt-1">{mySub.plan.nombre}</span>}
                    </h1>
                </header>

                {/* Grid de planes: actual + superiores */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-slate-900">Planes</h3>
                        {isPaidPlan && (
                            <button onClick={handleCancel} className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors">
                                Cancelar suscripción
                            </button>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-4">
                        {/* Plan actual - primera card */}
                        {mySub && (
                            <div className="rounded-2xl border-2 border-primary/30 bg-primary/[0.02] p-6 md:p-8 flex flex-col shadow-md relative">
                                <div className="absolute -top-3 left-6 bg-primary text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg">
                                    Tu Plan
                                </div>
                                <div className="mt-4 mb-4">
                                    <h4 className="text-xl font-black text-primary">{mySub.plan.nombre}</h4>
                                    <p className="text-sm text-slate-500 mt-1">{mySub.plan.descripcion}</p>
                                </div>
                                <div className="flex items-baseline gap-1 mb-6">
                                    {mySub.plan.precioMensual === 0 ? (
                                        <span className="text-2xl font-black text-slate-900">Gratis</span>
                                    ) : (
                                        <>
                                            <span className="text-3xl font-black text-slate-900">S/ {mySub.plan.precioMensual.toFixed(0)}</span>
                                            <span className="text-xs text-slate-400 font-bold uppercase">/mes</span>
                                        </>
                                    )}
                                </div>
                                <div className="space-y-3 mb-8 flex-1 text-sm">
                                    <FeatureItem text={mySub.plan.limiteMascotas <= 0 ? 'Mascotas Ilimitadas' : `Hasta ${mySub.plan.limiteMascotas} mascota${mySub.plan.limiteMascotas > 1 ? 's' : ''}`} />
                                    <FeatureItem text="Historial médico digital básico" />
                                    <FeatureItem text="Reserva de citas en veterinarias cercanas" />
                                    <FeatureItem text="Directorio de servicios pet" />
                                    <FeatureItem text={mySub.plan.limiteRecordatorios === -1 ? 'Recordatorios ilimitados' : mySub.plan.limiteRecordatorios > 0 ? `${mySub.plan.limiteRecordatorios} recordatorios/mes` : 'Sin recordatorios'} />
                                    <FeatureItem text={mySub.plan.limiteIaUso === 0 ? 'Sin asistente IA' : `${mySub.plan.limiteIaUso} consultas IA/mes`} />
                                    {mySub.plan.nombre.includes('Care') && <FeatureItem text="Teleconsultas veterinarias ilimitadas" />}
                                    {mySub.plan.nombre.includes('Care') && <FeatureItem text="Carnet digital de salud compartible" />}
                                    {mySub.plan.nombre.includes('Care') && <FeatureItem text="Mapa en tiempo real de paseadores y emergencias" />}
                                    {mySub.plan.nombre.includes('Care') && <FeatureItem text="Descuentos exclusivos en marketplace" />}
                                    {mySub.plan.nombre.includes('Premium') && <FeatureItem text="Usuarios familiares" />}
                                    {mySub.plan.nombre.includes('Premium') && <FeatureItem text="Alertas compartidas y álbum de recuerdos" />}
                                    {mySub.plan.nombre.includes('Premium') && <FeatureItem text="GPS + collar inteligente integración" />}
                                    {mySub.plan.nombre.includes('Premium') && <FeatureItem text="Seguro pet básico incluido" />}
                                    {mySub.plan.nombre.includes('Premium') && <FeatureItem text="Consultas prioritarias + segunda opinión" />}
                                    {mySub.plan.nombre.includes('Premium') && <FeatureItem text="Comunidad exclusiva + IA personalizada" />}
                                </div>
                                <Button disabled className="w-full py-4 rounded-xl font-bold text-sm bg-slate-50 border-slate-200 text-slate-400">
                                    Plan Actual
                                </Button>
                            </div>
                        )}

                        {/* Planes superiores */}
                        {upgradePlans.map((plan) => {
                            const isPopular = plan.nombre.toLowerCase().includes('care');
                            return (
                                <div key={plan.id} className={`rounded-2xl border bg-white p-6 md:p-8 flex flex-col transition-all hover:shadow-lg ${isPopular ? 'border-primary-dark shadow-md' : 'border-slate-200 hover:border-slate-300'}`}>
                                    {isPopular && <span className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">RECOMENDADO</span>}
                                    <h4 className="text-xl font-black text-slate-900 mb-2">{plan.nombre}</h4>
                                    <p className="text-sm text-slate-500 mb-4">{plan.descripcion}</p>
                                    <div className="flex items-baseline gap-1 mb-6">
                                        <span className="text-3xl font-black text-slate-900">S/ {plan.precioMensual}</span>
                                        <span className="text-xs text-slate-400 font-bold uppercase">/mes</span>
                                    </div>
                                    <div className="space-y-3 mb-8 flex-1 text-sm">
                                        <FeatureItem text={plan.limiteMascotas <= 0 ? 'Mascotas Ilimitadas' : `Hasta ${plan.limiteMascotas} mascota${plan.limiteMascotas > 1 ? 's' : ''}`} />
                                        <FeatureItem text={plan.nombre.includes('Care') || plan.nombre.includes('Premium') ? 'Historial médico completo con IA' : 'Historial médico digital básico'} />
                                        <FeatureItem text="Reserva de citas en veterinarias cercanas" />
                                        <FeatureItem text={plan.limiteRecordatorios === -1 ? 'Recordatorios inteligentes ilimitados' : plan.limiteRecordatorios > 0 ? `${plan.limiteRecordatorios} recordatorios/mes` : 'Sin recordatorios'} />
                                        <FeatureItem text={plan.limiteIaUso === 0 ? 'Sin asistente IA' : `${plan.limiteIaUso} consultas IA/mes`} />
                                        {(plan.nombre.includes('Care') || plan.nombre.includes('Premium')) && <FeatureItem text="Teleconsultas veterinarias ilimitadas" />}
                                        {plan.nombre.includes('Care') && <FeatureItem text="Carnet digital de salud compartible" />}
                                        {plan.nombre.includes('Care') && <FeatureItem text="Mapa en tiempo real de paseadores y emergencias" />}
                                        {plan.nombre.includes('Care') && <FeatureItem text="Descuentos exclusivos en marketplace" />}
                                        {plan.nombre.includes('Premium') && <FeatureItem text="Usuarios familiares + alertas compartidas" />}
                                        {plan.nombre.includes('Premium') && <FeatureItem text="GPS + collar inteligente integración" />}
                                        {plan.nombre.includes('Premium') && <FeatureItem text="Seguro pet básico incluido" />}
                                        {plan.nombre.includes('Premium') && <FeatureItem text="Consultas prioritarias + segunda opinión" />}
                                        {plan.nombre.includes('Premium') && <FeatureItem text="Comunidad exclusiva + IA personalizada" />}
                                    </div>
                                    <Button onClick={() => handleUpgrade(plan)} className="w-full py-4 rounded-xl font-bold text-sm">
                                        Subir a {plan.nombre}
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {isMaxPlan && isPaidPlan && (
                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-8 text-white text-center">
                        <p className="text-lg font-bold">Tienes el mejor plan. ¡Disfruta de todos los beneficios!</p>
                    </div>
                )}

                <div className="bg-slate-900 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 text-center md:text-left border border-white/5">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                        <AlertCircle size={24} />
                    </div>
                    <div className="flex-1 space-y-1">
                        <h4 className="text-lg font-bold text-white">¿Necesitas más?</h4>
                        <p className="text-sm text-slate-400">Planes personalizados para necesidades especiales.</p>
                    </div>
                    <Button variant="outline" className="shrink-0 border-slate-700 text-slate-300 hover:bg-slate-800 px-6 py-3 rounded-xl font-bold">
                        Contactar Soporte
                    </Button>
                </div>
            </div>
        </div>
    );
};

const FeatureItem = ({ text }: { text: string }) => (
    <div className="flex items-center gap-3 text-slate-600">
        <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
            <Check size={12} strokeWidth={4} />
        </div>
        <span>{text}</span>
    </div>
);
