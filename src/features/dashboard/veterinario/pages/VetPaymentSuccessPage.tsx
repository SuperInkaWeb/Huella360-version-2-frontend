import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, ArrowRight, LayoutDashboard, Loader2 } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { api } from '../../../../shared/http/api';

export const VetPaymentSuccessPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { width, height } = useWindowSize();
    const [showConfetti, setShowConfetti] = useState(true);
    const [syncing, setSyncing] = useState(true);
    const [syncError, setSyncError] = useState<string | null>(null);

    const paymentId = searchParams.get('payment_id');
    const status = searchParams.get('status');

    useEffect(() => {
        const timer = setTimeout(() => setShowConfetti(false), 5000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!paymentId) {
            setSyncing(false);
            return;
        }
        api.post(`/subscriptions/sync-payment?paymentId=${paymentId}`)
            .then(() => setSyncing(false))
            .catch((err) => {
                setSyncing(false);
                const msg = err.response?.data?.message || err.message || 'Error al sincronizar el pago';
                setSyncError(msg);
            });
    }, [paymentId]);

    return (
        <div className="flex-1 flex items-center justify-center p-4 md:p-8 bg-slate-50 min-h-[80vh]">
            {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={500} gravity={0.1} />}

            <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 p-8 md:p-12 text-center space-y-8 animate-in zoom-in duration-500">
                <div className="flex justify-center">
                    {syncing ? (
                        <div className="w-24 h-24 bg-blue-500/10 rounded-[2rem] flex items-center justify-center text-blue-500 border border-blue-500/20 shadow-xl shadow-blue-500/10">
                            <Loader2 size={48} strokeWidth={2.5} className="animate-spin" />
                        </div>
                    ) : (
                        <div className="w-24 h-24 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-xl shadow-emerald-500/10">
                            <CheckCircle2 size={48} strokeWidth={2.5} />
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                        {syncing ? 'Activando tu plan...' : '¡Pago Completado!'}
                    </h1>
                    <p className="text-slate-500 font-medium">
                        {syncing
                            ? 'Estamos sincronizando tu pago y actualizando tu suscripción. Esto tomará solo unos segundos.'
                            : syncError
                                ? 'El pago fue procesado pero hubo un problema al activar tu plan. Puedes intentar desde la página de suscripción.'
                                : 'Tu plan ha sido activado exitosamente. Ya puedes disfrutar de todos los beneficios.'}
                    </p>
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
                        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-500 rounded-full text-[10px] font-black tracking-widest uppercase">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {status === 'approved' ? 'Aprobado' : 'Procesado'}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <Button
                        onClick={() => navigate('/portal/veterinario/')}
                        className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                    >
                        <LayoutDashboard size={18} />
                        Ir al Dashboard
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => navigate('/portal/veterinario/suscripcion')}
                        className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 border-2"
                    >
                        Ver mi Suscripción
                        <ArrowRight size={18} />
                    </Button>
                </div>
            </div>
        </div>
    );
};
