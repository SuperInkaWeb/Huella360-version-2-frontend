import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, ArrowRight, LayoutDashboard, Loader2, XCircle, Clock } from 'lucide-react';
import { Button } from '../../../../../components/ui/Button';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { subscriptionService } from '../services/subscriptionService';

interface SubscriptionPaymentResultProps {
    homePath: string;
    homeLabel: string;
    subscriptionPath: string;
}

type Resultado = 'approved' | 'pending' | 'failed';

// Mercado Pago vuelve a esta misma pantalla con cualquier resultado (success, failure y pending
// apuntan aqui): el estado real viene en ?status=. Sin payment_id o con otro estado, no hubo pago.
const resolverResultado = (paymentId: string | null, status: string | null): Resultado => {
    if (!paymentId) return 'failed';
    if (status === 'approved') return 'approved';
    if (status === 'pending' || status === 'in_process') return 'pending';
    return 'failed';
};

export const SubscriptionPaymentResult = ({ homePath, homeLabel, subscriptionPath }: SubscriptionPaymentResultProps) => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { width, height } = useWindowSize();

    const paymentId = searchParams.get('payment_id');
    const externalReference = searchParams.get('external_reference') || undefined;
    const resultado = resolverResultado(paymentId, searchParams.get('status'));

    const [showConfetti, setShowConfetti] = useState(true);
    const [syncing, setSyncing] = useState(resultado === 'approved');
    const [syncError, setSyncError] = useState<string | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => setShowConfetti(false), 5000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (resultado !== 'approved' || !paymentId) return;
        // GET /payments/sync (valida que el pago sea del usuario y que este aprobado antes de activar el plan).
        subscriptionService.syncPayment(paymentId, externalReference)
            .then(() => setSyncing(false))
            .catch((err) => {
                setSyncing(false);
                const msg = err.response?.data?.message || err.message || 'Error al sincronizar el pago';
                setSyncError(msg);
            });
    }, [resultado, paymentId, externalReference]);

    const aprobado = resultado === 'approved';
    const titulo = syncing
        ? 'Activando tu plan...'
        : aprobado
            ? '¡Pago Completado!'
            : resultado === 'pending' ? 'Pago en revisión' : 'El pago no se completó';
    const descripcion = syncing
        ? 'Estamos sincronizando tu pago y actualizando tu suscripción. Esto tomará solo unos segundos.'
        : aprobado
            ? syncError
                ? 'El pago fue procesado pero hubo un problema al activar tu plan. Puedes intentar desde la página de suscripción.'
                : 'Tu plan ha sido activado exitosamente. Ya puedes disfrutar de todos los beneficios.'
            : resultado === 'pending'
                ? 'Mercado Pago todavía está confirmando tu pago. Tu plan se activará automáticamente cuando se apruebe.'
                : 'Mercado Pago no aprobó el pago o se canceló antes de terminar. No se realizó ningún cobro y tu plan no cambió.';

    return (
        <div className="flex-1 flex items-center justify-center p-4 md:p-8 bg-slate-50 min-h-[80vh]">
            {aprobado && showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={500} gravity={0.1} />}

            <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 p-8 md:p-12 text-center space-y-8 animate-in zoom-in duration-500">
                <div className="flex justify-center">
                    {syncing ? (
                        <div className="w-24 h-24 bg-blue-500/10 rounded-[2rem] flex items-center justify-center text-blue-500 border border-blue-500/20 shadow-xl shadow-blue-500/10">
                            <Loader2 size={48} strokeWidth={2.5} className="animate-spin" />
                        </div>
                    ) : aprobado ? (
                        <div className="w-24 h-24 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-xl shadow-emerald-500/10">
                            <CheckCircle2 size={48} strokeWidth={2.5} />
                        </div>
                    ) : resultado === 'pending' ? (
                        <div className="w-24 h-24 bg-amber-500/10 rounded-[2rem] flex items-center justify-center text-amber-500 border border-amber-500/20 shadow-xl shadow-amber-500/10">
                            <Clock size={48} strokeWidth={2.5} />
                        </div>
                    ) : (
                        <div className="w-24 h-24 bg-red-500/10 rounded-[2rem] flex items-center justify-center text-red-500 border border-red-500/20 shadow-xl shadow-red-500/10">
                            <XCircle size={48} strokeWidth={2.5} />
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">{titulo}</h1>
                    <p className="text-slate-500 font-medium">{descripcion}</p>
                </div>

                {syncError && (
                    <div className="bg-red-50 rounded-2xl p-4 border border-red-100">
                        <p className="text-red-600 text-sm font-medium">{syncError}</p>
                    </div>
                )}

                <div className="bg-slate-50 rounded-2xl p-6 text-left space-y-4 border border-slate-100">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">ID de Pago</span>
                        <span className="text-slate-900 font-mono font-bold">{paymentId || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Estado</span>
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${aprobado ? 'bg-emerald-500/20 text-emerald-500' : resultado === 'pending' ? 'bg-amber-500/20 text-amber-600' : 'bg-red-500/20 text-red-500'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${aprobado ? 'bg-emerald-500' : resultado === 'pending' ? 'bg-amber-500' : 'bg-red-500'}`} />
                            {aprobado ? 'Aprobado' : resultado === 'pending' ? 'En revisión' : 'No completado'}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    {resultado === 'failed' ? (
                        <>
                            <Button
                                onClick={() => navigate(subscriptionPath)}
                                className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                            >
                                Intentar de nuevo
                                <ArrowRight size={18} />
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => navigate(homePath)}
                                className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 border-2"
                            >
                                <LayoutDashboard size={18} />
                                {homeLabel}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                onClick={() => navigate(homePath)}
                                className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                            >
                                <LayoutDashboard size={18} />
                                {homeLabel}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => navigate(subscriptionPath)}
                                className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 border-2"
                            >
                                Ver mi Suscripción
                                <ArrowRight size={18} />
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
