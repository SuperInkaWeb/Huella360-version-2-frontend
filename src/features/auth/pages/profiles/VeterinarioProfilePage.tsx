import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Stethoscope, Award, FileText, Clock, Check } from "lucide-react";
import { WizardLayout } from "../../../../components/ui/WizardLayout";
import { profileService } from "../../services/profileService";
import { useAuth } from "../../../auth/context/useAuth";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const vetSchema = z.object({
  nombres: z.string().min(2, "Los nombres deben tener al menos 2 caracteres"),
  apellidos: z.string().min(2, "Los apellidos deben tener al menos 2 caracteres"),
  especialidad: z.string().min(2, "La especialidad es requerida"),
  numeroColegiatura: z
    .string()
    .min(4, "El número de colegiatura debe tener al menos 4 dígitos")
    .regex(/^\d+$/, "Solo debe contener números"),
  biografia: z.string().optional(),
  aniosExperiencia: z.coerce.number().min(0, "Debe ser 0 o más"),
});

type VetFormData = z.infer<typeof vetSchema>;

const STEPS = [
  { label: "Datos personales", icon: User },
  { label: "Datos profesionales", icon: Stethoscope },
  { label: "Listo", icon: Check },
];

export const VeterinarioProfilePage = () => {
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
  } = useForm<VetFormData>({
    resolver: zodResolver(vetSchema) as any,
    defaultValues: { aniosExperiencia: 0 },
  });

  useEffect(() => {
    profileService
      .getVeterinarioProfile()
      .then(() => {
        setPerfilCompleto(true);
        navigate("/portal/veterinario", { replace: true });
      })
      .catch(() => setIsLoading(false));
  }, [navigate, setPerfilCompleto]);

  const handleNext = async () => {
    let valid = false;
    if (step === 0) {
      valid = await trigger(["nombres", "apellidos"]);
    } else if (step === 1) {
      valid = await trigger(["especialidad", "numeroColegiatura", "aniosExperiencia"]);
    }
    if (valid) setStep((s) => s + 1);
  };

  const handleBack = () => setStep((s) => s - 1);

  const onSubmit = async (data: VetFormData) => {
    setIsSubmitting(true);
    try {
      await profileService.createVeterinarioProfile(data);
      setPerfilCompleto(true);
      Swal.fire({
        icon: "success",
        title: "¡Perfil completado!",
        text: "Tu perfil profesional ha sido creado.",
        timer: 2000,
        showConfirmButton: false,
        position: "top-end",
        toast: true,
      });
      setTimeout(() => navigate("/portal/veterinario", { replace: true }), 1500);
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
      title="Configura tu perfil profesional"
      subtitle="Ingresa tus datos para que los pacientes te encuentren"
      onBack={step > 0 && step < 2 ? handleBack : undefined}
      onNext={step < 2 ? handleNext : undefined}
      onSubmit={step === 2 ? handleSubmit(onSubmit as any) : undefined}
      isSubmitting={isSubmitting}
      isLastStep={step === 2}
      nextLabel="Ir al Portal Médico"
      isLoading={isLoading}
    >
      {step === 0 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">Datos personales</h2>
            <p className="text-sm text-slate-500">Tu nombre será visible para los pacientes.</p>
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
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">Datos profesionales</h2>
            <p className="text-sm text-slate-500">Información de tu experiencia y especialidad.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Especialidad</label>
              <div className="relative">
                <Stethoscope size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  {...register("especialidad")}
                  placeholder="Ej: Medicina Interna"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-[#1ea59c]/20 focus:border-[#1ea59c] outline-none transition-all"
                />
              </div>
              {errors.especialidad && <p className="text-xs text-red-500 mt-1">{errors.especialidad.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">N° Colegiatura</label>
                <div className="relative">
                  <Award size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    {...register("numeroColegiatura")}
                    placeholder="Ej: 12345"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-[#1ea59c]/20 focus:border-[#1ea59c] outline-none transition-all"
                  />
                </div>
                {errors.numeroColegiatura && (
                  <p className="text-xs text-red-500 mt-1">{errors.numeroColegiatura.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Años de experiencia</label>
                <div className="relative">
                  <Clock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    {...register("aniosExperiencia", { valueAsNumber: true })}
                    type="number"
                    min={0}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-[#1ea59c]/20 focus:border-[#1ea59c] outline-none transition-all"
                  />
                </div>
                {errors.aniosExperiencia && (
                  <p className="text-xs text-red-500 mt-1">{errors.aniosExperiencia.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Biografía <span className="text-slate-400 font-normal">(opcional)</span>
              </label>
              <div className="relative">
                <FileText size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <textarea
                  {...register("biografia")}
                  rows={3}
                  placeholder="Cuéntanos sobre tu experiencia..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-[#1ea59c]/20 focus:border-[#1ea59c] outline-none transition-all resize-none"
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
          <h2 className="text-xl font-bold text-slate-900 mb-2">¡Perfil profesional listo!</h2>
          <p className="text-sm text-slate-500 max-w-xs mx-auto">
            Tu información ha sido guardada. Haz clic en "Ir al Portal Médico" para comenzar.
          </p>
        </div>
      )}
    </WizardLayout>
  );
};
