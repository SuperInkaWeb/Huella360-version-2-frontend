import { useState } from "react";
import { MailCheck, LogOut, RefreshCw } from "lucide-react";

interface Props {
    correo?: string | null;
    mensaje?: string | null;
    /** Pide un nuevo enlace. Devuelve el texto a mostrar; si falla, lanza un Error con el motivo. */
    onReenviar: () => Promise<string>;
    /** Vuelve a consultar el estado. Devuelve true si el correo ya quedó verificado. */
    onYaVerifique: () => Promise<boolean>;
    onCerrarSesion: () => void;
}

/**
 * H360-SEC-002: la cuenta no se puede usar hasta verificar el correo (decisión de Alexis, 16/10).
 * Se muestra en lugar de la app cuando el backend responde verificacionPendiente o EMAIL_NOT_VERIFIED.
 */
export const VerificarCorreoPantalla = ({ correo, mensaje, onReenviar, onYaVerifique, onCerrarSesion }: Props) => {
    const [aviso, setAviso] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);
    const [enviando, setEnviando] = useState(false);
    const [revisando, setRevisando] = useState(false);

    const reenviar = async () => {
        setEnviando(true);
        setAviso(null);
        try {
            setAviso({ tipo: "ok", texto: await onReenviar() });
        } catch (e) {
            setAviso({ tipo: "error", texto: e instanceof Error ? e.message : "No pudimos reenviar el enlace." });
        } finally {
            setEnviando(false);
        }
    };

    const yaVerifique = async () => {
        setRevisando(true);
        setAviso(null);
        try {
            const verificado = await onYaVerifique();
            if (!verificado) {
                setAviso({
                    tipo: "error",
                    texto: "Todavía no vemos tu correo verificado. Abre el enlace del correo y vuelve a intentarlo.",
                });
            }
        } catch {
            setAviso({ tipo: "error", texto: "No pudimos comprobarlo. Inténtalo de nuevo en unos segundos." });
        } finally {
            setRevisando(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
                <div className="mx-auto w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center mb-4">
                    <MailCheck className="text-[#1ea59c]" size={28} />
                </div>
                <h1 className="text-xl font-bold text-slate-800">Verifica tu correo</h1>
                <p className="mt-2 text-slate-600">
                    {mensaje || "Para usar tu cuenta necesitamos confirmar que el correo es tuyo."}
                </p>
                {correo && (
                    <p className="mt-3 text-sm text-slate-500">
                        Enviamos el enlace a <span className="font-semibold text-slate-700">{correo}</span>. Revisa
                        también la carpeta de spam.
                    </p>
                )}

                {aviso && (
                    <p
                        role={aviso.tipo === "error" ? "alert" : "status"}
                        className={`mt-4 text-sm rounded-lg px-3 py-2 ${
                            aviso.tipo === "ok" ? "bg-teal-50 text-teal-700" : "bg-red-50 text-red-700"
                        }`}
                    >
                        {aviso.texto}
                    </p>
                )}

                <div className="mt-6 flex flex-col gap-3">
                    <button
                        type="button"
                        onClick={yaVerifique}
                        disabled={revisando}
                        className="w-full rounded-xl bg-[#1ea59c] text-white font-semibold py-3 hover:bg-[#188a82] disabled:opacity-60"
                    >
                        {revisando ? "Comprobando..." : "Ya verifiqué mi correo"}
                    </button>
                    <button
                        type="button"
                        onClick={reenviar}
                        disabled={enviando}
                        className="w-full rounded-xl border border-slate-300 text-slate-700 font-medium py-3 hover:bg-slate-50 disabled:opacity-60 inline-flex items-center justify-center gap-2"
                    >
                        <RefreshCw size={16} className={enviando ? "animate-spin" : ""} />
                        {enviando ? "Enviando..." : "Reenviar enlace"}
                    </button>
                    <button
                        type="button"
                        onClick={onCerrarSesion}
                        className="w-full text-sm text-slate-500 hover:text-slate-700 py-2 inline-flex items-center justify-center gap-2"
                    >
                        <LogOut size={16} />
                        Cerrar sesión
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerificarCorreoPantalla;
