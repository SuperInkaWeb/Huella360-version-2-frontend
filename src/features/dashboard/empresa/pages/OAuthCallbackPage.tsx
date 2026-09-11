import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { api } from "../../../../shared/http/api";
import Swal from "sweetalert2";

export const OAuthCallbackPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("Conectando con Mercado Pago...");

    useEffect(() => {
        const code = searchParams.get("code");
        if (!code) {
            setStatus("error");
            setMessage("No se recibió el código de autorización.");
            return;
        }

        const exchangeToken = async () => {
            try {
                // La redirect_uri debe ser la misma que configuraste en MP
                const redirectUri = window.location.origin + window.location.pathname;

                console.log("Iniciando intercambio de token:", {
                    code: code.substring(0, 5) + "...",
                    redirectUri
                });

                await api.post("/oauth/mercadopago/exchange", {
                    code,
                    redirectUri
                });

                setStatus("success");
                setMessage("¡Cuenta conectada correctamente!");

                Swal.fire({
                    icon: "success",
                    title: "¡Éxito!",
                    text: "Tu cuenta de Mercado Pago ha sido vinculada.",
                    timer: 3000,
                    showConfirmButton: false
                }).then(() => {
                    navigate("/portal/empresa/configuracion");
                });

            } catch (error) {
                console.error("Error en el intercambio de OAuth:", error);
                setStatus("error");
                setMessage("Hubo un error al vincular tu cuenta. Por favor, reintenta.");
                Swal.fire("Error", "No se pudo vincular la cuenta.", "error");
            }
        };

        exchangeToken();
    }, [searchParams, navigate]);

    return (
        <div className="h-full flex items-center justify-center p-6 text-center">
            <div className="max-w-md w-full space-y-6">
                {status === "loading" && (
                    <>
                        <Loader2 className="h-16 w-16 text-primary animate-spin mx-auto" />
                        <h1 className="text-2xl font-bold text-slate-900">{message}</h1>
                        <p className="text-slate-500">Por favor, no cierres esta ventana.</p>
                    </>
                )}

                {status === "success" && (
                    <>
                        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
                        <h1 className="text-2xl font-bold text-slate-900">¡Vínculo Exitoso!</h1>
                        <p className="text-slate-500">Redirigiéndote de vuelta...</p>
                    </>
                )}

                {status === "error" && (
                    <>
                        <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
                        <h1 className="text-2xl font-bold text-slate-900">Error de Conexión</h1>
                        <p className="text-slate-500">{message}</p>
                        <button
                            onClick={() => navigate("/portal/empresa/configuracion")}
                            className="mt-6 px-6 py-2 bg-primary text-white rounded-xl font-medium"
                        >
                            Volver a Configuración
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};
