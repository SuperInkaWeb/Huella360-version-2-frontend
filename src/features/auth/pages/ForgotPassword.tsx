import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "../../../components/ui/Button"; // Asumiendo que este botón es configurable
import { authService } from "../services/authService";
import Swal from "sweetalert2";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsLoading(true);
        try {
            await authService.forgotPassword({ correo: email });
            setIsSent(true);
            Swal.fire({
                icon: "success",
                title: "Correo Enviado",
                text: "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.",
                confirmButtonColor: '#1ea59c', // Teal Primario
            });
        } catch (error: any) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error.response?.data?.message || "Ocurrió un error al procesar tu solicitud.",
                confirmButtonColor: '#2D3E82', // Navy Secundario
            });
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Componente Visual Elegante para la cabecera (Sin placeholder)
     * Reemplaza el simple Mail icon de la versión anterior.
     */
    const StatusVisual = ({ mode }: { mode: 'request' | 'sent' }) => (
        <div className="w-24 h-24 mx-auto mb-10 relative group">
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-tr from-[#2D3E82] to-[#1ea59c] p-[2px] shadow-lg transform transition-transform duration-700 hover:rotate-y-12 hover:scale-105">
                    <div className="w-full h-full bg-[#f6f8f8] rounded-[calc(2rem-2px)] overflow-hidden relative">
                    {/* Formas abstractas internas para dinamismo */}
                    <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#1ea59c]/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-[#2D3E82]/20 rounded-full blur-3xl animate-pulse delay-700"></div>
                    
                    {/* Tarjeta de cristal flotante interna con el icono */}
                    <div className="absolute inset-4 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center transform transition-all duration-500 hover:scale-110">
                        {mode === 'request' ? (
                            <Mail className="h-8 w-8 text-[#1ea59c]" strokeWidth={2.5} />
                        ) : (
                            <CheckCircle2 className="h-10 w-10 text-[#1ea59c]" strokeWidth={2.5} />
                        )}
                    </div>
                </div>
            </div>
             {/* Resplandor decorativo de fondo */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-1/2 h-4 bg-[#1ea59c]/20 blur-[15px] rounded-full pointer-events-none group-hover:bg-[#1ea59c]/40"></div>
        </div>
    );

    /**
     * Contenedor base con Glassmorphism y sombras suaves
     */
    const GlassCard = ({ children, isSent }: { children: React.ReactNode, isSent: boolean }) => (
        <div className="min-h-screen bg-[#f6f8f8] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-montserrat transition-colors duration-500">
            <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
                <div className={`relative rounded-[2rem] p-1 bg-white/40 backdrop-blur-xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden group animate-fade-in-up ${isSent ? 'text-center' : ''}`}>
                    
                    {/* Resplandor decorativo de fondo del card */}
                    <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-3/4 h-48 bg-[#1ea59c]/15 blur-[80px] rounded-full pointer-events-none transition-all duration-700 group-hover:bg-[#1ea59c]/25"></div>

                    <div className="relative z-10 p-10 md:p-12">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );

    if (isSent) {
        return (
            <GlassCard isSent={true}>
                <StatusVisual mode="sent" />
                
                <h2 className="text-3xl font-extrabold text-[#2D3E82] tracking-tight leading-tight mb-4">
                    ¡Correo Enviado!
                </h2>
                <p className="text-base text-gray-600 leading-relaxed font-medium mb-10 px-4">
                    Hemos enviado un enlace de recuperación a la dirección 
                    <strong className="text-[#1ea59c] font-semibold"> {email}</strong>. 
                    Por favor, revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu acceso.
                </p>
                <Link to="/login">
                    {/* Botón Primario con Teal #1ea59c y micro-animaciones */}
                    <Button className="w-full px-8 py-3.5 rounded-full bg-[#1ea59c] text-white font-semibold tracking-wide shadow-lg shadow-[#1ea59c]/30 hover:shadow-[#1ea59c]/50 hover:-translate-y-1 active:translate-y-0 active:scale-95 transition-all duration-300 h-14">
                        Volver al inicio de sesión
                    </Button>
                </Link>
            </GlassCard>
        );
    }

    return (
        <GlassCard isSent={false}>
            <StatusVisual mode="request" />
            
            <h2 className="text-3xl font-extrabold text-[#2D3E82] tracking-tight leading-tight mb-3 px-6">
                ¿Olvidaste tu contraseña?
            </h2>
            <p className="text-base text-gray-600 leading-relaxed font-medium mb-10 px-4">
                No te preocupes, introduce tu correo y te enviaremos instrucciones detalladas para restablecerla de forma segura.
            </p>

            <form className="space-y-7" onSubmit={handleSubmit}>
                <div className="text-left">
                    <label htmlFor="email" className="block text-sm font-semibold text-[#2D3E82] mb-2">
                        Correo Electrónico
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-[#2D3E82]/60" />
                        </div>
                        {/* Input estilizado con border-primary #1ea59c y shadow-soft */}
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="appearance-none block w-full pl-11 pr-4 py-3.5 border border-[#2D3E82]/10 bg-white/50 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1ea59c]/20 focus:border-[#1ea59c] transition-all text-sm font-medium shadow-soft text-gray-900"
                            placeholder="tu@correo.com"
                        />
                    </div>
                </div>

                <div>
                    {/* Botón Primario Teal con micro-animaciones */}
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-3.5 px-4 rounded-full shadow-lg shadow-[#1ea59c]/30 text-sm font-bold text-white bg-[#1ea59c] hover:bg-[#1ea59c]/90 hover:shadow-[#1ea59c]/50 hover:-translate-y-1 active:translate-y-0 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1ea59c] duration-200 h-14"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                                Enviando...
                            </>
                        ) : (
                            "Enviar enlace de recuperación"
                        )}
                    </Button>
                </div>
            </form>

            <div className="mt-9">
                {/* Enlace con Teal Primario #1ea59c y hover effect */}
                <Link
                    to="/login"
                    className="flex items-center justify-center text-sm font-semibold text-[#1ea59c] hover:text-[#1ea59c]/80 active:scale-95 transition-all group"
                >
                    <ArrowLeft className="mr-2 h-4 w-4 transform transition-transform group-hover:-translate-x-1" strokeWidth={2.5} />
                    Volver al inicio de sesión
                </Link>
            </div>
        </GlassCard>
    );
}