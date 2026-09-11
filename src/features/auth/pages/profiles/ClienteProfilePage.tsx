import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Phone, MapPin, Check, Home, Globe } from "lucide-react";
import { WizardLayout } from "../../../../components/ui/WizardLayout";
import { profileService } from "../../services/profileService";
import { referralService } from "../../../dashboard/cliente/services/referralService";
import { useAuth } from "../../../auth/context/useAuth";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const clienteSchema = z.object({
  nombres: z.string().min(2, "Los nombres deben tener al menos 2 caracteres"),
  apellidos: z.string().min(2, "Los apellidos deben tener al menos 2 caracteres"),
  telefono: z
    .string()
    .min(6, "El teléfono debe tener al menos 6 dígitos")
    .regex(/^\d+$/, "El teléfono solo debe contener números"),
  direccion: z.string().optional(),
  ciudad: z.string().optional(),
  pais: z.string().optional().default("Peru"),
});

type ClienteFormData = z.infer<typeof clienteSchema>;

const STEPS = [
  { label: "Datos personales", icon: User },
  { label: "Ubicación", icon: MapPin },
  { label: "Listo", icon: Check },
];

export const ClienteProfilePage = () => {
  const { setPerfilCompleto } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema) as any,
    defaultValues: { pais: "Peru" },
  });

  useEffect(() => {
    profileService
      .getClienteProfile()
      .then(() => {
        setPerfilCompleto(true);
        navigate("/portal/cliente", { replace: true });
      })
      .catch(() => setIsLoading(false));
  }, [navigate, setPerfilCompleto]);

  const handleNext = async () => {
    let valid = false;
    if (step === 0) {
      valid = await trigger(["nombres", "apellidos", "telefono"]);
    } else if (step === 1) {
      valid = true; // Ubicación es opcional
    }
    if (valid) setStep((s) => s + 1);
  };

  const handleBack = () => setStep((s) => s - 1);

  const onSubmit = async (data: ClienteFormData) => {
    setIsSubmitting(true);
    try {
      await profileService.createClienteProfile(data);

      const pendingRef = sessionStorage.getItem("pendingReferralCode");
      if (pendingRef) {
        try {
          await referralService.applyCode(pendingRef);
        } catch {
          // Código inválido o ya utilizado: no bloqueamos el registro
        }
        sessionStorage.removeItem("pendingReferralCode");
      }

      setPerfilCompleto(true);
      Swal.fire({
        icon: "success",
        title: "¡Perfil completado!",
        text: "Tu cuenta ha sido creada exitosamente.",
        timer: 2000,
        showConfirmButton: false,
        position: "top-end",
        toast: true,
      });
      setTimeout(() => navigate("/portal/cliente", { replace: true }), 1500);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || "Error al guardar el perfil. Inténtalo de nuevo.";
      Swal.fire({
        icon: "error",
        title: "Error",
        html: `<p class="text-sm text-slate-600">${msg}</p>`,
        confirmButtonColor: "#1ea59c",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <WizardLayout
      steps={STEPS}
      currentStep={step}
      title="Completa tu perfil"
      subtitle="Cuéntanos sobre ti para personalizar tu experiencia"
      onBack={step > 0 && step < 2 ? handleBack : undefined}
      onNext={step < 2 ? handleNext : undefined}
      onSubmit={step === 2 ? handleSubmit(onSubmit as any) : undefined}
      isSubmitting={isSubmitting}
      isLastStep={step === 2}
      nextLabel="Crear mi cuenta"
      isLoading={isLoading}
    >
      {step === 0 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">Datos personales</h2>
            <p className="text-sm text-slate-500">Ingresa tu nombre completo y teléfono de contacto.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nombres</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  {...register("nombres")}
                  placeholder="Tus nombres"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-[#1ea59c]/20 focus:border-[#1ea59c] outline-none transition-all"
                />
              </div>
              {errors.nombres && <p className="text-xs text-red-500 mt-1">{errors.nombres.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Apellidos</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  {...register("apellidos")}
                  placeholder="Tus apellidos"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-[#1ea59c]/20 focus:border-[#1ea59c] outline-none transition-all"
                />
              </div>
              {errors.apellidos && <p className="text-xs text-red-500 mt-1">{errors.apellidos.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Teléfono</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  {...register("telefono")}
                  type="tel"
                  placeholder="Ej: 999888777"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-[#1ea59c]/20 focus:border-[#1ea59c] outline-none transition-all"
                />
              </div>
              {errors.telefono && <p className="text-xs text-red-500 mt-1">{errors.telefono.message}</p>}
            </div>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">Tu ubicación</h2>
            <p className="text-sm text-slate-500">Opcional. Ayuda a encontrar servicios cerca de ti.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Dirección</label>
              <div className="relative">
                <Home size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  {...register("direccion")}
                  placeholder="Calle, número, distrito"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-[#1ea59c]/20 focus:border-[#1ea59c] outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ciudad</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  {...register("ciudad")}
                  placeholder="Ej: Lima"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-[#1ea59c]/20 focus:border-[#1ea59c] outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">País</label>
              <div className="relative">
                <Globe size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  {...register("pais")}
                  defaultValue="Peru"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-[#1ea59c]/20 focus:border-[#1ea59c] outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-[#1ea59c]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-[#1ea59c]" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">¡Todo listo!</h2>
          <p className="text-sm text-slate-500 max-w-xs mx-auto">
            Tu perfil está configurado. Haz clic en "Crear mi cuenta" para comenzar a usar Huella360.
          </p>
        </div>
      )}
    </WizardLayout>
  );
};
