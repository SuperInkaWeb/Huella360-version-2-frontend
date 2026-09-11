import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { authService } from "../services/authService";

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");

    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("Verificando tu cuenta...");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("Enlace de verificación inválido.");
            return;
        }

        const verify = async () => {
            try {
                await authService.verifyEmail(token);
                setStatus("success");
                setMessage("¡Tu correo ha sido verificado con éxito!");
            } catch (error: any) {
                setStatus("error");
                setMessage(error.response?.data?.message || "Ocurrió un error al verificar tu correo.");
            }
        };

        verify();
    }, [token]);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-12 px-4 shadow-xl sm:rounded-3xl sm:px-10 text-center border border-slate-100">
                    <div className="flex justify-center mb-6">
                        <div className={`p-4 rounded-2xl shadow-lg ${status === "loading" ? "bg-primary/10 text-primary" :
                            status === "success" ? "bg-green-100 text-green-600" :
                                "bg-red-100 text-red-600"
                            }`}>
                            {status === "loading" && <Loader2 className="h-10 w-10 animate-spin" />}
                            {status === "success" && <CheckCircle2 className="h-10 w-10" />}
                            {status === "error" && <XCircle className="h-10 w-10" />}
                        </div>
                    </div>

                    <h1 className="text-2xl font-bold text-slate-900 mb-4">
                        {status === "loading" ? "Verificando Correo" :
                            status === "success" ? "¡Cuenta Verificada!" :
                                "Error de Verificación"}
                    </h1>

                    <p className="text-slate-600 mb-8 px-4">
                        {message}
                    </p>

                    <Button
                        onClick={() => navigate("/login")}
                        className="w-full h-12 rounded-xl font-bold"
                    >
                        {status === "loading" ? "Esperando..." : "Ir al inicio de sesión"}
                    </Button>

                    {status === "error" && (
                        <p className="mt-6 text-sm text-slate-500">
                            ¿No recibiste el correo? Revisa tu carpeta de spam o contacta a soporte.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
